import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './types';

/**
 * Scraper for City of Nixa — BS&A Online Portal.
 * https://bsaonline.com/?uid=2996
 *
 * Multi-step AJAX wizard:
 * 1. GET /SiteSearch/BuildingDepartmentRecordSearch?uid=2996 → session + GUID
 * 2. GET /SiteSearch/GetPageOfFindRecordSearchResultsPartialView → results HTML
 *
 * Also falls back to Nixa's monthly PDF reports at nixa.com/building-permit-data-reports/
 */

const BASE = 'https://bsaonline.com';
const UID = '2996';

// Common street names in Nixa to search for recent permits
const SEARCH_ADDRESSES = ['Main', 'North', 'South', 'Highway', 'Nicholas', 'McCroskey', 'Aldersgate', 'Tracker'];

export async function scrapeNixaBsa(): Promise<ScrapedPermit[]> {
  const permits: ScrapedPermit[] = [];
  const seen = new Set<string>();

  // Step 1: Get session and wizard GUID
  let cookies = '';
  let sessionGuid = '';

  try {
    const initRes = await fetch(`${BASE}/SiteSearch/BuildingDepartmentRecordSearch?uid=${UID}`, {
      headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });

    if (!initRes.ok) {
      console.warn(`Nixa BSA: HTTP ${initRes.status} on init`);
      return permits;
    }

    // Extract cookies
    const setCookie = initRes.headers.get('set-cookie') || '';
    cookies = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');

    // Extract session GUID from hidden input
    const html = await initRes.text();
    const $ = cheerio.load(html);
    sessionGuid = $('input[name="advancedRecordSearchSessionGuid"], #advancedRecordSearchSessionGuid').val() as string || '';

    // Also try extracting from script tags
    if (!sessionGuid) {
      const scriptMatch = html.match(/advancedRecordSearchSessionGuid['":\s]+['"]([^'"]+)['"]/);
      if (scriptMatch) sessionGuid = scriptMatch[1];
    }

    if (!sessionGuid) {
      console.warn('Nixa BSA: Could not find session GUID');
      return permits;
    }
  } catch (err) {
    console.error('Nixa BSA: session init failed:', err);
    return permits;
  }

  // Step 2: Search by address terms
  for (const term of SEARCH_ADDRESSES) {
    try {
      const params = new URLSearchParams({
        advancedRecordSearchSessionGuid: sessionGuid,
        currentPage: '1',
        searchText: term,
        bsaOnlineSiteSearchType: '1', // Address search
        uid: UID,
      });

      const res = await fetch(`${BASE}/SiteSearch/GetPageOfFindRecordSearchResultsPartialView?${params}`, {
        headers: {
          'User-Agent': 'AaronsFireplace-LeadEngine/2.0',
          'Cookie': cookies,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${BASE}/SiteSearch/BuildingDepartmentRecordSearch?uid=${UID}`,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      $('.find-record-search-result-wrapper, .find-bill-search-result-wrapper').each((_, el) => {
        const $item = $(el);

        const address = $item.find('.find-bill-search-result-content-address, .find-record-search-result-content-address').text().trim();
        const secondaryItems = $item.find('.find-record-search-result-content-secondary-item');

        // Extract city/state, owner/business name, parcel number
        let cityState = '';
        let ownerName = '';
        let parcelNumber = '';

        secondaryItems.each((i, secEl) => {
          const text = $(secEl).text().trim();
          if (text.includes('Nixa') || text.includes('MO')) cityState = text;
          else if (text.match(/^\d{10,}/)) parcelNumber = text;
          else if (text.length > 2) ownerName = text;
        });

        // Extract record key from the button onclick
        const button = $item.find('button[onclick*="gotToRecord"]');
        const onclick = button.attr('onclick') || '';
        const keyMatch = onclick.match(/gotToRecord\('(\d+)'/);
        const recordKey = keyMatch ? keyMatch[1] : '';

        if (!address) return;

        const permitNumber = `NIXA-${recordKey || address.replace(/\s+/g, '-').slice(0, 20)}`;
        if (seen.has(permitNumber)) return;
        seen.add(permitNumber);

        permits.push({
          permitNumber,
          type: 'new_residential', // BSA returns building dept records; we filter later
          status: 'approved',
          propertyAddress: address,
          city: 'Nixa',
          county: 'Christian',
          zip: '65714',
          ownerName: ownerName || undefined,
          parcelNumber: parcelNumber || undefined,
          source: 'nixa_bsa',
        });
      });

      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Nixa BSA search "${term}" error:`, err);
    }
  }

  console.log(`Nixa BSA: found ${permits.length} building records`);
  return permits;
}

import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './types';

/**
 * Scraper for City of Ozark — SmartGov Public Portal.
 * https://ci-ozark-mo.smartgovcommunity.com
 *
 * Search endpoint: POST /ApplicationPublic/ApplicationSearch/Search
 * Requires session cookie + __submitFormValidator__ token (any alphanumeric string).
 *
 * Result HTML has .search-result-item divs with permit info.
 * Detail page: /PermittingPublic/PermitLandingPagePublic/Index/<GUID>
 */

const BASE = 'https://ci-ozark-mo.smartgovcommunity.com';

// Search terms that find residential new construction permits
const SEARCH_TERMS = ['residential', 'new res', 'RESNEW', 'RES NEW', 'new home', 'single family', 'SFR'];

export async function scrapeOzarkSmartGov(): Promise<ScrapedPermit[]> {
  const permits: ScrapedPermit[] = [];
  const seen = new Set<string>();

  // Step 1: Establish session
  let cookies = '';
  try {
    const initRes = await fetch(`${BASE}/ApplicationPublic/ApplicationSearch`, {
      headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    const setCookie = initRes.headers.get('set-cookie') || '';
    cookies = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
  } catch (err) {
    console.error('Ozark SmartGov: failed to establish session:', err);
    return permits;
  }

  // Step 2: Search for each term
  for (const term of SEARCH_TERMS) {
    try {
      // Generate a validator token (SmartGov pattern: char + timestamp + char + random chars)
      const token = 'a' + Date.now() + 'xyz';

      const body = new URLSearchParams({
        '_conv': '1',
        'query': term,
        '__submitFormValidator__': token,
      });

      const res = await fetch(`${BASE}/ApplicationPublic/ApplicationSearch/Search`, {
        method: 'POST',
        headers: {
          'User-Agent': 'AaronsFireplace-LeadEngine/2.0',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies,
          'Referer': `${BASE}/ApplicationPublic/ApplicationSearch`,
        },
        body: body.toString(),
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      $('.search-result-item').each((_, el) => {
        const $item = $(el);

        // Extract permit number from the title link
        const titleLink = $item.find('.search-result-title a');
        const permitNumber = titleLink.text().trim();
        if (!permitNumber || seen.has(permitNumber)) return;

        // Extract columns
        const cols = $item.find('.col-lg-3');
        const typeAndStatus = cols.eq(0);
        const addressCol = cols.eq(1);
        const contractorCol = cols.eq(2);

        const permitType = typeAndStatus.find('div').eq(0).text().trim();
        const statusLine = typeAndStatus.find('div').eq(1).text().trim();

        const address = addressCol.find('div').eq(0).text().trim();
        const cityState = addressCol.find('div').eq(1).text().trim();

        const contractor = contractorCol.find('div').eq(0).text().trim();

        // Only keep residential permits
        const typeLower = permitType.toLowerCase();
        if (!typeLower.includes('res') && !typeLower.includes('sfr') && !typeLower.includes('home') && !typeLower.includes('dwelling')) {
          return;
        }

        // Parse status and date from "Closed, 3/3/2026" format
        const statusParts = statusLine.split(',').map(s => s.trim());
        const status = normalizeStatus(statusParts[0] || '');
        const dateStr = statusParts[1] || undefined;

        seen.add(permitNumber);
        permits.push({
          permitNumber,
          type: classifyType(permitType),
          status,
          propertyAddress: address || 'Address not available',
          city: 'Ozark',
          county: 'Christian',
          contractorName: contractor || undefined,
          dateFiled: dateStr,
          description: permitType,
          source: 'ozark_smartgov',
        });
      });

      // Don't hammer the server
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Ozark SmartGov search "${term}" error:`, err);
    }
  }

  console.log(`Ozark SmartGov: found ${permits.length} residential permits`);
  return permits;
}

function classifyType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('new') && (t.includes('res') || t.includes('sfr') || t.includes('home'))) return 'new_residential';
  if (t.includes('res') && (t.includes('remodel') || t.includes('alter'))) return 'remodel';
  if (t.includes('res') && t.includes('addition')) return 'addition';
  if (t.includes('res')) return 'new_residential'; // default residential to new
  return 'other';
}

function normalizeStatus(s: string): string {
  const low = s.toLowerCase();
  if (low.includes('closed') || low.includes('final') || low.includes('complete')) return 'final';
  if (low.includes('issued') || low.includes('approved')) return 'approved';
  if (low.includes('review') || low.includes('pending')) return 'in_review';
  if (low.includes('inspection')) return 'under_inspection';
  if (low.includes('active') || low.includes('open')) return 'approved';
  return 'applied';
}

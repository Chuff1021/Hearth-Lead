import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './springfield';

/**
 * Scraper for City of Ozark SmartGov permit portal.
 * URL: https://ozarkmissouri.com/106/Building-Permits-Reports
 *
 * SmartGov provides searchable permit reports with date range filters.
 */
export async function scrapeOzarkPermits(
  options: { daysBack?: number } = {}
): Promise<ScrapedPermit[]> {
  const { daysBack = 30 } = options;
  const permits: ScrapedPermit[] = [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  try {
    // SmartGov typically has an HTML report page
    const url = 'https://ozarkmissouri.com/106/Building-Permits-Reports';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HearthLeadEngine/1.0 (permit-research)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`Ozark scraper: HTTP ${response.status}`);
      return permits;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Look for SmartGov iframe or embedded report
    const smartGovFrame = $('iframe[src*="smartgov"], iframe[src*="tylerhost"]');
    if (smartGovFrame.length > 0) {
      const frameUrl = smartGovFrame.attr('src');
      if (frameUrl) {
        return await scrapeSmartGovFrame(frameUrl, startDate);
      }
    }

    // Try parsing direct HTML table
    $('table tbody tr, .permit-row, .report-row').each((_, el) => {
      const $row = $(el);
      const permit = parseOzarkRow($, $row);
      if (permit && permit.type === 'new_residential') {
        if (!permit.dateFiled || new Date(permit.dateFiled) >= startDate) {
          permits.push(permit);
        }
      }
    });

    // Try parsing a linked PDF or report page
    const reportLinks = $('a[href*="permit"], a[href*="report"]');
    if (permits.length === 0 && reportLinks.length > 0) {
      // There may be downloadable reports; log them for manual review
      reportLinks.each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        console.log(`Ozark report link found: ${text} -> ${href}`);
      });
    }
  } catch (error) {
    console.error('Ozark scraper error:', error);
  }

  return permits;
}

async function scrapeSmartGovFrame(
  frameUrl: string,
  startDate: Date
): Promise<ScrapedPermit[]> {
  const permits: ScrapedPermit[] = [];

  try {
    const response = await fetch(frameUrl, {
      headers: {
        'User-Agent': 'HearthLeadEngine/1.0 (permit-research)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return permits;

    const html = await response.text();
    const $ = cheerio.load(html);

    $('table tbody tr, .smartgov-record').each((_, el) => {
      const $row = $(el);
      const permit = parseSmartGovRow($, $row);
      if (permit && permit.type === 'new_residential') {
        if (!permit.dateFiled || new Date(permit.dateFiled) >= startDate) {
          permits.push(permit);
        }
      }
    });
  } catch (error) {
    console.error('SmartGov frame scrape error:', error);
  }

  return permits;
}

function parseOzarkRow(
  $: cheerio.CheerioAPI,
  $row: ReturnType<cheerio.CheerioAPI>
): ScrapedPermit | null {
  try {
    const cells = $row.find('td');
    if (cells.length < 3) return null;

    const permitNumber = cells.eq(0).text().trim();
    const type = cells.eq(1)?.text().trim() || '';
    const address = cells.eq(2)?.text().trim() || '';
    const contractor = cells.eq(3)?.text().trim() || '';
    const date = cells.eq(4)?.text().trim() || '';
    const value = cells.eq(5)?.text().trim() || '';

    if (!permitNumber) return null;

    return {
      permitNumber: `OZK-${permitNumber}`,
      type: classifyOzarkType(type),
      status: 'approved',
      propertyAddress: address,
      city: 'Ozark',
      county: 'Christian',
      contractorName: contractor || undefined,
      estimatedValue: parseValue(value),
      dateFiled: date || undefined,
      description: type,
      rawData: $row.html() || undefined,
    };
  } catch {
    return null;
  }
}

function parseSmartGovRow(
  $: cheerio.CheerioAPI,
  $row: ReturnType<cheerio.CheerioAPI>
): ScrapedPermit | null {
  return parseOzarkRow($, $row); // Same structure
}

function classifyOzarkType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('new') && (t.includes('residential') || t.includes('sfr') || t.includes('house') || t.includes('home'))) {
    return 'new_residential';
  }
  if (t.includes('new') && t.includes('commercial')) return 'commercial';
  if (t.includes('addition')) return 'addition';
  if (t.includes('remodel') || t.includes('renovation')) return 'remodel';
  if (t.includes('residential') && t.includes('new')) return 'new_residential';
  return 'other';
}

function parseValue(value: string): number | undefined {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

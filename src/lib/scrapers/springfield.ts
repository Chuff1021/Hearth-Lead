import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './index';

/**
 * Scraper for Springfield MO eCity permit portal.
 * https://ecity.springfieldmo.gov/lookup-record
 */
export async function scrapeSpringfieldPermits(options: { daysBack?: number } = {}): Promise<ScrapedPermit[]> {
  const permits: ScrapedPermit[] = [];

  try {
    const response = await fetch('https://ecity.springfieldmo.gov/lookup-record?type=Building+Permit', {
      headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/1.0', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return permits;

    const html = await response.text();
    const $ = cheerio.load(html);

    $('table tbody tr, .record-item, .search-result-item').each((_, el) => {
      const $row = $(el);
      const cells = $row.find('td');
      if (cells.length < 3) return;

      const permitNumber = cells.eq(0).text().trim();
      const address = cells.eq(1).text().trim() || cells.eq(2).text().trim();
      const desc = cells.eq(3)?.text().trim() || '';

      if (!permitNumber || !address) return;
      if (!isNewResidential(desc)) return;

      permits.push({
        permitNumber,
        type: 'new_residential',
        status: normalizeStatus(cells.eq(4)?.text().trim() || ''),
        propertyAddress: address,
        city: 'Springfield',
        county: 'Greene',
        description: desc,
        dateFiled: cells.eq(5)?.text().trim() || undefined,
      });
    });
  } catch (err) {
    console.error('Springfield scraper error:', err);
  }

  return permits;
}

function isNewResidential(desc: string): boolean {
  const d = desc.toLowerCase();
  return (d.includes('new') && (d.includes('residential') || d.includes('single') || d.includes('dwelling') || d.includes('sfr') || d.includes('house')));
}

function normalizeStatus(s: string): string {
  const low = s.toLowerCase();
  if (low.includes('issued') || low.includes('approved')) return 'approved';
  if (low.includes('review') || low.includes('pending')) return 'in_review';
  if (low.includes('inspection')) return 'under_inspection';
  if (low.includes('final') || low.includes('complete')) return 'final';
  if (low.includes('certificate') || low.includes('co ')) return 'co_issued';
  return 'applied';
}

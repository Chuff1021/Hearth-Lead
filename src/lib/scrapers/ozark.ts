import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './index';

/**
 * Scraper for City of Ozark SmartGov permit portal.
 * https://ozarkmissouri.com/106/Building-Permits-Reports
 */
export async function scrapeOzarkPermits(options: { daysBack?: number } = {}): Promise<ScrapedPermit[]> {
  const permits: ScrapedPermit[] = [];

  try {
    const response = await fetch('https://ozarkmissouri.com/106/Building-Permits-Reports', {
      headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/1.0', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return permits;

    const html = await response.text();
    const $ = cheerio.load(html);

    $('table tbody tr, .permit-row').each((_, el) => {
      const $row = $(el);
      const cells = $row.find('td');
      if (cells.length < 3) return;

      const num = cells.eq(0).text().trim();
      const type = cells.eq(1)?.text().trim() || '';
      const addr = cells.eq(2)?.text().trim() || '';

      if (!num || !addr) return;
      if (!type.toLowerCase().includes('new') || !type.toLowerCase().includes('residential')) return;

      const valStr = cells.eq(5)?.text().trim() || '';
      const value = parseFloat(valStr.replace(/[^0-9.]/g, ''));

      permits.push({
        permitNumber: `OZK-${num}`,
        type: 'new_residential',
        status: 'approved',
        propertyAddress: addr,
        city: 'Ozark',
        county: 'Christian',
        contractorName: cells.eq(3)?.text().trim() || undefined,
        estimatedValue: isNaN(value) ? undefined : value,
        dateFiled: cells.eq(4)?.text().trim() || undefined,
        description: type,
      });
    });
  } catch (err) {
    console.error('Ozark scraper error:', err);
  }

  return permits;
}

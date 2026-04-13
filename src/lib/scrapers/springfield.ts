import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './types';

/**
 * Scraper for Springfield MO Legacy Permit Report.
 * https://www1.springfieldmo.gov/permitreport/Report.aspx
 *
 * This is the REAL working endpoint. Clean HTML tables, no auth.
 * Detail pages: /permitreport/Detail.aspx?ap=BLDR&m={MONTH}&y={YEAR}
 * BLDR = Building Permit - Residential
 */
const BASE = 'https://www1.springfieldmo.gov/permitreport';

export async function scrapeSpringfieldPermits(options: { monthsBack?: number } = {}): Promise<ScrapedPermit[]> {
  const { monthsBack = 2 } = options;
  const permits: ScrapedPermit[] = [];

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    try {
      const url = `${BASE}/Detail.aspx?ap=BLDR&m=${month}&y=${year}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0 (permit-research)' },
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        console.warn(`Springfield: HTTP ${res.status} for ${month}/${year}`);
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // The permit report uses an ASP.NET GridView table
      $('table tr').each((idx, el) => {
        if (idx === 0) return; // Skip header row
        const cells = $(el).find('td');
        if (cells.length < 6) return;

        const permitNo = cells.eq(0).text().trim();
        const address = cells.eq(1).text().trim();
        const applicant = cells.eq(2).text().trim();
        const projectName = cells.eq(3).text().trim();
        const issuedDate = cells.eq(4).text().trim();
        const use = cells.eq(5).text().trim(); // Residential / Commercial
        const milestone = cells.eq(6)?.text().trim() || '';

        if (!permitNo || !address) return;
        // Only residential
        if (use.toLowerCase().includes('commercial')) return;

        permits.push({
          permitNumber: permitNo,
          type: 'new_residential',
          status: milestoneToStatus(milestone),
          propertyAddress: address,
          city: 'Springfield',
          county: 'Greene',
          ownerName: applicant || undefined,
          contractorName: undefined, // Not in this report
          description: projectName || undefined,
          dateFiled: issuedDate || undefined,
          source: 'springfield_report',
        });
      });

      console.log(`Springfield ${month}/${year}: found ${permits.length} residential permits`);
    } catch (err) {
      console.error(`Springfield scraper error for ${month}/${year}:`, err);
    }
  }

  return permits;
}

function milestoneToStatus(m: string): string {
  const low = m.toLowerCase();
  if (low.includes('co ') || low.includes('certificate')) return 'co_issued';
  if (low.includes('final')) return 'final';
  if (low.includes('inspection') || low.includes('rough')) return 'under_inspection';
  if (low.includes('issued') || low.includes('approved')) return 'approved';
  if (low.includes('review')) return 'in_review';
  return 'applied';
}

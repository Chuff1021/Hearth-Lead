import { scrapeSpringfieldPermits } from './springfield';
import { scrapeHbaExcel } from './hba-excel';
import { scrapeChristianCountyPermits } from './christian-county';
import type { ScrapedPermit, ScrapeResult } from './types';

export type { ScrapedPermit, ScrapeResult };

/**
 * Run all scrapers. Each one is independent — a failure in one doesn't block others.
 *
 * Sources:
 * 1. Springfield Permit Report (www1.springfieldmo.gov) — live HTML, residential permits
 * 2. HBA Excel files (hbaspringfield.com) — monthly, has $ values, covers SGF + Greene Co
 * 3. Christian County PDFs (christiancountymo.gov) — monthly, covers Ozark/Nixa/etc.
 */
export async function scrapeAllPermits(options: { monthsBack?: number } = {}): Promise<ScrapeResult[]> {
  const { monthsBack = 2 } = options;
  const results: ScrapeResult[] = [];

  const scrapers = [
    { name: 'Springfield Permit Report', fn: () => scrapeSpringfieldPermits({ monthsBack }) },
    { name: 'HBA Excel (SGF + Greene Co)', fn: () => scrapeHbaExcel({ monthsBack }) },
    { name: 'Christian County PDF', fn: () => scrapeChristianCountyPermits({ monthsBack }) },
  ];

  const settled = await Promise.allSettled(
    scrapers.map(async (s) => {
      try {
        const permits = await s.fn();
        return { source: s.name, permits, scrapedAt: new Date().toISOString() } as ScrapeResult;
      } catch (err) {
        return { source: s.name, permits: [], error: err instanceof Error ? err.message : 'Unknown', scrapedAt: new Date().toISOString() } as ScrapeResult;
      }
    })
  );

  for (const r of settled) {
    if (r.status === 'fulfilled') results.push(r.value);
  }

  return results;
}

import { scrapeSpringfieldPermits } from './springfield';
import { scrapeHbaExcel } from './hba-excel';
import { scrapeChristianCountyPermits } from './christian-county';
import { scrapeOzarkSmartGov } from './ozark-smartgov';
import { scrapeNixaBsa } from './nixa-bsa';
import { scrapeSbjPermits } from './sbj';
import type { ScrapedPermit, ScrapeResult } from './types';

export type { ScrapedPermit, ScrapeResult };

/**
 * Run all scrapers. Each one is independent — a failure in one doesn't block others.
 *
 * GREENE COUNTY sources:
 * 1. Springfield Permit Report (www1.springfieldmo.gov) — live HTML, City of Springfield
 * 2. HBA Excel files (hbaspringfield.com) — monthly, has $ values, SGF + unincorporated Greene Co
 *
 * CHRISTIAN COUNTY sources:
 * 3. Ozark SmartGov (ci-ozark-mo.smartgovcommunity.com) — City of Ozark permits
 * 4. Nixa BS&A Online (bsaonline.com?uid=2996) — City of Nixa building records
 * 5. Christian County PDFs (christiancountymo.gov) — all unincorporated Christian County
 * 6. Springfield Business Journal "On the Record" (sbj.net) — weekly column covering both counties
 */
export async function scrapeAllPermits(options: { monthsBack?: number } = {}): Promise<ScrapeResult[]> {
  const { monthsBack = 2 } = options;
  const results: ScrapeResult[] = [];

  const scrapers = [
    // Greene County
    { name: 'Springfield Permit Report', fn: () => scrapeSpringfieldPermits({ monthsBack }) },
    { name: 'HBA Excel (SGF + Greene Co)', fn: () => scrapeHbaExcel({ monthsBack }) },
    // Christian County
    { name: 'Ozark SmartGov', fn: () => scrapeOzarkSmartGov() },
    { name: 'Nixa BS&A Online', fn: () => scrapeNixaBsa() },
    { name: 'Christian County PDF', fn: () => scrapeChristianCountyPermits({ monthsBack }) },
    { name: 'SBJ On the Record', fn: () => scrapeSbjPermits({ articlesToCheck: 6 }) },
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

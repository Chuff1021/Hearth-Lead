import { scrapeSpringfieldPermits } from './springfield';
import { scrapeOzarkPermits } from './ozark';
import type { ScrapedPermit } from './springfield';

export type { ScrapedPermit };

export interface ScrapeResult {
  source: string;
  permits: ScrapedPermit[];
  error?: string;
  scrapedAt: string;
}

/**
 * Run all scrapers and return combined results.
 * Each scraper runs independently so one failure doesn't block others.
 */
export async function scrapeAllPermits(
  options: { daysBack?: number } = {}
): Promise<ScrapeResult[]> {
  const { daysBack = 30 } = options;
  const results: ScrapeResult[] = [];

  const scrapers = [
    {
      name: 'springfield',
      fn: () => scrapeSpringfieldPermits({ daysBack }),
    },
    {
      name: 'ozark',
      fn: () => scrapeOzarkPermits({ daysBack }),
    },
  ];

  const settled = await Promise.allSettled(
    scrapers.map(async (scraper) => {
      try {
        const permits = await scraper.fn();
        return {
          source: scraper.name,
          permits,
          scrapedAt: new Date().toISOString(),
        };
      } catch (error) {
        return {
          source: scraper.name,
          permits: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          scrapedAt: new Date().toISOString(),
        };
      }
    })
  );

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    }
  }

  return results;
}

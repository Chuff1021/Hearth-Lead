export interface ScrapedPermit {
  permitNumber: string;
  type: string;
  subType?: string;
  status: string;
  propertyAddress: string;
  city: string;
  county: string;
  zip?: string;
  parcelNumber?: string;
  ownerName?: string;
  contractorName?: string;
  subdivision?: string;
  estimatedValue?: number;
  squareFootage?: number;
  dateFiled?: string;
  dateApproved?: string;
  description?: string;
  rawData?: string;
}

export interface ScrapeResult {
  source: string;
  permits: ScrapedPermit[];
  error?: string;
}

/**
 * Modular scraping architecture.
 * Each source is its own adapter — add new counties by adding a new file.
 * Currently: Springfield eCity, Ozark SmartGov.
 * Greene County and Christian County unincorporated don't have online portals — manual entry only.
 */
export async function scrapeAllPermits(options: { daysBack?: number } = {}): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  // Each scraper runs independently so one failure doesn't block others
  const scraperModules = [
    { name: 'springfield', fn: () => import('./springfield').then(m => m.scrapeSpringfieldPermits(options)) },
    { name: 'ozark', fn: () => import('./ozark').then(m => m.scrapeOzarkPermits(options)) },
  ];

  const settled = await Promise.allSettled(
    scraperModules.map(async s => {
      try {
        const permits = await s.fn();
        return { source: s.name, permits } as ScrapeResult;
      } catch (err) {
        return { source: s.name, permits: [], error: err instanceof Error ? err.message : 'Unknown' } as ScrapeResult;
      }
    })
  );

  for (const r of settled) {
    if (r.status === 'fulfilled') results.push(r.value);
  }

  return results;
}

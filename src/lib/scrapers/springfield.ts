import * as cheerio from 'cheerio';

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

/**
 * Scraper for Springfield MO eCity permit portal.
 * URL: https://ecity.springfieldmo.gov/lookup-record
 *
 * The eCity portal uses a search form that returns paginated results.
 * We search for "Building Permit" type records with status "Issued" or "In Review".
 */
export async function scrapeSpringfieldPermits(
  options: { daysBack?: number } = {}
): Promise<ScrapedPermit[]> {
  const { daysBack = 30 } = options;
  const permits: ScrapedPermit[] = [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startStr = formatDateForSearch(startDate);
  const endStr = formatDateForSearch(new Date());

  try {
    // Search the eCity portal for building permits
    const searchUrl = 'https://ecity.springfieldmo.gov/api/records/search';
    const searchParams = new URLSearchParams({
      type: 'Building Permit',
      startDate: startStr,
      endDate: endStr,
      status: 'Issued',
    });

    const response = await fetch(`${searchUrl}?${searchParams}`, {
      headers: {
        'User-Agent': 'HearthLeadEngine/1.0 (permit-research)',
        'Accept': 'application/json, text/html',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      // If JSON API doesn't exist, try scraping the HTML search page
      return await scrapeSpringfieldHTML(startStr, endStr);
    }

    const data = await response.json();
    if (Array.isArray(data?.records)) {
      for (const record of data.records) {
        const permit = parseSpringfieldRecord(record);
        if (permit && isResidentialNewConstruction(permit)) {
          permits.push(permit);
        }
      }
    }
  } catch (error) {
    console.error('Springfield scraper error:', error);
    // Fall back to HTML scraping
    try {
      return await scrapeSpringfieldHTML(startStr, endStr);
    } catch (htmlError) {
      console.error('Springfield HTML scraper also failed:', htmlError);
    }
  }

  return permits;
}

async function scrapeSpringfieldHTML(
  startDate: string,
  endDate: string
): Promise<ScrapedPermit[]> {
  const permits: ScrapedPermit[] = [];

  try {
    const url = `https://ecity.springfieldmo.gov/lookup-record?type=Building+Permit&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HearthLeadEngine/1.0 (permit-research)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return permits;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse permit table rows — structure depends on the actual portal
    $('table.record-list tbody tr, .record-item, .search-result-item').each((_, el) => {
      const $row = $(el);
      const permit = parseSpringfieldHTMLRow($, $row);
      if (permit && isResidentialNewConstruction(permit)) {
        permits.push(permit);
      }
    });
  } catch (error) {
    console.error('Springfield HTML scraping failed:', error);
  }

  return permits;
}

function parseSpringfieldRecord(record: Record<string, unknown>): ScrapedPermit | null {
  try {
    return {
      permitNumber: String(record.recordNumber || record.id || ''),
      type: classifyPermitType(String(record.type || record.description || '')),
      status: normalizeStatus(String(record.status || '')),
      propertyAddress: String(record.address || record.propertyAddress || ''),
      city: 'Springfield',
      county: 'Greene',
      zip: String(record.zip || record.zipCode || ''),
      parcelNumber: record.parcelNumber ? String(record.parcelNumber) : undefined,
      ownerName: record.ownerName ? String(record.ownerName) : undefined,
      contractorName: record.contractorName ? String(record.contractorName) : undefined,
      subdivision: record.subdivision ? String(record.subdivision) : undefined,
      estimatedValue: record.estimatedValue ? Number(record.estimatedValue) : undefined,
      squareFootage: record.squareFootage ? Number(record.squareFootage) : undefined,
      dateFiled: record.dateFiled ? String(record.dateFiled) : undefined,
      dateApproved: record.dateApproved ? String(record.dateApproved) : undefined,
      description: record.description ? String(record.description) : undefined,
      rawData: JSON.stringify(record),
    };
  } catch {
    return null;
  }
}

function parseSpringfieldHTMLRow(
  $: cheerio.CheerioAPI,
  $row: ReturnType<cheerio.CheerioAPI>
): ScrapedPermit | null {
  try {
    const cells = $row.find('td');
    if (cells.length < 3) return null;

    const permitNumber = cells.eq(0).text().trim();
    const address = cells.eq(1).text().trim() || cells.eq(2).text().trim();
    const description = cells.eq(3)?.text().trim() || '';
    const status = cells.eq(4)?.text().trim() || '';
    const date = cells.eq(5)?.text().trim() || '';

    if (!permitNumber || !address) return null;

    return {
      permitNumber,
      type: classifyPermitType(description),
      status: normalizeStatus(status),
      propertyAddress: address,
      city: 'Springfield',
      county: 'Greene',
      description,
      dateFiled: date || undefined,
      rawData: $row.html() || undefined,
    };
  } catch {
    return null;
  }
}

function classifyPermitType(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('new') && (desc.includes('single') || desc.includes('sfr') || desc.includes('residence') || desc.includes('dwelling'))) {
    return 'new_residential';
  }
  if (desc.includes('new') && (desc.includes('multi') || desc.includes('apartment') || desc.includes('duplex'))) {
    return 'new_residential';
  }
  if (desc.includes('new') && (desc.includes('commercial') || desc.includes('office') || desc.includes('retail'))) {
    return 'commercial';
  }
  if (desc.includes('addition') || desc.includes('add on')) return 'addition';
  if (desc.includes('remodel') || desc.includes('renovation') || desc.includes('alteration')) return 'remodel';
  if (desc.includes('new')) return 'new_residential'; // default new to residential
  return 'other';
}

function normalizeStatus(status: string): string {
  const s = status.toLowerCase().trim();
  if (s.includes('issued') || s.includes('approved')) return 'approved';
  if (s.includes('review') || s.includes('pending')) return 'in_review';
  if (s.includes('inspection')) return 'under_inspection';
  if (s.includes('final') || s.includes('complete')) return 'final';
  if (s.includes('certificate') || s.includes('co ')) return 'co_issued';
  if (s.includes('applied') || s.includes('submitted')) return 'applied';
  return 'applied';
}

function isResidentialNewConstruction(permit: ScrapedPermit): boolean {
  return permit.type === 'new_residential';
}

function formatDateForSearch(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

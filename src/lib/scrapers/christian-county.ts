import type { ScrapedPermit } from './types';

/**
 * Scraper for Christian County monthly permit PDFs.
 * https://www.christiancountymo.gov/wp-content/uploads/Building-Permits-Issued-for-{MONTH}-{YEAR}.pdf
 *
 * Since PDF parsing in a serverless/edge function is heavy, we take a two-phase approach:
 * Phase 1: Fetch the building-regulations page and find PDF links
 * Phase 2: For each PDF, download and parse the text content
 *
 * PDF table columns: Permit Type, Permit#, Sq. Feet, Owner Name, Address, City, Zip Code, Contractor, Issue Date
 */

const REGULATIONS_URL = 'https://www.christiancountymo.gov/building-regulations/';
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export async function scrapeChristianCountyPermits(options: { monthsBack?: number } = {}): Promise<ScrapedPermit[]> {
  const { monthsBack = 2 } = options;
  const permits: ScrapedPermit[] = [];

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();

    // Try known URL patterns
    const urls = [
      `https://www.christiancountymo.gov/wp-content/uploads/Building-Permits-Issued-for-${month}-${year}.pdf`,
      `https://www.christiancountymo.gov/wp-content/uploads/Building-Permits-Issued-${month}-${year}.pdf`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) continue;

        // Get the PDF as text — we'll do basic text extraction
        // For a production system, use pdf-parse or pdfplumber
        const buffer = await res.arrayBuffer();
        const text = extractTextFromPdfBuffer(new Uint8Array(buffer));

        // Parse the extracted text into permit records
        const parsed = parseChristianCountyText(text, month, year);
        permits.push(...parsed);

        console.log(`Christian County ${month} ${year}: found ${parsed.length} residential permits`);
        break;
      } catch {
        continue;
      }
    }
  }

  return permits;
}

/**
 * Basic PDF text extraction. For full-featured parsing, install pdf-parse.
 * This extracts readable strings from the PDF binary.
 */
function extractTextFromPdfBuffer(buffer: Uint8Array): string {
  // Simple text extraction from PDF stream objects
  // Looks for text between BT (begin text) and ET (end text) operators
  const str = new TextDecoder('latin1').decode(buffer);
  const textParts: string[] = [];

  // Extract strings in parentheses (PDF literal strings)
  const regex = /\(([^)]*)\)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const text = match[1].replace(/\\n/g, '\n').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
    if (text.length > 1 && !/^[\x00-\x1f]+$/.test(text)) {
      textParts.push(text);
    }
  }

  return textParts.join(' ');
}

function parseChristianCountyText(text: string, month: string, year: number): ScrapedPermit[] {
  const permits: ScrapedPermit[] = [];

  // The PDF has lines like: "New Residential | CC-2026-0142 | 2400 | John Smith | 123 Oak St | Ozark | 65721 | Builder LLC | 3/15/2026"
  // Split into chunks and look for residential permits
  const lines = text.split(/\n|\r/).filter(l => l.trim().length > 10);

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (!lower.includes('new residential') && !lower.includes('new res')) continue;

    // Try to extract fields by splitting on common delimiters
    const parts = line.split(/\||\t/).map(p => p.trim()).filter(Boolean);
    if (parts.length < 5) continue;

    // Find the permit number (usually starts with CC- or is numeric)
    const permitNo = parts.find(p => /^CC-|^\d{4,}/.test(p)) || `CC-${month.slice(0,3).toUpperCase()}-${permits.length + 1}`;

    // Find square footage (3-5 digit number)
    const sqftPart = parts.find(p => /^\d{3,5}$/.test(p.replace(/,/g, '')));
    const sqft = sqftPart ? parseInt(sqftPart.replace(/,/g, '')) : undefined;

    // Find city (known Christian County cities)
    const cities = ['Ozark', 'Nixa', 'Clever', 'Highlandville', 'Sparta', 'Billings', 'Fordland', 'Rogersville', 'Chadwick', 'Saddlebrooke', 'Brookline'];
    const cityPart = parts.find(p => cities.some(c => p.toLowerCase().includes(c.toLowerCase())));

    // Find zip code
    const zipPart = parts.find(p => /^657\d{2}$/.test(p.trim()));

    // Find address (contains a number followed by a street name)
    const addrPart = parts.find(p => /^\d+\s+\w/.test(p) && p.length > 8 && !p.startsWith('CC-'));

    permits.push({
      permitNumber: permitNo,
      type: 'new_residential',
      status: 'approved',
      propertyAddress: addrPart || 'Address in PDF',
      city: cityPart || 'Christian County',
      county: 'Christian',
      zip: zipPart || undefined,
      squareFootage: sqft,
      source: 'christian_county_pdf',
    });
  }

  return permits;
}

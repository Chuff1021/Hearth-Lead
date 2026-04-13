import * as XLSX from 'xlsx';
import type { ScrapedPermit } from './types';

/**
 * Scraper for HBA of Greater Springfield monthly Excel files.
 * https://hbaspringfield.com/wp-content/uploads/{YEAR}-{MONTH}.xlsx
 *
 * TWO sheets per file:
 *   Sheet 1 "Springfield Building Permits": Week, Permit No, Owner/Leasee, Primary Contact, Project Description, Site Address
 *   Sheet 2 "Greene County Building Permits": Week, Permit, Owner, Contractor, Project Description, Address, City, State, Zip, Estimated Value
 *
 * The Greene County sheet has estimated values — critical for lead scoring.
 */

const MONTH_NAMES = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

export async function scrapeHbaExcel(options: { monthsBack?: number } = {}): Promise<ScrapedPermit[]> {
  const { monthsBack = 2 } = options;
  const permits: ScrapedPermit[] = [];

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();

    // Try common URL patterns
    const urls = [
      `https://hbaspringfield.com/wp-content/uploads/${year}-${month}.xlsx`,
      `https://hbaspringfield.com/wp-content/uploads/${year}-${month.charAt(0) + month.slice(1).toLowerCase()}.xlsx`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) continue;

        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });

        // Use the 15th of the file's month as the approximate date
        const fileDate = new Date(year, d.getMonth(), 15).toISOString().split('T')[0];

        // Parse Springfield sheet
        const sgfSheet = workbook.SheetNames.find(n => n.toLowerCase().includes('springfield'));
        if (sgfSheet) {
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(workbook.Sheets[sgfSheet]);
          for (const row of rows) {
            const permitNo = row['Permit No'] || row['Permit'] || '';
            const address = row['Site Address'] || row['Address'] || '';
            const desc = row['Project Description'] || '';
            if (!permitNo || !address) continue;
            if (!isResidentialNew(desc)) continue;

            permits.push({
              permitNumber: String(permitNo).trim(),
              type: 'new_residential',
              status: 'approved',
              propertyAddress: String(address).trim(),
              city: 'Springfield',
              county: 'Greene',
              ownerName: (row['Owner/Leasee'] || row['Owner'] || '').trim() || undefined,
              contractorName: (row['Primary Contact'] || '').trim() || undefined,
              description: desc.trim() || undefined,
              dateFiled: fileDate,
              source: 'hba_springfield',
            });
          }
        }

        // Parse Greene County sheet (has estimated values!)
        const gcSheet = workbook.SheetNames.find(n => n.toLowerCase().includes('greene') || n.toLowerCase().includes('county'));
        if (gcSheet) {
          const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets[gcSheet]);
          for (const row of rows) {
            const permitNo = row['Permit'] || row['Permit No'] || '';
            const address = row['Address'] || row['Site Address'] || '';
            const desc = String(row['Project Description'] || '');
            if (!permitNo || !address) continue;
            if (!isResidentialNew(desc)) continue;

            const estValue = row['Estimated Value'] || row['Est Value'] || row['Value'];
            let value: number | undefined;
            if (estValue) {
              const cleaned = String(estValue).replace(/[^0-9.]/g, '');
              const num = parseFloat(cleaned);
              if (!isNaN(num) && num > 0) value = num;
            }

            const city = String(row['City'] || 'Unincorporated').trim();
            const zip = String(row['Zip'] || row['ZIP'] || '').trim();

            permits.push({
              permitNumber: `GC-${String(permitNo).trim()}`,
              type: 'new_residential',
              status: 'approved',
              propertyAddress: String(address).trim(),
              city: city || 'Unincorporated',
              county: 'Greene',
              zip: zip || undefined,
              ownerName: (String(row['Owner'] || '')).trim() || undefined,
              contractorName: (String(row['Contractor'] || '')).trim() || undefined,
              description: desc.trim() || undefined,
              estimatedValue: value,
              dateFiled: fileDate,
              source: 'hba_greene_county',
            });
          }
        }

        console.log(`HBA ${month} ${year}: found ${permits.length} total residential permits`);
        break; // Got data, no need to try other URL patterns
      } catch (err) {
        // Try next URL pattern
        continue;
      }
    }
  }

  return permits;
}

function isResidentialNew(desc: string): boolean {
  const d = desc.toLowerCase();
  // Match "new sfr", "new single family", "new residence", "new dwelling", etc.
  if (d.includes('new') && (d.includes('sfr') || d.includes('single') || d.includes('residen') || d.includes('dwelling') || d.includes('house') || d.includes('home'))) return true;
  // Also match just "sfr" or "single family residence" even without "new"
  if ((d.includes('sfr') || d.includes('single family')) && !d.includes('remodel') && !d.includes('repair') && !d.includes('addition')) return true;
  return false;
}

/**
 * FRED (Federal Reserve Economic Data) API integration.
 * Pulls monthly new residential building permit counts for Greene and Christian counties.
 *
 * Series IDs:
 * - BPPRIV029077: Greene County, MO (monthly)
 * - BPPRIV029043: Christian County, MO (monthly)
 *
 * These are FREE, no API key required for basic access via the observation endpoint.
 */

export interface FredObservation {
  date: string;
  value: number;
}

export interface CountyPermitTrend {
  county: string;
  seriesId: string;
  observations: FredObservation[];
}

const FRED_SERIES = {
  greene: 'BPPRIV029077',
  christian: 'BPPRIV029043',
} as const;

const FRED_BASE_URL = 'https://fred.stlouisfed.org';

/**
 * Fetch permit trend data from FRED.
 * Uses the public observation page (no API key needed).
 */
export async function fetchFredPermitTrends(
  options: { yearsBack?: number } = {}
): Promise<CountyPermitTrend[]> {
  const { yearsBack = 3 } = options;
  const results: CountyPermitTrend[] = [];

  for (const [county, seriesId] of Object.entries(FRED_SERIES)) {
    try {
      const observations = await fetchFredSeries(seriesId, yearsBack);
      results.push({
        county: county.charAt(0).toUpperCase() + county.slice(1),
        seriesId,
        observations,
      });
    } catch (error) {
      console.error(`FRED fetch error for ${county} (${seriesId}):`, error);
      results.push({
        county: county.charAt(0).toUpperCase() + county.slice(1),
        seriesId,
        observations: [],
      });
    }
  }

  return results;
}

async function fetchFredSeries(
  seriesId: string,
  yearsBack: number
): Promise<FredObservation[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - yearsBack);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // Try the FRED API (requires API key) first
  const apiKey = process.env.FRED_API_KEY;
  if (apiKey) {
    return await fetchFredAPI(seriesId, startStr, endStr, apiKey);
  }

  // Fall back to scraping the public data page
  return await fetchFredPublic(seriesId, startStr, endStr);
}

async function fetchFredAPI(
  seriesId: string,
  startDate: string,
  endDate: string,
  apiKey: string
): Promise<FredObservation[]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&observation_start=${startDate}&observation_end=${endDate}&api_key=${apiKey}&file_type=json`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`FRED API returned ${response.status}`);
  }

  const data = await response.json();
  return (data.observations || [])
    .filter((obs: { value: string }) => obs.value !== '.')
    .map((obs: { date: string; value: string }) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));
}

async function fetchFredPublic(
  seriesId: string,
  startDate: string,
  _endDate: string
): Promise<FredObservation[]> {
  // FRED provides a downloadable data page
  const url = `${FRED_BASE_URL}/graph/fredgraph.csv?id=${seriesId}&cosd=${startDate}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HearthLeadEngine/1.0 (market-research)',
        'Accept': 'text/csv',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const csv = await response.text();
    const lines = csv.trim().split('\n');

    // Skip header row
    return lines.slice(1)
      .map(line => {
        const [date, value] = line.split(',');
        const numValue = parseFloat(value);
        if (isNaN(numValue) || value === '.') return null;
        return { date: date.trim(), value: numValue };
      })
      .filter((obs): obs is FredObservation => obs !== null);
  } catch (error) {
    console.error('FRED public data fetch failed:', error);
    return [];
  }
}

/**
 * Get a summary of permit activity for display on the site.
 */
export function summarizePermitTrends(trends: CountyPermitTrend[]): {
  totalPermitsThisYear: number;
  totalPermitsLastYear: number;
  yearOverYearChange: number;
  hottestCounty: string;
  monthlyAverage: number;
} {
  const thisYear = new Date().getFullYear();
  const lastYear = thisYear - 1;

  let totalThisYear = 0;
  let totalLastYear = 0;
  const countyTotals: Record<string, number> = {};

  for (const trend of trends) {
    let countyThisYear = 0;
    for (const obs of trend.observations) {
      const obsYear = new Date(obs.date).getFullYear();
      if (obsYear === thisYear) {
        totalThisYear += obs.value;
        countyThisYear += obs.value;
      } else if (obsYear === lastYear) {
        totalLastYear += obs.value;
      }
    }
    countyTotals[trend.county] = countyThisYear;
  }

  const hottestCounty = Object.entries(countyTotals)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Greene';

  const yearOverYearChange = totalLastYear > 0
    ? ((totalThisYear - totalLastYear) / totalLastYear) * 100
    : 0;

  const currentMonth = new Date().getMonth() + 1;
  const monthlyAverage = currentMonth > 0 ? Math.round(totalThisYear / currentMonth) : 0;

  return {
    totalPermitsThisYear: totalThisYear,
    totalPermitsLastYear: totalLastYear,
    yearOverYearChange: Math.round(yearOverYearChange * 10) / 10,
    hottestCounty,
    monthlyAverage,
  };
}

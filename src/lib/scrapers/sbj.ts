import * as cheerio from 'cheerio';
import type { ScrapedPermit } from './types';

/**
 * Scraper for Springfield Business Journal "On the Record" column.
 * https://sbj.net/stories/on-the-record,<ARTICLE_ID>
 *
 * Published weekly. Includes Christian County building permits
 * (Ozark, Nixa, Republic, and unincorporated areas).
 * NOT behind a paywall.
 *
 * Format: Permit entries are plain text in the article body:
 *   PERMIT_NUMBER. APPLICANT; CONTRACTOR; DESCRIPTION; ADDRESS; COST.
 */

const SBJ_BASE = 'https://sbj.net';

export async function scrapeSbjPermits(options: { articlesToCheck?: number } = {}): Promise<ScrapedPermit[]> {
  const { articlesToCheck = 8 } = options; // Check last 8 weeks
  const permits: ScrapedPermit[] = [];
  const seen = new Set<string>();

  // Step 1: Find recent "On the Record" article URLs
  const articleUrls = await findRecentArticles(articlesToCheck);

  if (articleUrls.length === 0) {
    console.log('SBJ: No "On the Record" articles found');
    return permits;
  }

  // Step 2: Parse each article for permit data
  for (const url of articleUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Get article body text
      const bodyText = $('.entry-content, .article-body, .story-body, article').text();
      if (!bodyText) continue;

      // Parse building permits from the text
      const parsed = parsePermitsFromText(bodyText);
      for (const p of parsed) {
        if (seen.has(p.permitNumber)) continue;
        seen.add(p.permitNumber);
        permits.push(p);
      }

      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`SBJ article error: ${url}:`, err);
    }
  }

  console.log(`SBJ: found ${permits.length} permits from ${articleUrls.length} articles`);
  return permits;
}

async function findRecentArticles(maxArticles: number): Promise<string[]> {
  const urls: string[] = [];

  try {
    // Search for "on the record" articles
    const searchUrl = `${SBJ_BASE}/?s=on+the+record+building+permits`;
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return urls;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Find article links
    $('a[href*="on-the-record"], a[href*="on+the+record"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('stories') && urls.length < maxArticles) {
        const fullUrl = href.startsWith('http') ? href : `${SBJ_BASE}${href}`;
        if (!urls.includes(fullUrl)) urls.push(fullUrl);
      }
    });

    // Also try the stories listing page
    if (urls.length === 0) {
      const listRes = await fetch(`${SBJ_BASE}/stories/category/on-the-record`, {
        headers: { 'User-Agent': 'AaronsFireplace-LeadEngine/2.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (listRes.ok) {
        const listHtml = await listRes.text();
        const $list = cheerio.load(listHtml);
        $list('a[href*="stories"]').each((_, el) => {
          const href = $list(el).attr('href');
          if (href && urls.length < maxArticles) {
            const fullUrl = href.startsWith('http') ? href : `${SBJ_BASE}${href}`;
            if (!urls.includes(fullUrl)) urls.push(fullUrl);
          }
        });
      }
    }
  } catch (err) {
    console.error('SBJ article search error:', err);
  }

  return urls;
}

function parsePermitsFromText(text: string): ScrapedPermit[] {
  const permits: ScrapedPermit[] = [];

  // Split into lines and look for permit patterns
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  // Track which section we're in
  let currentCity = '';
  let inBuildingPermits = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Detect section headers
    if (lower.includes('building permits') || lower.includes('building permit')) {
      inBuildingPermits = true;
      if (lower.includes('nixa')) currentCity = 'Nixa';
      else if (lower.includes('ozark')) currentCity = 'Ozark';
      else if (lower.includes('christian county')) currentCity = 'Christian County';
      else if (lower.includes('springfield')) currentCity = 'Springfield';
      else if (lower.includes('greene county')) currentCity = 'Greene';
      else if (lower.includes('republic')) currentCity = 'Republic';
      continue;
    }

    // Detect end of building permits section
    if (inBuildingPermits && (lower.includes('business license') || lower.includes('bankruptcy') || lower.includes('deed of trust') || lower.includes('mortgage'))) {
      inBuildingPermits = false;
      continue;
    }

    if (!inBuildingPermits) continue;

    // Parse permit entry: "BLDR2025-00123. Name; Contractor; Description; 123 Main St; $250,000."
    const permitMatch = line.match(/^([A-Z]{2,}[\d-]+)\.\s*(.+)/);
    if (!permitMatch) {
      // Also try format without permit prefix: "Name; Contractor; Description; Address; Cost"
      if (line.includes(';') && line.split(';').length >= 3) {
        const parts = line.split(';').map(p => p.trim());
        const address = parts.find(p => /^\d+\s+\w/.test(p) && p.length > 8);
        const cost = parts.find(p => p.includes('$'));
        const costVal = cost ? parseFloat(cost.replace(/[^0-9.]/g, '')) : undefined;

        if (address) {
          // Determine county based on current section
          const county = ['Nixa', 'Ozark', 'Christian County'].includes(currentCity) ? 'Christian' : 'Greene';

          permits.push({
            permitNumber: `SBJ-${currentCity.slice(0, 3).toUpperCase()}-${permits.length + 1}`,
            type: classifySbjType(line),
            status: 'approved',
            propertyAddress: address,
            city: currentCity || 'Unknown',
            county,
            ownerName: parts[0]?.length < 60 ? parts[0] : undefined,
            contractorName: parts[1]?.length < 60 ? parts[1] : undefined,
            description: parts[2]?.length < 200 ? parts[2] : undefined,
            estimatedValue: costVal && costVal > 1000 ? costVal : undefined,
            source: 'sbj_on_the_record',
          });
        }
      }
      continue;
    }

    const permitNumber = permitMatch[1];
    const remainder = permitMatch[2];
    const parts = remainder.split(';').map(p => p.trim().replace(/\.$/, ''));

    const address = parts.find(p => /^\d+\s+\w/.test(p) && p.length > 5);
    const cost = parts.find(p => p.includes('$'));
    const costVal = cost ? parseFloat(cost.replace(/[^0-9.]/g, '')) : undefined;
    const county = ['Nixa', 'Ozark', 'Christian County'].includes(currentCity) ? 'Christian' : 'Greene';

    permits.push({
      permitNumber,
      type: classifySbjType(remainder),
      status: 'approved',
      propertyAddress: address || 'See SBJ article',
      city: currentCity || 'Unknown',
      county,
      ownerName: parts[0]?.length < 60 ? parts[0] : undefined,
      contractorName: parts[1]?.length < 60 ? parts[1] : undefined,
      description: parts.find(p => p.length > 10 && !p.includes('$') && !/^\d+\s/.test(p) && p !== parts[0] && p !== parts[1]),
      estimatedValue: costVal && costVal > 1000 ? costVal : undefined,
      source: 'sbj_on_the_record',
    });
  }

  return permits;
}

function classifySbjType(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('new') && (d.includes('single') || d.includes('sfr') || d.includes('residen') || d.includes('dwelling') || d.includes('home'))) return 'new_residential';
  if (d.includes('remodel') || d.includes('renovation') || d.includes('alteration')) return 'remodel';
  if (d.includes('addition')) return 'addition';
  if (d.includes('commercial')) return 'commercial';
  // Default residential keywords
  if (d.includes('sfr') || d.includes('single family') || d.includes('residential')) return 'new_residential';
  return 'other';
}

import * as cheerio from 'cheerio';

/**
 * AI-powered SEO analyzer. Crawls a page and generates actionable recommendations.
 * Works with ANY website (GoDaddy, WordPress, custom) — just fetches the HTML.
 */

export interface PageAuditResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2s: string[];
  wordCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  loadTimeMs: number;
  hasCanonical: boolean;
  hasRobotsMeta: boolean;
  ogTags: Record<string, string>;
  issues: AuditIssue[];
  score: number; // 0-100
}

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string; // Plain language explanation
  impact: string;      // "So what?" — why this matters
  fix: string;         // What to do about it
}

export async function auditPage(url: string): Promise<PageAuditResult> {
  const startTime = Date.now();

  const res = await fetch(url, {
    headers: { 'User-Agent': 'AaronsFireplace-SEOAudit/1.0' },
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });

  const loadTimeMs = Date.now() - startTime;
  const html = await res.text();
  const $ = cheerio.load(html);

  // Extract data
  const title = $('title').text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
  const h1 = $('h1').first().text().trim() || null;
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get();

  // Word count (visible text only)
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(/\s+/).length;

  // Images
  const images = $('img');
  const imageCount = images.length;
  let imagesWithoutAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') imagesWithoutAlt++;
  });

  // Links
  let internalLinks = 0;
  let externalLinks = 0;
  const baseHost = new URL(url).hostname;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('/') || href.includes(baseHost)) internalLinks++;
    else if (href.startsWith('http')) externalLinks++;
  });

  // Meta tags
  const hasCanonical = $('link[rel="canonical"]').length > 0;
  const hasRobotsMeta = $('meta[name="robots"]').length > 0;
  const ogTags: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property') || '';
    ogTags[prop] = $(el).attr('content') || '';
  });

  // Generate issues
  const issues: AuditIssue[] = [];

  if (!title) {
    issues.push({ severity: 'critical', title: 'Missing page title', description: 'This page has no <title> tag. Google uses the title as the clickable headline in search results.', impact: 'Without a title, Google makes one up — and it\'s usually bad. You\'re probably invisible for your target keywords.', fix: 'Add a title tag like "Gas Fireplaces Springfield MO | Aaron\'s Fireplace" (under 60 characters).' });
  } else if (title.length > 60) {
    issues.push({ severity: 'warning', title: 'Title tag too long', description: `Your title is ${title.length} characters. Google cuts it off at about 60.`, impact: 'The end of your title gets replaced with "..." in search results. Important keywords at the end won\'t show.', fix: `Shorten to under 60 characters. Current: "${title}"` });
  } else if (title.length < 20) {
    issues.push({ severity: 'warning', title: 'Title tag too short', description: `Your title is only ${title.length} characters. You're leaving SEO value on the table.`, impact: 'Short titles miss opportunities to include relevant keywords.', fix: 'Add more descriptive keywords. Include your location (Springfield MO) and business name.' });
  }

  if (!metaDescription) {
    issues.push({ severity: 'critical', title: 'Missing meta description', description: 'This page has no meta description. Google shows a random snippet from your page instead.', impact: 'You can\'t control what Google shows under your page title. A good description can increase clicks by 15-30%.', fix: 'Add a meta description (under 155 characters) that includes your main keywords and a call to action.' });
  } else if (metaDescription.length > 160) {
    issues.push({ severity: 'info', title: 'Meta description slightly long', description: `Your description is ${metaDescription.length} characters. Google may truncate it.`, impact: 'Minor — the important stuff should be in the first 155 characters.', fix: 'Consider shortening to under 155 characters.' });
  }

  if (!h1) {
    issues.push({ severity: 'critical', title: 'Missing H1 heading', description: 'This page has no H1 heading. The H1 is the most important on-page signal to Google about what this page is about.', impact: 'Google doesn\'t know what this page is about. You\'re missing a huge ranking signal.', fix: 'Add one H1 heading at the top of the page content. Example: "Gas Fireplaces in Springfield, MO"' });
  }

  if (wordCount < 300) {
    issues.push({ severity: 'warning', title: 'Thin content', description: `This page only has ${wordCount} words. Google prefers pages with substantial content.`, impact: 'Pages with under 300 words rarely rank well. Google sees them as not valuable enough to show searchers.', fix: 'Add more helpful content. Aim for at least 800 words on important pages. Include FAQs, product details, customer questions you answer regularly.' });
  }

  if (imagesWithoutAlt > 0) {
    issues.push({ severity: 'warning', title: `${imagesWithoutAlt} images missing alt text`, description: `${imagesWithoutAlt} out of ${imageCount} images don't have alt text. Google can't "see" these images.`, impact: 'You\'re missing out on Google Image search traffic. Alt text also helps screen readers for accessibility.', fix: 'Add descriptive alt text to each image. Example: alt="Napoleon gas fireplace with stone surround installed in Springfield home"' });
  }

  if (loadTimeMs > 4000) {
    issues.push({ severity: 'critical', title: 'Page loads too slowly', description: `This page took ${(loadTimeMs / 1000).toFixed(1)} seconds to load. Google recommends under 2.5 seconds.`, impact: 'Slow pages rank lower AND visitors leave before the page loads. You\'re losing customers.', fix: 'Compress images (use WebP format), minimize code, and check with your hosting provider about speed.' });
  } else if (loadTimeMs > 2500) {
    issues.push({ severity: 'warning', title: 'Page speed could be better', description: `This page took ${(loadTimeMs / 1000).toFixed(1)} seconds to load.`, impact: 'Faster pages rank better and convert more visitors.', fix: 'Look for large images or unnecessary scripts slowing things down.' });
  }

  if (internalLinks < 2) {
    issues.push({ severity: 'warning', title: 'Too few internal links', description: `This page only links to ${internalLinks} other pages on your site.`, impact: 'Internal links help Google discover and understand your other pages. They also keep visitors on your site longer.', fix: 'Add links to related products, services, or blog posts. Aim for 3-5 internal links per page.' });
  }

  if (!hasCanonical) {
    issues.push({ severity: 'info', title: 'No canonical tag', description: 'This page doesn\'t specify a canonical URL.', impact: 'Usually fine, but can cause issues if the same content is accessible at multiple URLs.', fix: 'Add a canonical link tag pointing to the preferred URL for this page.' });
  }

  if (Object.keys(ogTags).length === 0) {
    issues.push({ severity: 'info', title: 'Missing Open Graph tags', description: 'No OG tags found. These control how your page looks when shared on Facebook, Twitter, etc.', impact: 'When someone shares your page on social media, it won\'t have a proper image or description.', fix: 'Add og:title, og:description, and og:image tags.' });
  }

  // Calculate score
  const criticals = issues.filter(i => i.severity === 'critical').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const score = Math.max(0, 100 - (criticals * 20) - (warnings * 8) - (issues.filter(i => i.severity === 'info').length * 2));

  return {
    url, title, metaDescription, h1, h2s, wordCount, imageCount, imagesWithoutAlt,
    internalLinks, externalLinks, loadTimeMs, hasCanonical, hasRobotsMeta, ogTags,
    issues, score,
  };
}

/**
 * Audit an entire website by crawling from the homepage.
 */
export async function auditWebsite(baseUrl: string, maxPages = 20): Promise<PageAuditResult[]> {
  const visited = new Set<string>();
  const results: PageAuditResult[] = [];
  const queue = [baseUrl];

  while (queue.length > 0 && results.length < maxPages) {
    const url = queue.shift()!;
    const normalized = normalizeUrl(url, baseUrl);
    if (!normalized || visited.has(normalized)) continue;
    visited.add(normalized);

    try {
      const result = await auditPage(normalized);
      results.push(result);

      // Find more internal pages to crawl
      const res = await fetch(normalized, { signal: AbortSignal.timeout(10000) });
      const html = await res.text();
      const $ = cheerio.load(html);
      const baseHost = new URL(baseUrl).hostname;

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const full = normalizeUrl(href, baseUrl);
        if (full && !visited.has(full) && new URL(full).hostname === baseHost) {
          queue.push(full);
        }
      });
    } catch {
      // Skip pages that fail
    }
  }

  return results;
}

function normalizeUrl(url: string, base: string): string | null {
  try {
    const u = new URL(url, base);
    // Only crawl HTTP(S) pages, skip anchors, skip files
    if (!u.protocol.startsWith('http')) return null;
    if (u.pathname.match(/\.(pdf|jpg|png|gif|svg|css|js|ico|woff|ttf|mp4|mp3)$/i)) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

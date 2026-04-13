import type { MetadataRoute } from 'next';
import { getAllCitySlugs } from '@/lib/data/cities';
import { getAllBuilderSlugs } from '@/lib/data/builders';
import { getAllComparisonSlugs } from '@/lib/data/comparisons';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hearthleadengine.com';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/cost-guide`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ];

  const cityPages = getAllCitySlugs().map(slug => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const builderPages = getAllBuilderSlugs().map(slug => ({
    url: `${baseUrl}/builders/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const comparisonPages = getAllComparisonSlugs().map(slug => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogSlugs = [
    'fireplace-cost-new-construction-missouri',
    'best-fireplace-for-open-floor-plan',
    'gas-vs-wood-burning-fireplace-springfield-mo',
    'fireplace-building-code-greene-county',
    'when-to-choose-fireplace-during-construction',
    'fireplace-rough-in-cost-vs-retrofit',
  ];

  const blogPages = blogSlugs.map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages, ...builderPages, ...comparisonPages, ...blogPages];
}

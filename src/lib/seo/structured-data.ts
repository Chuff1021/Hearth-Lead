/**
 * JSON-LD structured data generators for SEO.
 */

const BUSINESS = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Hearth & Home Fireplace Co.',
  phone: process.env.NEXT_PUBLIC_PHONE || '(417) 555-0199',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hearthleadengine.com',
  address: {
    streetAddress: '1234 Commercial St',
    addressLocality: 'Springfield',
    addressRegion: 'MO',
    postalCode: '65803',
    addressCountry: 'US',
  },
  geo: {
    latitude: 37.2089,
    longitude: -93.2923,
  },
  areaServed: ['Springfield', 'Nixa', 'Ozark', 'Republic', 'Battlefield', 'Rogersville', 'Willard', 'Strafford'],
};

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BUSINESS.url}/#business`,
    name: BUSINESS.name,
    telephone: BUSINESS.phone,
    url: BUSINESS.url,
    address: {
      '@type': 'PostalAddress',
      ...BUSINESS.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      ...BUSINESS.geo,
    },
    areaServed: BUSINESS.areaServed.map(city => ({
      '@type': 'City',
      name: `${city}, MO`,
    })),
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00',
      },
    ],
    sameAs: [],
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: BUSINESS.name,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS.name,
      url: BUSINESS.url,
    },
    image: article.image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

export function serviceSchema(service: {
  name: string;
  description: string;
  url: string;
  priceRange?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS.name,
      telephone: BUSINESS.phone,
    },
    areaServed: BUSINESS.areaServed.map(city => ({
      '@type': 'City',
      name: `${city}, MO`,
    })),
    ...(service.priceRange && { priceRange: service.priceRange }),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

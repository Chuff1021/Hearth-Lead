import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fireplace Blog | New Construction Tips & Guides',
  description: 'Expert fireplace advice for new home construction in Southwest Missouri. Cost guides, builder tips, style comparisons, and local market insights.',
};

const BLOG_POSTS = [
  {
    slug: 'fireplace-cost-new-construction-missouri',
    title: 'How Much Does a Fireplace Cost in New Construction? (2025 Missouri Pricing)',
    excerpt: 'A complete breakdown of fireplace installation costs during new construction in Southwest Missouri, including gas, wood-burning, and electric options.',
    category: 'Cost Guide',
    date: '2025-03-15',
    readTime: '8 min',
  },
  {
    slug: 'best-fireplace-for-open-floor-plan',
    title: 'The Best Fireplace for an Open Floor Plan',
    excerpt: 'Open-concept living rooms need a fireplace that serves as a focal point without blocking sightlines. Here are the top options for open floor plans.',
    category: 'Style Guide',
    date: '2025-03-01',
    readTime: '6 min',
  },
  {
    slug: 'gas-vs-wood-burning-fireplace-springfield-mo',
    title: 'Gas vs Wood-Burning Fireplace: A Springfield MO Homeowner\'s Guide',
    excerpt: 'Local factors that affect the gas vs wood decision in the Springfield area, including natural gas availability, wood sourcing, and building codes.',
    category: 'Comparison',
    date: '2025-02-15',
    readTime: '7 min',
  },
  {
    slug: 'fireplace-building-code-greene-county',
    title: 'Fireplace Building Codes in Greene County, MO: What You Need to Know',
    excerpt: 'A plain-English guide to fireplace-related building codes in Greene County, including permit requirements, inspection stages, and common violations.',
    category: 'Local Guide',
    date: '2025-02-01',
    readTime: '5 min',
  },
  {
    slug: 'when-to-choose-fireplace-during-construction',
    title: 'When Should You Choose Your Fireplace During Construction?',
    excerpt: 'There\'s a critical window during construction when fireplace decisions must be made. Miss it and you\'ll pay thousands more. Here\'s the timeline.',
    category: 'Guide',
    date: '2025-01-20',
    readTime: '5 min',
  },
  {
    slug: 'fireplace-rough-in-cost-vs-retrofit',
    title: 'Fireplace Rough-In vs Retrofit: The $3,000 Decision',
    excerpt: 'Even if you\'re not sure about a fireplace, a rough-in during construction costs a fraction of a full retrofit later. Here\'s why it\'s worth it.',
    category: 'Cost Guide',
    date: '2025-01-10',
    readTime: '4 min',
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16 lg:py-20">
        <div className="container-marketing">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-hearth-300 text-sm mb-4">
              <BookOpen className="w-4 h-4" /> Blog & Guides
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold">
              Fireplace <span className="text-hearth-400">Knowledge Base</span>
            </h1>
            <p className="text-lg text-gray-300 mt-6">
              Expert advice on choosing, installing, and enjoying your fireplace.
              Written by local installers who know Southwest Missouri.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-marketing">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-6 group block">
                <span className="badge-blue text-xs">{post.category}</span>
                <h2 className="text-lg font-semibold text-gray-900 mt-3 group-hover:text-hearth-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>{post.readTime} read</span>
                </div>
                <div className="flex items-center gap-1 mt-3 text-sm text-hearth-600 group-hover:gap-2 transition-all font-medium">
                  Read More <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

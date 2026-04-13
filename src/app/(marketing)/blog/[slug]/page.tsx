import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Phone } from 'lucide-react';
import LeadForm from '@/components/LeadForm';
import prisma from '@/lib/db';

interface BlogPostPageProps {
  params: { slug: string };
}

// Blog content is stored in the database, seeded via the seed script.
// For static generation, we also have fallback content for key articles.

const STATIC_POSTS: Record<string, { title: string; content: string; category: string; date: string; metaDescription: string }> = {
  'fireplace-cost-new-construction-missouri': {
    title: 'How Much Does a Fireplace Cost in New Construction? (2025 Missouri Pricing)',
    category: 'Cost Guide',
    date: '2025-03-15',
    metaDescription: 'Complete 2025 pricing guide for fireplace installation during new construction in Missouri. Gas, wood, and electric options with local Springfield-area pricing.',
    content: `<p>If you're building a new home in Southwest Missouri, one of the smartest investments you can make is including a fireplace during construction. But how much will it actually cost? Here's a detailed breakdown based on our experience installing fireplaces in hundreds of new homes across Greene and Christian County.</p>

<h2>The Short Answer</h2>
<p>A gas fireplace installed during new construction in the Springfield, MO area costs <strong>$2,500–$6,500</strong> for most homeowners. This includes the fireplace unit, venting, gas line rough-in, and a standard surround.</p>

<h2>Why New Construction Is Cheaper</h2>
<p>The single biggest cost difference between new construction and retrofit installation is the framing and venting work. During new construction:</p>
<ul>
<li>The fireplace chase is framed as part of the normal wall structure — <strong>no extra framing labor</strong></li>
<li>The gas line is roughed in during the plumbing phase — <strong>no wall cutting</strong></li>
<li>The vent pipe goes through the roof before roofing is installed — <strong>no roof penetration repair</strong></li>
<li>The surround is installed during the finish phase — <strong>no demolition of existing walls</strong></li>
</ul>
<p>Retrofitting after construction requires all of this work to be done after the fact, adding $3,000–$5,000+ in labor costs alone.</p>

<h2>Detailed Cost Breakdown</h2>

<h3>Gas Fireplace (Direct-Vent) — $2,500–$5,500</h3>
<p>The most popular choice in our market. A direct-vent gas fireplace draws combustion air from outside and vents exhaust through a co-axial pipe. Includes:</p>
<ul>
<li>Fireplace unit: $1,200–$3,000</li>
<li>Venting (pipe, termination cap): $300–$600</li>
<li>Gas line rough-in: $200–$400</li>
<li>Standard surround and mantel: $500–$1,500</li>
<li>Installation labor: $300–$500</li>
</ul>

<h3>Linear Gas Fireplace (Contemporary) — $3,500–$7,500</h3>
<p>The trendy choice for modern and transitional homes. Linear units are wider (42"–72") and shallower, creating a dramatic horizontal flame display. Popular in open-concept great rooms.</p>

<h3>Wood-Burning Fireplace — $2,200–$20,000</h3>
<p>Wide range because prefabricated wood-burning fireplaces start at $2,200, while custom masonry fireplaces with full chimneys can exceed $20,000. The prefab route is the most practical for new construction budgets.</p>

<h3>Electric Fireplace — $500–$2,500</h3>
<p>The budget-friendly option. No venting or gas line required. Modern LED flame effects are surprisingly convincing. Great for secondary rooms or when gas isn't available.</p>

<h2>The Rough-In Strategy</h2>
<p>Not sure if you want a fireplace? Ask your builder for a <strong>rough-in only</strong> for $800–$1,500. This includes the framed chase, gas line, and vent pipe — everything needed to install a fireplace unit later without the expensive retrofit costs. It's the best insurance policy in home building.</p>

<h2>Local Market Context</h2>
<p>In the Springfield, MO metro area, the median new home price is approximately $300,000. At this price point, a $3,500 gas fireplace represents about 1.2% of the total home cost but adds 6–12% in perceived value. It's one of the highest-ROI upgrades available.</p>

<p>Most builders in our area — including Schuber Mitchell, Cronkhite, and local custom builders — offer fireplaces as optional upgrades. Contact us before your options meeting and we'll provide competitive pricing you can compare to your builder's quote.</p>`,
  },
  'when-to-choose-fireplace-during-construction': {
    title: 'When Should You Choose Your Fireplace During Construction?',
    category: 'Guide',
    date: '2025-01-20',
    metaDescription: 'Critical construction milestones for fireplace decisions. Learn the exact timeline so you don\'t miss the window and pay thousands more.',
    content: `<p>There's a critical window during home construction when fireplace decisions must be made. Miss it, and you'll pay thousands more for the same result. Here's the exact timeline.</p>

<h2>The Construction Timeline for Fireplaces</h2>

<h3>Design Phase (Before Construction) — BEST TIME</h3>
<p>This is the ideal moment to decide on your fireplace. At this stage, the architect or designer can position the fireplace exactly where it creates the most impact. The structural engineer can account for the chase in the framing plan. Everything is planned, nothing is reworked.</p>

<h3>Pre-Framing (Foundation Complete) — STILL GREAT</h3>
<p>The foundation is poured but walls aren't up yet. Your builder can still easily accommodate a fireplace in the framing plan. At this stage, the main decisions needed are: which wall, what size, and what fuel type (gas or wood).</p>

<h3>During Framing — LAST GOOD CHANCE</h3>
<p>Once framing begins, the clock starts ticking. The fireplace chase needs to be framed into the wall structure. The gas line needs to be routed during rough plumbing. The vent pipe needs to go up before the roof is closed. If you decide during framing, it can still be done at normal cost, but decisions need to be made quickly.</p>

<h3>After Framing / Before Drywall — EXPENSIVE BUT POSSIBLE</h3>
<p>The walls are up but not finished. Adding a fireplace at this stage means modifying existing framing — opening walls, adding headers, rerouting utilities. This adds $800–$1,500 in additional labor compared to planning it from the start.</p>

<h3>After Drywall — FULL RETROFIT PRICING</h3>
<p>Once drywall is up, adding a fireplace means demolition of finished surfaces, structural modifications, and re-finishing. At this point, you're looking at retrofit pricing: $3,000–$5,000 more than during-construction pricing. The same fireplace that cost $3,500 to install during framing now costs $6,500–$8,500.</p>

<h3>After Move-In — MOST EXPENSIVE</h3>
<p>The house is finished and you're living in it. A retrofit at this stage involves living through a construction project. Dust, noise, disruption, and the full premium for rework. Plus you'll need a separate permit since it's now a modification to a completed structure.</p>

<h2>The Bottom Line</h2>
<p>The difference between the best time and the worst time is $3,000–$5,000 for the exact same fireplace. Plan early, save money.</p>`,
  },
  'best-fireplace-for-open-floor-plan': {
    title: 'The Best Fireplace for an Open Floor Plan',
    category: 'Style Guide',
    date: '2025-03-01',
    metaDescription: 'Find the perfect fireplace for your open-concept home. Linear, see-through, and corner options that create a focal point without blocking sightlines.',
    content: `<p>Open floor plans dominate new construction in Southwest Missouri. The great room—where kitchen, dining, and living areas flow together—needs a fireplace that serves as a focal point without disrupting the open feel.</p>

<h2>Top 5 Fireplace Styles for Open Floor Plans</h2>

<h3>1. Linear Gas Fireplace (Most Popular)</h3>
<p>A 42"–60" linear gas fireplace mounted on the main living wall is the most popular choice in open-concept homes. The wide, low flame creates a dramatic horizontal line that draws the eye without the visual weight of a traditional fireplace.</p>
<p><strong>Best placement:</strong> The wall opposite the kitchen island, visible from all three zones.</p>
<p><strong>Cost:</strong> $3,500–$7,500 installed during construction.</p>

<h3>2. See-Through (Double-Sided) Fireplace</h3>
<p>A see-through fireplace installed in a half-wall or peninsula creates a stunning visual divider between living and dining areas while maintaining sightlines. You get the ambiance from both sides.</p>
<p><strong>Best placement:</strong> In a half-wall separating the living room from a formal dining area or home office.</p>
<p><strong>Cost:</strong> $4,500–$10,000 installed during construction.</p>

<h3>3. Corner Fireplace</h3>
<p>In open floor plans where no wall is long enough for a traditional fireplace, a corner unit maximizes the available space. Corner fireplaces are especially popular in Nixa and Republic homes where lot sizes create narrower floor plans.</p>
<p><strong>Best placement:</strong> The corner where the living area meets an exterior wall.</p>
<p><strong>Cost:</strong> $2,800–$5,500 installed during construction.</p>

<h3>4. Three-Sided (Peninsula) Fireplace</h3>
<p>A three-sided fireplace visible from three directions is the ultimate open-concept statement piece. It's typically installed in a free-standing column or peninsula wall.</p>
<p><strong>Best placement:</strong> In a column that serves as the visual center of the great room.</p>
<p><strong>Cost:</strong> $5,500–$12,000 installed during construction.</p>

<h3>5. Electric Media Wall</h3>
<p>An electric fireplace integrated into a built-in entertainment center creates a combined media and fireplace wall. The TV sits above or adjacent to the fireplace. This is the most practical option for budget-conscious builds.</p>
<p><strong>Best placement:</strong> The main TV wall in the living area.</p>
<p><strong>Cost:</strong> $1,500–$4,000 installed during construction.</p>

<h2>Design Tips for Open Floor Plans</h2>
<ul>
<li><strong>Scale matters:</strong> A 36" fireplace will look lost in a 20' wall. Go bigger—42" minimum for open concepts.</li>
<li><strong>Surround height:</strong> Floor-to-ceiling surrounds create more impact than standard-height installations.</li>
<li><strong>Lighting:</strong> Add recessed lighting above the fireplace to enhance the focal point effect.</li>
<li><strong>Furniture arrangement:</strong> Orient seating toward the fireplace to create a defined living "zone" within the open plan.</li>
</ul>`,
  },
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = STATIC_POSTS[params.slug];
  if (!post) return { title: 'Blog Post' };

  return {
    title: post.title,
    description: post.metaDescription,
    openGraph: { title: post.title, description: post.metaDescription, type: 'article' },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Try database first, fall back to static
  let post = STATIC_POSTS[params.slug];

  if (!post) {
    try {
      const dbPost = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
      if (dbPost) {
        post = {
          title: dbPost.title,
          content: dbPost.content,
          category: dbPost.category || 'Guide',
          date: dbPost.publishedAt?.toISOString().split('T')[0] || '2025-01-01',
          metaDescription: dbPost.metaDescription || dbPost.excerpt || '',
        };
      }
    } catch {
      // Database not available, that's fine
    }
  }

  if (!post) {
    return (
      <div className="container-marketing py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <Link href="/blog" className="text-hearth-600 hover:text-hearth-700">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-gray-900 to-hearth-950 text-white py-16">
        <div className="container-marketing max-w-3xl">
          <Link href="/blog" className="flex items-center gap-1 text-hearth-300 text-sm mb-6 hover:text-hearth-200">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <span className="badge-blue text-xs">{post.category}</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-3">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-marketing">
          <div className="grid lg:grid-cols-3 gap-12">
            <article
              className="lg:col-span-2 prose-hearth"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <aside className="space-y-6">
              <LeadForm
                page={`blog/${params.slug}`}
                cta="sidebar"
                heading="Ready to Plan Your Fireplace?"
                description="Free consultation for your new construction project."
              />

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Related Articles</h3>
                <div className="space-y-2">
                  {Object.entries(STATIC_POSTS)
                    .filter(([slug]) => slug !== params.slug)
                    .slice(0, 4)
                    .map(([slug, p]) => (
                      <Link
                        key={slug}
                        href={`/blog/${slug}`}
                        className="block text-sm text-hearth-600 hover:text-hearth-700"
                      >
                        {p.title.length > 60 ? p.title.slice(0, 60) + '...' : p.title} &rarr;
                      </Link>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hearth-600 py-12">
        <div className="container-marketing text-center text-white">
          <h2 className="text-2xl font-display font-bold">Planning a New Home?</h2>
          <p className="text-hearth-100 mt-2">
            Get a free fireplace consultation before construction begins.
          </p>
          <Link href="/contact" className="inline-block mt-6 bg-white text-hearth-700 hover:bg-hearth-50 px-6 py-3 rounded-lg font-semibold transition-colors">
            Schedule Consultation
          </Link>
        </div>
      </section>
    </>
  );
}

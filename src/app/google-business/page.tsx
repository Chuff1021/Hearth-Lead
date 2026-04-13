import { Star, MessageSquare, Calendar, TrendingUp, Send, Image, AlertTriangle, CheckCircle } from 'lucide-react';
import prisma from '@/lib/db';
import { formatDate, reviewStatusBadge } from '@/lib/utils';
import StatCard from '@/components/StatCard';

async function getGbpData() {
  try {
    const [reviews, posts, competitors] = await Promise.all([
      prisma.gbpReview.findMany({ orderBy: { reviewDate: 'desc' } }),
      prisma.gbpPost.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.competitor.findMany({ orderBy: { reviewCount: 'desc' } }),
    ]);
    return { reviews, posts, competitors };
  } catch { return { reviews: [], posts: [], competitors: [] }; }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

export default async function GoogleBusinessPage() {
  const { reviews, posts, competitors } = await getGbpData();

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const needsResponse = reviews.filter(r => r.status === 'needs_response');
  const responded = reviews.filter(r => r.status === 'responded');
  const responseRate = reviews.length > 0 ? Math.round((responded.length / reviews.length) * 100) : 0;
  const publishedPosts = posts.filter(p => p.status === 'published');
  const lastPost = publishedPosts[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Google Business Profile</h1>
          <p className="page-subtitle">Manage reviews, posts, and track your local search presence.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Average Rating" value={avgRating.toFixed(1)} icon={<Star className="w-5 h-5" />} detail={`${reviews.length} total reviews`} accent="orange" />
        <StatCard label="Needs Response" value={needsResponse.length} icon={<MessageSquare className="w-5 h-5" />} accent={needsResponse.length > 0 ? 'red' : 'green'} detail={needsResponse.length > 0 ? 'Respond to keep rating high' : 'All caught up!'} />
        <StatCard label="Response Rate" value={`${responseRate}%`} icon={<CheckCircle className="w-5 h-5" />} accent={responseRate >= 90 ? 'green' : 'orange'} detail={responseRate >= 90 ? 'Great — Google rewards this' : 'Try to stay above 90%'} />
        <StatCard label="Posts Published" value={publishedPosts.length} icon={<Send className="w-5 h-5" />} accent="blue" detail={lastPost ? `Last: ${formatDate(lastPost.publishedAt)}` : 'No posts yet'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Reviews */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h2 className="card-title">Reviews</h2>
            <span className="text-xs text-gray-400">{reviews.length} total</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {reviews.map(review => (
              <div key={review.id} className={`p-4 ${review.status === 'needs_response' ? 'bg-red-50/50' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(review.reviewDate)} &middot; {review.platform}</p>
                  </div>
                  <span className={reviewStatusBadge(review.status)}>{review.status.replace('_', ' ')}</span>
                </div>
                {review.text && <p className="text-sm text-gray-600 mb-2">{review.text}</p>}
                {review.responseText && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">Your response:</p>
                    <p className="text-sm text-gray-600">{review.responseText}</p>
                  </div>
                )}
                {review.status === 'needs_response' && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> This review needs a response. Responding helps your local ranking.
                  </div>
                )}
              </div>
            ))}
            {reviews.length === 0 && <div className="p-8 text-center text-gray-300 text-sm">No reviews loaded. Connect your Google Business Profile in Settings.</div>}
          </div>
        </div>

        {/* Posts + Competitors sidebar */}
        <div className="space-y-6">
          {/* Recent Posts */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Posts</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {posts.slice(0, 5).map(post => (
                <div key={post.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${post.status === 'published' ? 'badge-green' : post.status === 'scheduled' ? 'badge-blue' : 'badge-gray'}`}>{post.status}</span>
                    <span className="badge-gray text-[10px]">{post.type}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(post.publishedAt || post.scheduledAt || post.createdAt)}</p>
                </div>
              ))}
              {posts.length === 0 && <div className="p-6 text-center text-gray-300 text-xs">No posts yet</div>}
            </div>
          </div>

          {/* Competitors */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Local Competitors</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {competitors.map(comp => (
                <div key={comp.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{comp.name}</p>
                      {comp.website && <p className="text-[10px] text-gray-400 truncate">{comp.website}</p>}
                    </div>
                    <div className="text-right">
                      {comp.googleRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold">{comp.googleRating}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400">{comp.reviewCount || 0} reviews</p>
                    </div>
                  </div>
                  {comp.gbpPostFreq && <p className="text-[10px] text-gray-400 mt-1">Posts: {comp.gbpPostFreq}</p>}
                </div>
              ))}
              {competitors.length === 0 && <div className="p-6 text-center text-gray-300 text-xs">No competitors tracked yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

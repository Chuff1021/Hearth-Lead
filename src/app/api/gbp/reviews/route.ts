import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateReviewResponse } from '@/lib/ai/review-responder';

/**
 * GET /api/gbp/reviews — List reviews
 * POST /api/gbp/reviews — Generate AI response for a review
 */
export async function GET() {
  try {
    const reviews = await prisma.gbpReview.findMany({ orderBy: { reviewDate: 'desc' } });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reviewId, action } = await req.json();

    if (action === 'generate_response') {
      const review = await prisma.gbpReview.findUnique({ where: { id: reviewId } });
      if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

      const response = generateReviewResponse({
        reviewerName: review.reviewerName,
        rating: review.rating,
        text: review.text,
        platform: review.platform,
      });

      return NextResponse.json({ response });
    }

    if (action === 'save_response') {
      const { responseText } = await req.json();
      const review = await prisma.gbpReview.update({
        where: { id: reviewId },
        data: { responseText, responseDate: new Date(), status: 'responded' },
      });
      return NextResponse.json({ review });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

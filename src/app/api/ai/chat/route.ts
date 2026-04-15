import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { askAI } from '@/lib/ai/engine';

/**
 * POST /api/ai/chat — The AI marketing brain.
 *
 * Feeds ALL business data (permits, leads, ads, SEO, reviews, competitors)
 * to Claude and returns strategic, actionable advice.
 *
 * With ANTHROPIC_API_KEY: Full Claude-powered analysis
 * Without: Built-in fallback analysis with setup instructions
 */
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const { response, category } = await askAI(message);

    // Save conversation history
    await prisma.aiConversation.create({
      data: { userMessage: message, aiResponse: response, category },
    }).catch(() => {});

    return NextResponse.json({ response, category });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({
      response: 'Sorry, I ran into an error processing that. Try again.',
      category: 'error',
    });
  }
}

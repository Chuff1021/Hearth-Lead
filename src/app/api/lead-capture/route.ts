import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const captureSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  builder: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  page: z.string().max(500),
  cta: z.string().max(100).optional(),
  formType: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = captureSchema.parse(body);

    // Create the lead capture record
    const capture = await prisma.leadCapture.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        page: data.page,
        cta: data.cta || null,
        formType: data.formType || 'contact',
        referrer: request.headers.get('referer') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    // Also create/update a lead record
    const existingLead = await prisma.lead.findFirst({
      where: { email: data.email },
    });

    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          phone: data.phone || existingLead.phone,
          timeline: data.timeline || existingLead.timeline,
          sourcePage: data.page,
          sourceCta: data.cta,
          notes: data.message
            ? `${existingLead.notes ? existingLead.notes + '\n\n' : ''}[${new Date().toLocaleDateString()}] ${data.message}`
            : existingLead.notes,
        },
      });

      // Link capture to lead
      await prisma.leadCapture.update({
        where: { id: capture.id },
        data: { leadId: existingLead.id },
      });
    } else {
      // Find builder if specified
      let builderId: string | null = null;
      if (data.builder && data.builder !== 'not-sure' && data.builder !== 'other') {
        const builder = await prisma.builder.findFirst({
          where: { slug: { contains: data.builder } },
        });
        if (builder) builderId = builder.id;
      }

      const lead = await prisma.lead.create({
        data: {
          type: 'website_lead',
          status: 'new',
          score: 40, // Base score for website leads
          firstName: data.firstName,
          lastName: data.lastName || null,
          email: data.email,
          phone: data.phone || null,
          timeline: data.timeline || null,
          source: 'organic',
          sourcePage: data.page,
          sourceCta: data.cta || null,
          builderId,
          notes: data.message || null,
        },
      });

      await prisma.leadCapture.update({
        where: { id: capture.id },
        data: { leadId: lead.id },
      });
    }

    return NextResponse.json({ success: true, id: capture.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

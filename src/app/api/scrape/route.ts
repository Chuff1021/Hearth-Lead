import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { scorePermitLead } from '@/lib/scoring/lead-score';

/**
 * Trigger permit scraping from all sources.
 * GET /api/scrape — runs all scrapers and returns results.
 *
 * In production this would be triggered by a cron job (Vercel cron or external).
 * The actual scraping logic is in src/lib/scrapers/ — each source is modular.
 */
export async function GET() {
  const results = { checked: 0, newPermits: 0, updated: 0, newLeads: 0, errors: [] as string[] };

  try {
    // Dynamic import to keep bundle small
    const { scrapeAllPermits } = await import('@/lib/scrapers');
    const scrapeResults = await scrapeAllPermits({ monthsBack: 2 });

    for (const result of scrapeResults) {
      if (result.error) {
        results.errors.push(`${result.source}: ${result.error}`);
      }

      for (const permit of result.permits) {
        results.checked++;
        try {
          const existing = await prisma.permit.findUnique({ where: { permitNumber: permit.permitNumber } });

          // Check if builder is a partner
          let isPartner = false;
          let builderId: string | undefined;
          if (permit.contractorName) {
            const builder = await prisma.builder.findFirst({ where: { name: { contains: permit.contractorName } } });
            if (builder) {
              builderId = builder.id;
              isPartner = builder.relationship === 'partner';
            }
          }

          const score = scorePermitLead({
            type: permit.type,
            estimatedValue: permit.estimatedValue,
            squareFootage: permit.squareFootage,
            status: permit.status,
            subdivision: permit.subdivision,
            contractorName: permit.contractorName,
            city: permit.city,
            dateFiled: permit.dateFiled ? new Date(permit.dateFiled) : null,
            isPartnerBuilder: isPartner,
          });

          if (existing) {
            await prisma.permit.update({
              where: { permitNumber: permit.permitNumber },
              data: { status: permit.status, leadScore: score.total, urgency: score.urgency },
            });
            results.updated++;
          } else {
            const newPermit = await prisma.permit.create({
              data: {
                permitNumber: permit.permitNumber,
                source: result.source,
                type: permit.type,
                subType: permit.subType,
                status: permit.status,
                propertyAddress: permit.propertyAddress,
                city: permit.city,
                county: permit.county,
                zip: permit.zip,
                parcelNumber: permit.parcelNumber,
                ownerName: permit.ownerName,
                contractorName: permit.contractorName,
                subdivision: permit.subdivision,
                estimatedValue: permit.estimatedValue,
                squareFootage: permit.squareFootage,
                dateFiled: permit.dateFiled ? new Date(permit.dateFiled) : null,
                description: permit.description,
                rawData: permit.rawData,
                leadScore: score.total,
                urgency: score.urgency,
                builderId,
              },
            });

            // Auto-create leads for high-score permits
            if (score.total >= 50) {
              await prisma.lead.create({
                data: {
                  source: 'permit',
                  stage: 'new',
                  score: score.total,
                  urgency: score.urgency,
                  firstName: permit.ownerName?.split(' ')[0] || null,
                  lastName: permit.ownerName?.split(' ').slice(1).join(' ') || null,
                  address: permit.propertyAddress,
                  city: permit.city,
                  county: permit.county,
                  subdivision: permit.subdivision,
                  builderId,
                  homeValue: permit.estimatedValue,
                  timeline: permit.status === 'applied' ? 'planning' : permit.status === 'approved' ? 'foundation' : 'framing',
                  notes: `Auto-created from permit ${permit.permitNumber}.\nScore: ${score.total} (${score.urgency})\nContact window: ${score.idealContactWindow}\nFactors: ${score.factors.map(f => f.reason).join('; ')}`,
                  permits: { connect: { id: newPermit.id } },
                },
              });
              results.newLeads++;
            }

            results.newPermits++;
          }
        } catch (err) {
          results.errors.push(`Permit ${permit.permitNumber}: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }
    }
  } catch (err) {
    results.errors.push(`Scraper error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }

  return NextResponse.json(results);
}

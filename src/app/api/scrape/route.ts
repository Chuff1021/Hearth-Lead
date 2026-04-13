import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { scrapeAllPermits } from '@/lib/scrapers';
import { scorePermitLead } from '@/lib/scoring/lead-score';

export async function GET() {
  const results = {
    scraped: 0,
    new: 0,
    updated: 0,
    errors: [] as string[],
    sources: [] as { source: string; found: number; error?: string }[],
  };

  try {
    const scrapeResults = await scrapeAllPermits({ daysBack: 30 });

    for (const result of scrapeResults) {
      results.sources.push({
        source: result.source,
        found: result.permits.length,
        error: result.error,
      });

      if (result.error) {
        results.errors.push(`${result.source}: ${result.error}`);
      }

      for (const permit of result.permits) {
        results.scraped++;

        try {
          // Check if permit already exists
          const existing = await prisma.permit.findUnique({
            where: { permitNumber: permit.permitNumber },
          });

          // Score the lead
          const score = scorePermitLead({
            type: permit.type,
            estimatedValue: permit.estimatedValue,
            squareFootage: permit.squareFootage,
            status: permit.status,
            subdivision: permit.subdivision,
            contractorName: permit.contractorName,
            city: permit.city,
            dateFiled: permit.dateFiled ? new Date(permit.dateFiled) : undefined,
          });

          if (existing) {
            await prisma.permit.update({
              where: { permitNumber: permit.permitNumber },
              data: {
                status: permit.status,
                leadScore: score.total,
                updatedAt: new Date(),
              },
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
                dateApproved: permit.dateApproved ? new Date(permit.dateApproved) : null,
                description: permit.description,
                rawData: permit.rawData,
                leadScore: score.total,
              },
            });

            // Auto-create lead for high-scoring permits
            if (score.total >= 50) {
              await prisma.lead.create({
                data: {
                  type: 'permit_lead',
                  status: 'new',
                  score: score.total,
                  firstName: permit.ownerName?.split(' ')[0] || null,
                  lastName: permit.ownerName?.split(' ').slice(1).join(' ') || null,
                  address: permit.propertyAddress,
                  city: permit.city,
                  county: permit.county,
                  builderName: permit.contractorName,
                  subdivision: permit.subdivision,
                  source: 'permit_data',
                  notes: `Auto-created from permit ${permit.permitNumber}. Score: ${score.total}. Factors: ${score.factors.map(f => f.reason).join('; ')}`,
                  permits: { connect: { id: newPermit.id } },
                },
              });
            }

            results.new++;
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          results.errors.push(`Permit ${permit.permitNumber}: ${errMsg}`);
        }
      }

      // Update builder stats
      if (result.permits.length > 0) {
        const contractors = Array.from(new Set(result.permits.map(p => p.contractorName).filter(Boolean)));
        for (const contractor of contractors) {
          if (!contractor) continue;
          const count = result.permits.filter(p => p.contractorName === contractor).length;
          await prisma.builder.upsert({
            where: { slug: contractor.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            update: {
              totalPermits: { increment: count },
              activePermits: count,
            },
            create: {
              slug: contractor.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              name: contractor,
              totalPermits: count,
              activePermits: count,
            },
          });
        }
      }
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Global error: ${errMsg}`);
  }

  return NextResponse.json(results);
}

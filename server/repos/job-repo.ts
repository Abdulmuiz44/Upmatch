import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { NormalizedJobRecord } from "@/lib/upwork/queries";

const JOB_CACHE_TTL_HOURS = 12;

export function getActiveJobs() {
  return prisma.job.findMany({
    where: {
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: [{ publishedAt: "desc" }, { lastSeenAt: "desc" }]
  });
}

export async function upsertJobsFromMarketplace(records: NormalizedJobRecord[]) {
  let inserted = 0;
  let updated = 0;

  for (const job of records) {
    const existing = await prisma.job.findUnique({
      where: {
        providerJobId: job.providerJobId
      },
      select: { id: true }
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + JOB_CACHE_TTL_HOURS * 60 * 60 * 1000);

    const sharedPayload: Prisma.JobUncheckedCreateInput = {
      providerJobId: job.providerJobId,
      providerCiphertext: job.providerCiphertext,
      title: job.title,
      description: job.description,
      contractType: job.contractType,
      experienceLevel: job.experienceLevel,
      hourlyMinUsd: job.hourlyMinUsd,
      hourlyMaxUsd: job.hourlyMaxUsd,
      fixedBudgetUsd: job.fixedBudgetUsd,
      durationLabel: job.durationLabel,
      category: job.category,
      skills: job.skills,
      clientCountry: job.clientCountry,
      clientTotalHires: job.clientTotalHires,
      clientTotalPostedJobs: job.clientTotalPostedJobs,
      clientTotalReviews: job.clientTotalReviews,
      clientTotalFeedback: job.clientTotalFeedback,
      publishedAt: job.publishedAt,
      rawPayload: job.rawPayload as Prisma.InputJsonValue,
      lastSeenAt: now,
      expiresAt
    };

    await prisma.job.upsert({
      where: { providerJobId: job.providerJobId },
      create: {
        ...sharedPayload,
        firstSeenAt: now
      },
      update: {
        providerCiphertext: job.providerCiphertext,
        title: job.title,
        description: job.description,
        contractType: job.contractType,
        experienceLevel: job.experienceLevel,
        hourlyMinUsd: job.hourlyMinUsd,
        hourlyMaxUsd: job.hourlyMaxUsd,
        fixedBudgetUsd: job.fixedBudgetUsd,
        durationLabel: job.durationLabel,
        category: job.category,
        skills: job.skills,
        clientCountry: job.clientCountry,
        clientTotalHires: job.clientTotalHires,
        clientTotalPostedJobs: job.clientTotalPostedJobs,
        clientTotalReviews: job.clientTotalReviews,
        clientTotalFeedback: job.clientTotalFeedback,
        publishedAt: job.publishedAt,
        rawPayload: job.rawPayload as Prisma.InputJsonValue,
        lastSeenAt: now,
        expiresAt
      }
    });

    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }
  }

  return {
    inserted,
    updated,
    total: records.length
  };
}

export function getJobById(id: string) {
  return prisma.job.findUnique({ where: { id } });
}

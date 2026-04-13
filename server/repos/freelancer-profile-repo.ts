import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { NormalizedFreelancerProfile } from "@/lib/upwork/queries";

export function getFreelancerProfileByUserId(userId: string) {
  return prisma.freelancerProfile.findUnique({ where: { userId } });
}

export function upsertFreelancerProfile(userId: string, profile: NormalizedFreelancerProfile) {
  return prisma.freelancerProfile.upsert({
    where: { userId },
    create: {
      userId,
      upworkProfileId: profile.upworkProfileId,
      profileTitle: profile.profileTitle,
      overview: profile.overview,
      hourlyRateUsdCents: profile.hourlyRateUsdCents,
      profileUrl: profile.profileUrl,
      categories: profile.categories,
      skills: profile.skills,
      rawPayload: profile.rawPayload as Prisma.InputJsonValue,
      syncedAt: new Date()
    },
    update: {
      upworkProfileId: profile.upworkProfileId,
      profileTitle: profile.profileTitle,
      overview: profile.overview,
      hourlyRateUsdCents: profile.hourlyRateUsdCents,
      profileUrl: profile.profileUrl,
      categories: profile.categories,
      skills: profile.skills,
      rawPayload: profile.rawPayload as Prisma.InputJsonValue,
      syncedAt: new Date()
    }
  });
}

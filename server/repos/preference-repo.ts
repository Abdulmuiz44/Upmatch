import "server-only";

import { ContractTypePreference } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function getPreferenceByUserId(userId: string) {
  return prisma.userPreference.findUnique({
    where: { userId }
  });
}

export function upsertPreference(input: {
  userId: string;
  preferredRoles: string[];
  minimumHourlyRateUsd: number | null;
  minimumFixedBudgetUsd: number | null;
  preferredKeywords: string[];
  excludedKeywords: string[];
  preferredIndustries: string[];
  contractType: ContractTypePreference;
}) {
  return prisma.userPreference.upsert({
    where: { userId: input.userId },
    create: input,
    update: input
  });
}

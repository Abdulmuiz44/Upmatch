import "server-only";

import { prisma } from "@/lib/prisma";

export function getProposalAssist(userId: string, jobId: string) {
  return prisma.proposalAssist.findUnique({
    where: {
      userId_jobId: { userId, jobId }
    }
  });
}

export function upsertProposalAssist(input: {
  userId: string;
  jobId: string;
  openingAngle: string | null;
  keyProofPoints: string[];
  risksToAddress: string[];
  clientQuestions: string[];
  toneGuidance: string | null;
}) {
  return prisma.proposalAssist.upsert({
    where: {
      userId_jobId: {
        userId: input.userId,
        jobId: input.jobId
      }
    },
    create: {
      ...input,
      generatedAt: new Date()
    },
    update: {
      ...input,
      generatedAt: new Date()
    }
  });
}

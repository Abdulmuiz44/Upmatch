import "server-only";

import { JobUserStateType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function upsertJobUserState(input: {
  userId: string;
  jobId: string;
  state: JobUserStateType;
  notes?: string | null;
}) {
  return prisma.jobUserState.upsert({
    where: {
      userId_jobId: {
        userId: input.userId,
        jobId: input.jobId
      }
    },
    create: {
      userId: input.userId,
      jobId: input.jobId,
      state: input.state,
      notes: input.notes ?? null
    },
    update: {
      state: input.state,
      notes: input.notes ?? null
    }
  });
}

export function getJobUserState(userId: string, jobId: string) {
  return prisma.jobUserState.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId
      }
    }
  });
}

export async function getDismissedJobIds(userId: string) {
  const states = await prisma.jobUserState.findMany({
    where: {
      userId,
      state: JobUserStateType.DISMISSED
    },
    select: {
      jobId: true
    }
  });

  return states.map((state) => state.jobId);
}

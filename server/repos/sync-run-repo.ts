import "server-only";

import { Prisma, SyncRunStatus, SyncRunType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function createSyncRun(input: {
  userId: string;
  type: SyncRunType;
  status?: SyncRunStatus;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.syncRun.create({
    data: {
      userId: input.userId,
      type: input.type,
      status: input.status ?? SyncRunStatus.QUEUED,
      metadata: input.metadata
    }
  });
}

export function markSyncRunRunning(id: string) {
  return prisma.syncRun.update({
    where: { id },
    data: {
      status: SyncRunStatus.RUNNING,
      startedAt: new Date(),
      errorMessage: null
    }
  });
}

export function markSyncRunSucceeded(id: string, metadata?: Prisma.InputJsonValue) {
  return prisma.syncRun.update({
    where: { id },
    data: {
      status: SyncRunStatus.SUCCEEDED,
      completedAt: new Date(),
      metadata
    }
  });
}

export function markSyncRunFailed(id: string, errorMessage: string) {
  return prisma.syncRun.update({
    where: { id },
    data: {
      status: SyncRunStatus.FAILED,
      completedAt: new Date(),
      errorMessage
    }
  });
}

export function getLatestSyncRun(userId: string) {
  return prisma.syncRun.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

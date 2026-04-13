import "server-only";

import {
  ConnectedAccountProvider,
  ConnectedAccountStatus,
  Prisma
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function findUpworkConnectionByUserId(userId: string) {
  return prisma.connectedAccount.findUnique({
    where: {
      provider_userId: {
        provider: ConnectedAccountProvider.UPWORK,
        userId
      }
    }
  });
}

type PersistUpworkConnectionInput = {
  userId: string;
  status: ConnectedAccountStatus;
  tenantId?: string | null;
  encryptedAccessToken?: string | null;
  encryptedRefreshToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export function persistUpworkConnection(input: PersistUpworkConnectionInput) {
  const data: Prisma.ConnectedAccountUncheckedCreateInput = {
    provider: ConnectedAccountProvider.UPWORK,
    userId: input.userId,
    status: input.status,
    tenantId: input.tenantId ?? null,
    encryptedAccessToken: input.encryptedAccessToken ?? null,
    encryptedRefreshToken: input.encryptedRefreshToken ?? null,
    accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: input.refreshTokenExpiresAt ?? null,
    scope: input.scope ?? null,
    errorCode: input.errorCode ?? null,
    errorMessage: input.errorMessage ?? null
  };

  return prisma.connectedAccount.upsert({
    where: {
      provider_userId: {
        provider: ConnectedAccountProvider.UPWORK,
        userId: input.userId
      }
    },
    create: data,
    update: data
  });
}

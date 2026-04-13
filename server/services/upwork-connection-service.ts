import "server-only";

import { ConnectedAccountStatus } from "@prisma/client";

import {
  buildUpworkAuthorizationUrl,
  createUpworkOauthState,
  exchangeAuthorizationCode,
  parseUpworkOauthState
} from "@/lib/upwork/oauth";
import { storeUpworkTokens } from "@/lib/upwork/token-store";
import {
  findUpworkConnectionByUserId,
  persistUpworkConnection
} from "@/server/repos/connected-account-repo";

export async function getUpworkConnectionStatus(userId: string) {
  return findUpworkConnectionByUserId(userId);
}

export function createUpworkConnectUrl(userId: string) {
  const state = createUpworkOauthState(userId);

  return buildUpworkAuthorizationUrl({ state });
}

export async function handleUpworkCallback(input: {
  code: string;
  state: string;
  tenantId?: string | null;
}) {
  const parsedState = parseUpworkOauthState(input.state);

  try {
    const tokens = await exchangeAuthorizationCode(input.code);

    await storeUpworkTokens({
      userId: parsedState.userId,
      tokens,
      tenantId: input.tenantId
    });

    return {
      userId: parsedState.userId,
      status: ConnectedAccountStatus.ACTIVE
    };
  } catch (error) {
    await persistUpworkConnection({
      userId: parsedState.userId,
      status: ConnectedAccountStatus.ERROR,
      tenantId: input.tenantId,
      errorCode: "TOKEN_EXCHANGE_FAILED",
      errorMessage:
        error instanceof Error ? error.message : "Unknown Upwork callback failure"
    });

    throw error;
  }
}

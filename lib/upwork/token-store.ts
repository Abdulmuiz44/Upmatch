import "server-only";

import { ConnectedAccountStatus } from "@prisma/client";

import { encryptSecret } from "@/lib/crypto/tokens";
import { persistUpworkConnection } from "@/server/repos/connected-account-repo";
import type { UpworkTokenResponse } from "@/lib/upwork/oauth";

type StoreUpworkTokenInput = {
  userId: string;
  tokens: UpworkTokenResponse;
  tenantId?: string | null;
};

export async function storeUpworkTokens(input: StoreUpworkTokenInput) {
  await persistUpworkConnection({
    userId: input.userId,
    status: ConnectedAccountStatus.ACTIVE,
    tenantId: input.tenantId ?? null,
    encryptedAccessToken: encryptSecret(input.tokens.access_token),
    encryptedRefreshToken: input.tokens.refresh_token
      ? encryptSecret(input.tokens.refresh_token)
      : null,
    accessTokenExpiresAt: input.tokens.expires_in
      ? new Date(Date.now() + input.tokens.expires_in * 1000)
      : null,
    refreshTokenExpiresAt: input.tokens.refresh_token_expires_in
      ? new Date(Date.now() + input.tokens.refresh_token_expires_in * 1000)
      : null,
    scope: input.tokens.scope ?? null,
    errorCode: null,
    errorMessage: null
  });
}

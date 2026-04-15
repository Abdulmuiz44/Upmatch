import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate } from "@/lib/db/row";
import {
  ConnectedAccountProvider,
  ConnectedAccountStatus,
  type ConnectedAccount
} from "@/lib/db/types";

type ConnectedAccountRow = {
  id: string;
  user_id: string;
  provider: ConnectedAccountProvider;
  status: ConnectedAccountStatus;
  external_account_id: string | null;
  tenant_id: string | null;
  scope: string | null;
  encrypted_access_token: string | null;
  encrypted_refresh_token: string | null;
  access_token_expires_at: Date | string | null;
  refresh_token_expires_at: Date | string | null;
  last_synced_at: Date | string | null;
  error_code: string | null;
  error_message: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapConnectedAccount(row: ConnectedAccountRow): ConnectedAccount {
  return {
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    status: row.status,
    externalAccountId: row.external_account_id,
    tenantId: row.tenant_id,
    scope: row.scope,
    encryptedAccessToken: row.encrypted_access_token,
    encryptedRefreshToken: row.encrypted_refresh_token,
    accessTokenExpiresAt: toDate(row.access_token_expires_at),
    refreshTokenExpiresAt: toDate(row.refresh_token_expires_at),
    lastSyncedAt: toDate(row.last_synced_at),
    errorCode: row.error_code,
    errorMessage: row.error_message,
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function findUpworkConnectionByUserId(userId: string) {
  const result = await query<ConnectedAccountRow>(
    `SELECT *
     FROM connected_accounts
     WHERE provider = $1 AND user_id = $2
     LIMIT 1`,
    [ConnectedAccountProvider.UPWORK, userId]
  );

  return result.rows[0] ? mapConnectedAccount(result.rows[0]) : null;
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

export async function persistUpworkConnection(input: PersistUpworkConnectionInput) {
  const result = await query<ConnectedAccountRow>(
    `INSERT INTO connected_accounts (
       id,
       user_id,
       provider,
       status,
       tenant_id,
       encrypted_access_token,
       encrypted_refresh_token,
       access_token_expires_at,
       refresh_token_expires_at,
       scope,
       error_code,
       error_message
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (provider, user_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       tenant_id = EXCLUDED.tenant_id,
       encrypted_access_token = EXCLUDED.encrypted_access_token,
       encrypted_refresh_token = EXCLUDED.encrypted_refresh_token,
       access_token_expires_at = EXCLUDED.access_token_expires_at,
       refresh_token_expires_at = EXCLUDED.refresh_token_expires_at,
       scope = EXCLUDED.scope,
       error_code = EXCLUDED.error_code,
       error_message = EXCLUDED.error_message,
       updated_at = NOW()
     RETURNING *`,
    [
      createId(),
      input.userId,
      ConnectedAccountProvider.UPWORK,
      input.status,
      input.tenantId ?? null,
      input.encryptedAccessToken ?? null,
      input.encryptedRefreshToken ?? null,
      input.accessTokenExpiresAt ?? null,
      input.refreshTokenExpiresAt ?? null,
      input.scope ?? null,
      input.errorCode ?? null,
      input.errorMessage ?? null
    ]
  );

  return mapConnectedAccount(result.rows[0]);
}

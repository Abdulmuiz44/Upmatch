import "server-only";

import { randomBytes } from "crypto";

import { env } from "@/lib/env";
import {
  UPWORK_OAUTH_AUTHORIZE_URL,
  UPWORK_OAUTH_TOKEN_URL
} from "@/lib/upwork/constants";

type AuthorizationUrlOptions = {
  state: string;
};

export type UpworkTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
};

export function createUpworkOauthState(userId: string) {
  const nonce = randomBytes(16).toString("hex");
  return Buffer.from(JSON.stringify({ nonce, userId }), "utf8").toString("base64url");
}

export function parseUpworkOauthState(state: string) {
  const decoded = Buffer.from(state, "base64url").toString("utf8");
  const parsed = JSON.parse(decoded) as { nonce: string; userId: string };

  if (!parsed.userId || !parsed.nonce) {
    throw new Error("Invalid Upwork OAuth state");
  }

  return parsed;
}

export function buildUpworkAuthorizationUrl({
  state
}: AuthorizationUrlOptions) {
  const url = new URL(UPWORK_OAUTH_AUTHORIZE_URL);
  url.searchParams.set("client_id", env.UPWORK_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", env.UPWORK_REDIRECT_URI);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeAuthorizationCode(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.UPWORK_CLIENT_ID,
    client_secret: env.UPWORK_CLIENT_SECRET,
    redirect_uri: env.UPWORK_REDIRECT_URI
  });

  const response = await fetch(UPWORK_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Upwork token exchange failed with status ${response.status}`);
  }

  return (await response.json()) as UpworkTokenResponse;
}

export function buildTenantHeaders(tenantId?: string | null) {
  if (!tenantId) {
    return {};
  }

  return {
    "X-Upwork-API-TenantId": tenantId
  };
}

import "server-only";

import { env } from "@/lib/env";
import { decryptSecret } from "@/lib/crypto/tokens";
import { UPWORK_GRAPHQL_URL } from "@/lib/upwork/constants";
import { buildTenantHeaders } from "@/lib/upwork/oauth";

type GraphqlRequestOptions<TVariables> = {
  query: string;
  variables?: TVariables;
  encryptedAccessToken: string;
  tenantId?: string | null;
};

type GraphqlEnvelope<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 350;
const MIN_REQUEST_GAP_MS = 300;
let lastRequestStartedAt = 0;

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status: number) {
  return status === 429 || status >= 500;
}

function logEvent(event: string, payload: Record<string, unknown>) {
  console.info(JSON.stringify({ event, ...payload }));
}

export async function upworkGraphqlRequest<TData, TVariables = Record<string, unknown>>(
  options: GraphqlRequestOptions<TVariables>
) {
  const accessToken = decryptSecret(options.encryptedAccessToken);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const elapsed = Date.now() - lastRequestStartedAt;
    if (elapsed < MIN_REQUEST_GAP_MS) {
      await sleep(MIN_REQUEST_GAP_MS - elapsed);
    }

    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    });

    const tenantHeaders = buildTenantHeaders(options.tenantId);
    if (tenantHeaders["X-Upwork-API-TenantId"]) {
      headers.set("X-Upwork-API-TenantId", tenantHeaders["X-Upwork-API-TenantId"]);
    }

    lastRequestStartedAt = Date.now();

    const response = await fetch(UPWORK_GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: options.query,
        variables: options.variables
      }),
      cache: "no-store",
      next: {
        revalidate: 0,
        tags: ["upwork-graphql", env.APP_URL]
      }
    });

    if (!response.ok) {
      if (attempt < MAX_ATTEMPTS && shouldRetryStatus(response.status)) {
        const backoff = BASE_BACKOFF_MS * attempt;
        logEvent("upwork.graphql.retry", { status: response.status, attempt, backoff });
        await sleep(backoff);
        continue;
      }

      throw new Error(`Upwork GraphQL request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as GraphqlEnvelope<TData>;

    if (payload.errors?.length) {
      const message = payload.errors.map((error) => error.message).join("; ");
      throw new Error(message);
    }

    if (!payload.data) {
      throw new Error("Upwork GraphQL response did not contain data");
    }

    return payload.data;
  }

  throw new Error("Upwork GraphQL request exhausted retries");
}

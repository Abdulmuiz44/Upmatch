import "server-only";

import { env } from "@/lib/env";
import { buildTenantHeaders } from "@/lib/upwork/oauth";
import { decryptSecret } from "@/lib/crypto/tokens";
import { UPWORK_GRAPHQL_URL } from "@/lib/upwork/constants";

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

export async function upworkGraphqlRequest<TData, TVariables = Record<string, unknown>>(
  options: GraphqlRequestOptions<TVariables>
) {
  const accessToken = decryptSecret(options.encryptedAccessToken);
  const response = await fetch(UPWORK_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...buildTenantHeaders(options.tenantId)
    },
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
    throw new Error(`Upwork GraphQL request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GraphqlEnvelope<TData>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("Upwork GraphQL response did not contain data");
  }

  return payload.data;
}

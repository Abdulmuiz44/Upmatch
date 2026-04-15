import "server-only";

import { randomUUID } from "node:crypto";

import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from "pg";

import { env } from "@/lib/env";

function parseDatabaseConfig(): PoolConfig {
  const databaseUrl = new URL(env.DATABASE_URL);
  const schema = databaseUrl.searchParams.get("schema");
  databaseUrl.searchParams.delete("schema");

  const config: PoolConfig = {
    connectionString: databaseUrl.toString()
  };

  if (schema) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error("Invalid DATABASE_URL schema parameter");
    }

    config.options = `-c search_path=${schema}`;
  }

  return config;
}

const globalForDb = globalThis as typeof globalThis & {
  upmatchPool?: Pool;
};

export const db =
  globalForDb.upmatchPool ??
  new Pool({
    ...parseDatabaseConfig(),
    max: process.env.NODE_ENV === "development" ? 5 : 10
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.upmatchPool = db;
}

export function createId() {
  return randomUUID();
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return db.query<T>(text, params);
}

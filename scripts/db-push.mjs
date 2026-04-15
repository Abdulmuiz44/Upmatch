import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import pg from "pg";

const { Client } = pg;

function getConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const schema = databaseUrl.searchParams.get("schema") ?? "public";
  databaseUrl.searchParams.delete("schema");

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
    throw new Error("Invalid DATABASE_URL schema parameter");
  }

  return {
    connectionString: databaseUrl.toString(),
    schema
  };
}

const { connectionString, schema } = getConfig();
const client = new Client({ connectionString });

const schemaSqlPath = path.join(process.cwd(), "db", "schema.sql");
const schemaSql = await readFile(schemaSqlPath, "utf8");

try {
  await client.connect();
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await client.query(`SET search_path TO "${schema}"`);
  await client.query(schemaSql);
  console.log(`Database schema applied successfully to schema "${schema}".`);
} finally {
  await client.end().catch(() => {});
}

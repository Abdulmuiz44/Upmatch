import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  APP_URL: z.string().url(),
  UPWORK_CLIENT_ID: z.string().min(1),
  UPWORK_CLIENT_SECRET: z.string().min(1),
  UPWORK_REDIRECT_URI: z.string().url(),
  TOKEN_ENCRYPTION_KEY: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/, "TOKEN_ENCRYPTION_KEY must be 64 hex characters")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

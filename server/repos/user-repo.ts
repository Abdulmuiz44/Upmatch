import "server-only";

import { createId, query } from "@/lib/db/client";
import { toDate } from "@/lib/db/row";
import type { User } from "@/lib/db/types";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    createdAt: toDate(row.created_at) as Date,
    updatedAt: toDate(row.updated_at) as Date
  };
}

export async function findUserByEmail(email: string) {
  const result = await query<UserRow>(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase()]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserById(id: string) {
  const result = await query<UserRow>(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createUser(input: {
  email: string;
  fullName?: string;
  passwordHash: string;
}) {
  const result = await query<UserRow>(
    `INSERT INTO users (id, email, full_name, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [createId(), input.email.toLowerCase(), input.fullName ?? null, input.passwordHash]
  );

  return mapUser(result.rows[0]);
}

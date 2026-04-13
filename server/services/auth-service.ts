import "server-only";

import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, signupSchema } from "@/lib/auth/validation";
import { createUser, findUserByEmail } from "@/server/repos/user-repo";

export async function registerUser(rawInput: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const input = signupSchema.parse(rawInput);
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    fullName: input.fullName,
    passwordHash
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email
  });

  return user;
}

export async function signInUser(rawInput: { email: string; password: string }) {
  const input = loginSchema.parse(rawInput);
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Invalid email or password.");
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email
  });

  return user;
}

export async function createEphemeralSessionPreview(email: string, userId: string) {
  return createSessionToken({ email, userId });
}

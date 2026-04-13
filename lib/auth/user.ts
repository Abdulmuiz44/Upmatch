import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/server/repos/user-repo";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return findUserById(session.userId);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

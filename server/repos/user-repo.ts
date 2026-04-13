import "server-only";

import { prisma } from "@/lib/prisma";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export function createUser(input: {
  email: string;
  fullName?: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash: input.passwordHash
    }
  });
}

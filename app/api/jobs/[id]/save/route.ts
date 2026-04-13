import { JobUserStateType } from "@prisma/client";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { upsertJobUserState } from "@/server/repos/job-user-state-repo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id } = await params;

  await upsertJobUserState({
    userId: session.userId,
    jobId: id,
    state: JobUserStateType.SAVED
  });

  return NextResponse.redirect(new URL(`/dashboard/jobs/${id}?saved=1`, request.url));
}

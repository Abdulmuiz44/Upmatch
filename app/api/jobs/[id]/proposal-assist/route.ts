import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { generateProposalAssist } from "@/server/services/proposal-assist-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id } = await params;
  const result = await generateProposalAssist(session.userId, id);

  if (!result.ok) {
    return NextResponse.redirect(new URL(`/dashboard/jobs/${id}?assist=error`, request.url));
  }

  return NextResponse.redirect(new URL(`/dashboard/jobs/${id}?assist=generated`, request.url));
}

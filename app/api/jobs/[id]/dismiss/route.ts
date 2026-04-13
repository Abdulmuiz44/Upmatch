import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id } = await params;

  return NextResponse.redirect(
    new URL(`/dashboard/jobs/${id}?dismissed=placeholder`, request.url)
  );
}

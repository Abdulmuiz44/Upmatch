import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(
    new URL("/dashboard?refresh=placeholder", request.url)
  );
}

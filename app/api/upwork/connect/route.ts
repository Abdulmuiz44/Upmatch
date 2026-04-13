import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { createUpworkConnectUrl } from "@/server/services/upwork-connection-service";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectUrl = createUpworkConnectUrl(session.userId);

  return NextResponse.redirect(redirectUrl);
}

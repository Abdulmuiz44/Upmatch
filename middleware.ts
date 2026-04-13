import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/auth/jwt";

const protectedPrefixes = ["/dashboard", "/api/jobs", "/api/upwork/connect"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);

  const requiresAuth = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!requiresAuth) {
    return NextResponse.next({
      request: { headers }
    });
  }

  const token = request.cookies.get("upmatch_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifySessionToken(token);

    return NextResponse.next({
      request: { headers }
    });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/jobs/:path*", "/api/upwork/connect"]
};

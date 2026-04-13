import { NextResponse } from "next/server";

import { handleUpworkCallback } from "@/server/services/upwork-connection-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const tenantId =
    url.searchParams.get("tenantId") ?? request.headers.get("x-upwork-api-tenantid");

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=missing_oauth_parameters", request.url)
    );
  }

  try {
    await handleUpworkCallback({
      code,
      state,
      tenantId
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?connected=upwork", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=upwork_callback_failed", request.url)
    );
  }
}

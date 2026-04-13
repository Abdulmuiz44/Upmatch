import { NextResponse } from "next/server";

import { signInUser } from "@/server/services/auth-service";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    await signInUser({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}

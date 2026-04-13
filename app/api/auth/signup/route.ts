import { NextResponse } from "next/server";

import { registerUser } from "@/server/services/auth-service";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    await registerUser({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      fullName: String(formData.get("fullName") ?? "") || undefined
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account";

    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}

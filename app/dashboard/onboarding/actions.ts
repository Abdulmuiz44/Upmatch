"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { saveUserPreferencesFromForm } from "@/server/services/preferences-service";

export async function saveOnboardingPreferences(formData: FormData) {
  const user = await requireUser();

  await saveUserPreferencesFromForm(user.id, formData);

  redirect("/dashboard");
}

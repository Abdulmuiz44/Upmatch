import "server-only";

import { ContractTypePreference } from "@/lib/db/types";

import { onboardingSchema } from "@/lib/auth/validation";
import { splitCommaSeparated } from "@/lib/utils";
import { getPreferenceByUserId, upsertPreference } from "@/server/repos/preference-repo";

export async function getUserPreferences(userId: string) {
  return getPreferenceByUserId(userId);
}

export async function saveUserPreferencesFromForm(
  userId: string,
  formData: FormData
) {
  const preferredRoles = splitCommaSeparated(
    String(formData.get("preferredRoles") ?? "")
  );
  const preferredKeywords = splitCommaSeparated(
    String(formData.get("preferredKeywords") ?? "")
  );
  const excludedKeywords = splitCommaSeparated(
    String(formData.get("excludedKeywords") ?? "")
  );
  const preferredIndustries = splitCommaSeparated(
    String(formData.get("preferredIndustries") ?? "")
  );
  const minimumHourlyRateRaw = String(formData.get("minimumHourlyRateUsd") ?? "");
  const minimumFixedBudgetRaw = String(formData.get("minimumFixedBudgetUsd") ?? "");

  const parsed = onboardingSchema.parse({
    preferredRoles,
    preferredKeywords,
    excludedKeywords,
    preferredIndustries,
    minimumHourlyRateUsd: minimumHourlyRateRaw ? Number(minimumHourlyRateRaw) : null,
    minimumFixedBudgetUsd: minimumFixedBudgetRaw ? Number(minimumFixedBudgetRaw) : null,
    contractType: String(formData.get("contractType") ?? "BOTH")
  });

  return upsertPreference({
    userId,
    preferredRoles: parsed.preferredRoles,
    preferredKeywords: parsed.preferredKeywords,
    excludedKeywords: parsed.excludedKeywords,
    preferredIndustries: parsed.preferredIndustries,
    minimumHourlyRateUsd: parsed.minimumHourlyRateUsd,
    minimumFixedBudgetUsd: parsed.minimumFixedBudgetUsd,
    contractType: parsed.contractType as ContractTypePreference
  });
}

import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().min(2).max(120).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const onboardingSchema = z.object({
  preferredRoles: z.array(z.string().min(1)).max(12),
  minimumHourlyRateUsd: z.number().nonnegative().nullable(),
  minimumFixedBudgetUsd: z.number().nonnegative().nullable(),
  preferredKeywords: z.array(z.string().min(1)).max(24),
  excludedKeywords: z.array(z.string().min(1)).max(24),
  preferredIndustries: z.array(z.string().min(1)).max(16),
  contractType: z.enum(["HOURLY", "FIXED_PRICE", "BOTH"])
});

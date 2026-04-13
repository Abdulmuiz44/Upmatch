import assert from "node:assert/strict";
import test from "node:test";
import { ContractTypePreference, Prisma } from "@prisma/client";

import { scoreJob } from "@/server/services/job-ranking-service";

test("scoreJob rewards keyword and skill overlap", () => {
  const result = scoreJob({
    preference: {
      id: "pref_1",
      userId: "u_1",
      preferredRoles: ["react"],
      preferredKeywords: ["typescript", "next"],
      excludedKeywords: [],
      preferredIndustries: [],
      minimumHourlyRateUsd: new Prisma.Decimal(50),
      minimumFixedBudgetUsd: null,
      contractType: ContractTypePreference.HOURLY,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    profile: {
      profileTitle: "React Engineer",
      overview: "TypeScript and Next specialist",
      skills: ["React", "TypeScript"]
    },
    job: {
      id: "job_1",
      providerJobId: "up_1",
      providerCiphertext: null,
      title: "Need React + TypeScript dev",
      description: "Build Next.js dashboard",
      contractType: "HOURLY",
      experienceLevel: null,
      hourlyMinUsd: new Prisma.Decimal(60),
      hourlyMaxUsd: new Prisma.Decimal(80),
      fixedBudgetUsd: null,
      durationLabel: null,
      category: "Web Development",
      skills: ["React", "TypeScript"],
      clientCountry: null,
      clientTotalHires: null,
      clientTotalPostedJobs: null,
      clientTotalReviews: null,
      clientTotalFeedback: null,
      publishedAt: new Date(),
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      rawPayload: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  assert.ok(result.overallScore > 50);
  assert.ok(result.explanation.matchedKeywords.includes("typescript"));
});

test("scoreJob applies exclusion penalty", () => {
  const result = scoreJob({
    preference: {
      id: "pref_2",
      userId: "u_1",
      preferredRoles: [],
      preferredKeywords: ["backend"],
      excludedKeywords: ["blockchain"],
      preferredIndustries: [],
      minimumHourlyRateUsd: null,
      minimumFixedBudgetUsd: null,
      contractType: ContractTypePreference.BOTH,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    profile: null,
    job: {
      id: "job_2",
      providerJobId: "up_2",
      providerCiphertext: null,
      title: "Blockchain backend build",
      description: "Need blockchain protocol work",
      contractType: "FIXED_PRICE",
      experienceLevel: null,
      hourlyMinUsd: null,
      hourlyMaxUsd: null,
      fixedBudgetUsd: new Prisma.Decimal(3000),
      durationLabel: null,
      category: "Software",
      skills: ["Node.js"],
      clientCountry: null,
      clientTotalHires: null,
      clientTotalPostedJobs: null,
      clientTotalReviews: null,
      clientTotalFeedback: null,
      publishedAt: new Date(),
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      rawPayload: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  assert.ok(result.penaltyScore > 0);
  assert.ok(result.explanation.warnings.some((warning) => warning.includes("excluded keyword")));
});

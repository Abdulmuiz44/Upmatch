import assert from "node:assert/strict";
import test from "node:test";

import { ContractTypePreference } from "@/lib/db/types";
import { rankingConfig } from "@/server/services/job-ranking-config";
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
      minimumHourlyRateUsd: 50,
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
      hourlyMinUsd: 60,
      hourlyMaxUsd: 80,
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

  assert.ok(result.overallScore > 55);
  assert.ok(result.explanation.matchedKeywords.includes("typescript"));
  assert.equal(result.explanation.warningLevel, "none");
});

test("ranking config caps are respected", () => {
  const result = scoreJob({
    preference: {
      id: "pref_2",
      userId: "u_1",
      preferredRoles: ["react", "next", "typescript", "frontend"],
      preferredKeywords: ["react", "next", "typescript", "frontend"],
      excludedKeywords: [],
      preferredIndustries: ["saas", "ecommerce"],
      minimumHourlyRateUsd: null,
      minimumFixedBudgetUsd: null,
      contractType: ContractTypePreference.BOTH,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    profile: {
      profileTitle: "Senior React Engineer",
      overview: null,
      skills: ["react", "next", "typescript", "frontend"]
    },
    job: {
      id: "job_2",
      providerJobId: "up_2",
      providerCiphertext: null,
      title: "React Next TypeScript Frontend SaaS",
      description: "React Next TypeScript Frontend",
      contractType: "HOURLY",
      experienceLevel: null,
      hourlyMinUsd: null,
      hourlyMaxUsd: null,
      fixedBudgetUsd: null,
      durationLabel: null,
      category: "SaaS",
      skills: ["react", "next", "typescript", "frontend"],
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

  assert.ok(result.skillScore <= rankingConfig.scoreCaps.skill);
  assert.ok(result.keywordScore <= rankingConfig.scoreCaps.keyword);
  assert.ok(result.preferenceScore <= rankingConfig.scoreCaps.preference);
});

test("scoreJob applies exclusion penalty", () => {
  const result = scoreJob({
    preference: {
      id: "pref_3",
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
      id: "job_3",
      providerJobId: "up_3",
      providerCiphertext: null,
      title: "Blockchain backend build",
      description: "Need blockchain protocol work",
      contractType: "FIXED_PRICE",
      experienceLevel: null,
      hourlyMinUsd: null,
      hourlyMaxUsd: null,
      fixedBudgetUsd: 3000,
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

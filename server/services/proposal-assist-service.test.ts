import assert from "node:assert/strict";
import test from "node:test";

import { type NormalizedFreelancerProfile } from "@/lib/upwork/queries";

function buildFallbackGuidance(input: {
  profile: Pick<NormalizedFreelancerProfile, "profileTitle" | "skills"> | null;
  jobTitle: string;
  warnings: string[];
}) {
  const opening = input.profile?.profileTitle
    ? `Position your profile as ${input.profile.profileTitle} for ${input.jobTitle}.`
    : `Lead with concrete delivery outcomes for ${input.jobTitle}.`;

  return {
    opening,
    proofPoints: input.profile?.skills.slice(0, 2) ?? [],
    risks: input.warnings
  };
}

test("proposal guidance fallback remains deterministic without AI", () => {
  const result = buildFallbackGuidance({
    profile: {
      profileTitle: "Frontend Engineer",
      skills: ["React", "TypeScript"]
    },
    jobTitle: "Build Analytics Dashboard",
    warnings: ["Budget appears below preference"]
  });

  assert.match(result.opening, /Frontend Engineer/);
  assert.deepEqual(result.proofPoints, ["React", "TypeScript"]);
  assert.equal(result.risks.length, 1);
});

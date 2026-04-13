import assert from "node:assert/strict";
import test from "node:test";

import { normalizeFreelancerProfile, normalizeMarketplaceJobs } from "@/lib/upwork/queries";

test("normalizeFreelancerProfile handles nulls safely", () => {
  const normalized = normalizeFreelancerProfile({ freelancer: { profile: null } });
  assert.equal(normalized, null);
});

test("normalizeMarketplaceJobs keeps required fields and drops invalid edges", () => {
  const jobs = normalizeMarketplaceJobs({
    marketplaceJobPostingsSearch: {
      edges: [
        {
          node: {
            id: "123",
            title: "Frontend Engineer",
            description: "React role",
            classification: {
              occupation: {
                category: { name: "Web" },
                skills: [{ name: "React" }, { name: "TypeScript" }]
              }
            }
          }
        },
        {
          node: {
            title: "Missing ID"
          }
        }
      ]
    }
  });

  assert.equal(jobs.length, 1);
  assert.equal(jobs[0]?.providerJobId, "123");
  assert.deepEqual(jobs[0]?.skills, ["React", "TypeScript"]);
});

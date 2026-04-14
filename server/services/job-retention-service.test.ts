import assert from "node:assert/strict";
import test from "node:test";

import { buildCleanupPlan } from "@/server/services/job-retention-service";

test("buildCleanupPlan returns no-op when no expired jobs", () => {
  const plan = buildCleanupPlan([]);
  assert.equal(plan.shouldCleanup, false);
  assert.equal(plan.totalJobs, 0);
});

test("buildCleanupPlan marks cleanup when ids exist", () => {
  const plan = buildCleanupPlan(["job_1", "job_2"]);
  assert.equal(plan.shouldCleanup, true);
  assert.equal(plan.totalJobs, 2);
});

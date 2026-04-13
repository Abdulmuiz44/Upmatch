import "server-only";

import { getPreferenceByUserId } from "@/server/repos/preference-repo";
import { findUpworkConnectionByUserId } from "@/server/repos/connected-account-repo";

const placeholderJobs = [
  {
    id: "job-react-typescript-platform",
    title: "Senior React + TypeScript Engineer for Workflow Product",
    score: 92,
    summary: "High-fit placeholder for the future ranked jobs feed.",
    reason: "Matches frontend specialization and long-term product work."
  },
  {
    id: "job-ai-dashboard-ux",
    title: "Build SaaS Dashboard UX for Internal Operations Tool",
    score: 84,
    summary: "Signals product-facing dashboard work with UI depth.",
    reason: "Strong UI overlap but needs validation against final budget."
  },
  {
    id: "job-fullstack-retainer",
    title: "Retainer Needed for Full-Stack App Router Support",
    score: 73,
    summary: "Moderate fit placeholder with mixed frontend and backend scope.",
    reason: "Interesting recurring work, but role fit depends on pricing thresholds."
  }
];

export async function getDashboardSnapshot(userId: string) {
  const [connection, preference] = await Promise.all([
    findUpworkConnectionByUserId(userId),
    getPreferenceByUserId(userId)
  ]);

  return {
    connection,
    preference,
    jobs: placeholderJobs
  };
}

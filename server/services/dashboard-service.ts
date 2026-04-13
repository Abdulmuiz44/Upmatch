import "server-only";

import { getFreelancerProfileByUserId } from "@/server/repos/freelancer-profile-repo";
import { getDismissedJobIds, getJobUserState } from "@/server/repos/job-user-state-repo";
import { getRankedJobsForUser } from "@/server/repos/job-score-repo";
import { getPreferenceByUserId } from "@/server/repos/preference-repo";
import { findUpworkConnectionByUserId } from "@/server/repos/connected-account-repo";

export async function getDashboardSnapshot(userId: string) {
  const [connection, preference, profile, rankedRows, dismissedJobIds] = await Promise.all([
    findUpworkConnectionByUserId(userId),
    getPreferenceByUserId(userId),
    getFreelancerProfileByUserId(userId),
    getRankedJobsForUser(userId),
    getDismissedJobIds(userId)
  ]);

  const dismissed = new Set(dismissedJobIds);
  const rows = rankedRows.filter((row) => !dismissed.has(row.jobId));

  const jobs = await Promise.all(
    rows.map(async (row) => {
      const state = await getJobUserState(userId, row.jobId);

      return {
        id: row.job.id,
        title: row.job.title,
        summary: row.job.description.slice(0, 180),
        overallScore: row.overallScore,
        explanation: row.explanation as {
          topReasons?: string[];
          warnings?: string[];
          matchedKeywords?: string[];
          missingSignals?: string[];
        },
        state: state?.state ?? "NEW"
      };
    })
  );

  return {
    connection,
    preference,
    profile,
    jobs,
    emptyStates: {
      noConnection: !connection,
      noPreferences: !preference,
      noSyncedProfile: !profile?.syncedAt,
      noJobsFound: rankedRows.length === 0,
      noRankedJobs: jobs.length === 0
    }
  };
}

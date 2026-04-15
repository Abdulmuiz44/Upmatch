export const ConnectedAccountProvider = {
  UPWORK: "UPWORK"
} as const;

export type ConnectedAccountProvider =
  (typeof ConnectedAccountProvider)[keyof typeof ConnectedAccountProvider];

export const ConnectedAccountStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
  ERROR: "ERROR"
} as const;

export type ConnectedAccountStatus =
  (typeof ConnectedAccountStatus)[keyof typeof ConnectedAccountStatus];

export const ContractTypePreference = {
  HOURLY: "HOURLY",
  FIXED_PRICE: "FIXED_PRICE",
  BOTH: "BOTH"
} as const;

export type ContractTypePreference =
  (typeof ContractTypePreference)[keyof typeof ContractTypePreference];

export const JobUserStateType = {
  NEW: "NEW",
  SAVED: "SAVED",
  DISMISSED: "DISMISSED",
  APPLIED: "APPLIED"
} as const;

export type JobUserStateType =
  (typeof JobUserStateType)[keyof typeof JobUserStateType];

export const SyncRunType = {
  PROFILE_SYNC: "PROFILE_SYNC",
  JOB_INGEST: "JOB_INGEST",
  JOB_RANK: "JOB_RANK",
  FULL_REFRESH: "FULL_REFRESH",
  CLEANUP: "CLEANUP",
  PROPOSAL_ASSIST: "PROPOSAL_ASSIST"
} as const;

export type SyncRunType = (typeof SyncRunType)[keyof typeof SyncRunType];

export const SyncRunStatus = {
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED"
} as const;

export type SyncRunStatus = (typeof SyncRunStatus)[keyof typeof SyncRunStatus];

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ConnectedAccount = {
  id: string;
  userId: string;
  provider: ConnectedAccountProvider;
  status: ConnectedAccountStatus;
  externalAccountId: string | null;
  tenantId: string | null;
  scope: string | null;
  encryptedAccessToken: string | null;
  encryptedRefreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  lastSyncedAt: Date | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FreelancerProfile = {
  id: string;
  userId: string;
  upworkProfileId: string | null;
  profileTitle: string | null;
  overview: string | null;
  hourlyRateUsdCents: number | null;
  profileUrl: string | null;
  categories: string[];
  skills: string[];
  rawPayload: JsonValue | null;
  syncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPreference = {
  id: string;
  userId: string;
  preferredRoles: string[];
  preferredKeywords: string[];
  excludedKeywords: string[];
  preferredIndustries: string[];
  minimumHourlyRateUsd: number | null;
  minimumFixedBudgetUsd: number | null;
  contractType: ContractTypePreference;
  createdAt: Date;
  updatedAt: Date;
};

export type Job = {
  id: string;
  providerJobId: string;
  providerCiphertext: string | null;
  title: string;
  description: string;
  contractType: string | null;
  experienceLevel: string | null;
  hourlyMinUsd: number | null;
  hourlyMaxUsd: number | null;
  fixedBudgetUsd: number | null;
  durationLabel: string | null;
  category: string | null;
  skills: string[];
  clientCountry: string | null;
  clientTotalHires: number | null;
  clientTotalPostedJobs: number | null;
  clientTotalReviews: number | null;
  clientTotalFeedback: number | null;
  publishedAt: Date | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  rawPayload: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JobScore = {
  id: string;
  userId: string;
  jobId: string;
  overallScore: number;
  skillScore: number;
  keywordScore: number;
  budgetScore: number;
  preferenceScore: number;
  freshnessScore: number;
  penaltyScore: number;
  explanation: JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export type JobScoreWithJob = JobScore & {
  job: Job;
};

export type JobUserState = {
  id: string;
  userId: string;
  jobId: string;
  state: JobUserStateType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProposalAssist = {
  id: string;
  userId: string;
  jobId: string;
  openingAngle: string | null;
  keyProofPoints: string[];
  risksToAddress: string[];
  clientQuestions: string[];
  toneGuidance: string | null;
  generatedAt: Date;
  updatedAt: Date;
};

export type SyncRun = {
  id: string;
  userId: string;
  type: SyncRunType;
  status: SyncRunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

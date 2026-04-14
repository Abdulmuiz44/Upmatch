-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ConnectedAccountProvider" AS ENUM ('UPWORK');

-- CreateEnum
CREATE TYPE "ConnectedAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "ContractTypePreference" AS ENUM ('HOURLY', 'FIXED_PRICE', 'BOTH');

-- CreateEnum
CREATE TYPE "JobUserStateType" AS ENUM ('NEW', 'SAVED', 'DISMISSED', 'APPLIED');

-- CreateEnum
CREATE TYPE "SyncRunType" AS ENUM ('PROFILE_SYNC', 'JOB_INGEST', 'JOB_RANK', 'FULL_REFRESH', 'CLEANUP', 'PROPOSAL_ASSIST');

-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ConnectedAccountProvider" NOT NULL,
    "status" "ConnectedAccountStatus" NOT NULL DEFAULT 'PENDING',
    "externalAccountId" TEXT,
    "tenantId" TEXT,
    "scope" TEXT,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "upworkProfileId" TEXT,
    "profileTitle" TEXT,
    "overview" TEXT,
    "hourlyRateUsdCents" INTEGER,
    "profileUrl" TEXT,
    "categories" TEXT[],
    "skills" TEXT[],
    "rawPayload" JSONB,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelancerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredRoles" TEXT[],
    "preferredKeywords" TEXT[],
    "excludedKeywords" TEXT[],
    "preferredIndustries" TEXT[],
    "minimumHourlyRateUsd" DECIMAL(10,2),
    "minimumFixedBudgetUsd" DECIMAL(10,2),
    "contractType" "ContractTypePreference" NOT NULL DEFAULT 'BOTH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "providerJobId" TEXT NOT NULL,
    "providerCiphertext" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contractType" TEXT,
    "experienceLevel" TEXT,
    "hourlyMinUsd" DECIMAL(10,2),
    "hourlyMaxUsd" DECIMAL(10,2),
    "fixedBudgetUsd" DECIMAL(10,2),
    "durationLabel" TEXT,
    "category" TEXT,
    "skills" TEXT[],
    "clientCountry" TEXT,
    "clientTotalHires" INTEGER,
    "clientTotalPostedJobs" INTEGER,
    "clientTotalReviews" INTEGER,
    "clientTotalFeedback" DECIMAL(5,2),
    "publishedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "skillScore" INTEGER NOT NULL,
    "keywordScore" INTEGER NOT NULL,
    "budgetScore" INTEGER NOT NULL,
    "preferenceScore" INTEGER NOT NULL,
    "freshnessScore" INTEGER NOT NULL,
    "penaltyScore" INTEGER NOT NULL,
    "explanation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobUserState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "state" "JobUserStateType" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobUserState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalAssist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "openingAngle" TEXT,
    "keyProofPoints" TEXT[],
    "risksToAddress" TEXT[],
    "clientQuestions" TEXT[],
    "toneGuidance" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalAssist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SyncRunType" NOT NULL,
    "status" "SyncRunStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "ConnectedAccount_userId_status_idx" ON "ConnectedAccount"("userId", "status");

-- CreateIndex
CREATE INDEX "ConnectedAccount_provider_tenantId_idx" ON "ConnectedAccount"("provider", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_provider_userId_key" ON "ConnectedAccount"("provider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProfile_userId_key" ON "FreelancerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProfile_upworkProfileId_key" ON "FreelancerProfile"("upworkProfileId");

-- CreateIndex
CREATE INDEX "FreelancerProfile_syncedAt_idx" ON "FreelancerProfile"("syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPreference_contractType_idx" ON "UserPreference"("contractType");

-- CreateIndex
CREATE UNIQUE INDEX "Job_providerJobId_key" ON "Job"("providerJobId");

-- CreateIndex
CREATE INDEX "Job_publishedAt_idx" ON "Job"("publishedAt");

-- CreateIndex
CREATE INDEX "Job_expiresAt_idx" ON "Job"("expiresAt");

-- CreateIndex
CREATE INDEX "Job_lastSeenAt_idx" ON "Job"("lastSeenAt");

-- CreateIndex
CREATE INDEX "JobScore_userId_overallScore_idx" ON "JobScore"("userId", "overallScore");

-- CreateIndex
CREATE UNIQUE INDEX "JobScore_userId_jobId_key" ON "JobScore"("userId", "jobId");

-- CreateIndex
CREATE INDEX "JobUserState_userId_state_idx" ON "JobUserState"("userId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "JobUserState_userId_jobId_key" ON "JobUserState"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalAssist_userId_jobId_key" ON "ProposalAssist"("userId", "jobId");

-- CreateIndex
CREATE INDEX "SyncRun_userId_createdAt_idx" ON "SyncRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SyncRun_status_type_idx" ON "SyncRun"("status", "type");

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerProfile" ADD CONSTRAINT "FreelancerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserState" ADD CONSTRAINT "JobUserState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserState" ADD CONSTRAINT "JobUserState_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAssist" ADD CONSTRAINT "ProposalAssist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAssist" ADD CONSTRAINT "ProposalAssist_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncRun" ADD CONSTRAINT "SyncRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


import { ContractTypePreference } from "@prisma/client";

export const FREELANCER_PROFILE_QUERY = /* GraphQL */ `
  query FreelancerProfile {
    freelancer {
      profile {
        id
        title
        description
        rate {
          amount
        }
        profileUrl
        skills {
          name
        }
        categories {
          name
        }
      }
    }
  }
`;

type UpworkProfileNode = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  rate?: {
    amount?: number | null;
  } | null;
  profileUrl?: string | null;
  skills?: Array<{ name?: string | null } | null> | null;
  categories?: Array<{ name?: string | null } | null> | null;
};

export type UpworkFreelancerProfileResponse = {
  freelancer?: {
    profile?: UpworkProfileNode | null;
  } | null;
};

export type NormalizedFreelancerProfile = {
  upworkProfileId: string | null;
  profileTitle: string | null;
  overview: string | null;
  hourlyRateUsdCents: number | null;
  profileUrl: string | null;
  categories: string[];
  skills: string[];
  rawPayload: Record<string, unknown>;
};

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

export function normalizeFreelancerProfile(
  data: UpworkFreelancerProfileResponse
): NormalizedFreelancerProfile | null {
  const profile = data.freelancer?.profile;

  if (!profile) {
    return null;
  }

  const hourlyRateUsdCents =
    typeof profile.rate?.amount === "number" ? Math.round(profile.rate.amount * 100) : null;

  return {
    upworkProfileId: profile.id ?? null,
    profileTitle: profile.title ?? null,
    overview: profile.description ?? null,
    hourlyRateUsdCents,
    profileUrl: profile.profileUrl ?? null,
    categories: uniqueNonEmpty((profile.categories ?? []).map((entry) => entry?.name)),
    skills: uniqueNonEmpty((profile.skills ?? []).map((entry) => entry?.name)),
    rawPayload: {
      id: profile.id ?? null,
      title: profile.title ?? null,
      description: profile.description ?? null,
      hourlyRate: profile.rate?.amount ?? null,
      profileUrl: profile.profileUrl ?? null,
      skills: (profile.skills ?? []).map((entry) => entry?.name ?? null),
      categories: (profile.categories ?? []).map((entry) => entry?.name ?? null)
    }
  };
}

export const MARKETPLACE_JOB_SEARCH_QUERY = /* GraphQL */ `
  query MarketplaceJobSearch($request: MarketplaceJobSearchRequest!) {
    marketplaceJobPostingsSearch(request: $request) {
      edges {
        node {
          id
          ciphertext
          title
          description
          contractType
          experienceLevel
          engagementDuration
          publishedDateTime
          classification {
            preferredFreelancerLocation {
              city
              country
            }
            occupation {
              category {
                name
              }
              skills {
                name
              }
            }
          }
          hourlyBudgetMin
          hourlyBudgetMax
          fixedPriceAmount {
            amount
          }
          client {
            totalHires
            totalPostedJobs
            totalReviews
            totalFeedback
          }
        }
      }
    }
  }
`;

export type UpworkJobSearchResponse = {
  marketplaceJobPostingsSearch?: {
    edges?: Array<{
      node?: {
        id?: string | null;
        ciphertext?: string | null;
        title?: string | null;
        description?: string | null;
        contractType?: string | null;
        experienceLevel?: string | null;
        engagementDuration?: string | null;
        publishedDateTime?: string | null;
        classification?: {
          preferredFreelancerLocation?: {
            country?: string | null;
          } | null;
          occupation?: {
            category?: {
              name?: string | null;
            } | null;
            skills?: Array<{ name?: string | null } | null> | null;
          } | null;
        } | null;
        hourlyBudgetMin?: number | null;
        hourlyBudgetMax?: number | null;
        fixedPriceAmount?: {
          amount?: number | null;
        } | null;
        client?: {
          totalHires?: number | null;
          totalPostedJobs?: number | null;
          totalReviews?: number | null;
          totalFeedback?: number | null;
        } | null;
      } | null;
    }> | null;
  } | null;
};

export type MarketplaceSearchRequest = {
  pagination: { offset: number; count: number };
  sortAttributes?: string[];
  searchExpression?: string;
  contractTypes?: string[];
  budgetRange?: { minimum?: number };
};

export function buildMarketplaceSearchRequest(input: {
  preferredRoles: string[];
  preferredKeywords: string[];
  minimumHourlyRateUsd: number | null;
  minimumFixedBudgetUsd: number | null;
  contractType: ContractTypePreference;
  profileTitle?: string | null;
  profileSkills?: string[];
}): MarketplaceSearchRequest {
  const terms = uniqueNonEmpty([
    ...input.preferredRoles,
    ...input.preferredKeywords,
    ...(input.profileSkills ?? []).slice(0, 5),
    input.profileTitle ?? null
  ]).slice(0, 12);

  const contractTypes =
    input.contractType === ContractTypePreference.BOTH
      ? undefined
      : [input.contractType === ContractTypePreference.HOURLY ? "HOURLY" : "FIXED_PRICE"];

  const minimumBudget =
    input.contractType === ContractTypePreference.HOURLY
      ? input.minimumHourlyRateUsd ?? undefined
      : input.minimumFixedBudgetUsd ?? input.minimumHourlyRateUsd ?? undefined;

  return {
    pagination: { offset: 0, count: 25 },
    sortAttributes: ["RECENCY"],
    searchExpression: terms.join(" "),
    contractTypes,
    budgetRange: minimumBudget ? { minimum: minimumBudget } : undefined
  };
}

export type NormalizedJobRecord = {
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
  rawPayload: Record<string, unknown>;
};

export function normalizeMarketplaceJobs(data: UpworkJobSearchResponse): NormalizedJobRecord[] {
  const edges = data.marketplaceJobPostingsSearch?.edges ?? [];

  return edges
    .map((edge) => edge.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node?.id && node?.title))
    .map((node) => ({
      providerJobId: node.id as string,
      providerCiphertext: node.ciphertext ?? null,
      title: node.title as string,
      description: node.description ?? "",
      contractType: node.contractType ?? null,
      experienceLevel: node.experienceLevel ?? null,
      hourlyMinUsd: node.hourlyBudgetMin ?? null,
      hourlyMaxUsd: node.hourlyBudgetMax ?? null,
      fixedBudgetUsd: node.fixedPriceAmount?.amount ?? null,
      durationLabel: node.engagementDuration ?? null,
      category: node.classification?.occupation?.category?.name ?? null,
      skills: uniqueNonEmpty(
        (node.classification?.occupation?.skills ?? []).map((entry) => entry?.name)
      ),
      clientCountry: node.classification?.preferredFreelancerLocation?.country ?? null,
      clientTotalHires: node.client?.totalHires ?? null,
      clientTotalPostedJobs: node.client?.totalPostedJobs ?? null,
      clientTotalReviews: node.client?.totalReviews ?? null,
      clientTotalFeedback: node.client?.totalFeedback ?? null,
      publishedAt: node.publishedDateTime ? new Date(node.publishedDateTime) : null,
      rawPayload: {
        id: node.id ?? null,
        ciphertext: node.ciphertext ?? null,
        title: node.title ?? null,
        contractType: node.contractType ?? null,
        experienceLevel: node.experienceLevel ?? null,
        hourlyBudgetMin: node.hourlyBudgetMin ?? null,
        hourlyBudgetMax: node.hourlyBudgetMax ?? null,
        fixedPriceAmount: node.fixedPriceAmount?.amount ?? null,
        publishedDateTime: node.publishedDateTime ?? null,
        category: node.classification?.occupation?.category?.name ?? null,
        skills: (node.classification?.occupation?.skills ?? []).map((entry) => entry?.name ?? null)
      }
    }));
}

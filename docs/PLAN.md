# Upmatch Product Plan

## Product Name

Upmatch

## One-Line Summary

Upmatch is a compliance-first Upwork job intelligence copilot that helps freelancers discover, rank, and act on relevant opportunities without automating application submission.

## Problem Statement

Freelancers on Upwork face a noisy job feed, uneven proposal quality, and limited time to manually evaluate each opportunity. Good opportunities are easy to miss, weak-fit jobs waste Connects and attention, and generic proposal drafting lowers conversion quality. Existing automation-heavy tools often drift into scraping, spam, or auto-apply patterns that create platform and trust risk.

## Product Goal

Build a trusted assistant that helps freelancers:

- connect their Upwork account through official API mechanisms
- import profile context safely
- express targeting preferences clearly
- review ranked, explainable matches
- save, dismiss, and track interesting jobs
- generate proposal guidance that keeps the user in control

The core objective is better decision quality, not automated submission volume.

## Target Users

- solo freelancers who actively use Upwork and want better signal
- boutique agencies managing expert-level freelancer accounts
- specialists who need high-fit contract discovery instead of broad job browsing
- users who care about staying within platform rules and avoiding risky automation

## MVP Scope

The MVP is a job discovery, ranking, and proposal-assist dashboard.

Included in MVP:

- account signup and login
- secure Upwork OAuth connection flow
- freelancer profile import foundation
- user preferences for ideal jobs and exclusions
- official API-based job retrieval
- short-lived normalized job storage within allowed retention bounds
- explainable match scoring
- matched jobs dashboard
- save and dismiss actions
- proposal guidance and structured talking points
- click-through to Upwork for final application

## Non-Goals

Explicit non-goals for v1:

- auto-applying to jobs
- direct proposal submission to Upwork
- scraping Upwork pages
- browser automation against Upwork
- automating Connects spend
- mass proposal generation or spam workflows
- billing, analytics, and team admin features beyond lightweight placeholders

## User Flow

1. User visits Upmatch and creates an account.
2. User logs in and lands in a protected dashboard.
3. User connects their Upwork account through OAuth 2.0.
4. Upmatch stores the connection securely and records tenant context where required.
5. User completes onboarding preferences:
   - preferred roles
   - minimum hourly rate
   - minimum fixed budget
   - preferred keywords
   - excluded keywords
   - preferred industries
   - contract type preferences
6. Upmatch fetches profile context and job data through official APIs.
7. Upmatch normalizes the job data into a short-lived local cache.
8. Matching logic scores jobs and produces reasons.
9. User reviews matched jobs, saves or dismisses them, and opens specific jobs for guidance.
10. User clicks through to Upwork to take final action manually.

## Product Principles

- Compliance first: favor the conservative path whenever platform rules are unclear.
- Human-in-control: recommendations are acceptable; automated application is not.
- Explainability over black box scoring: every surfaced match should show why it is relevant.
- Minimal retention: cache only what is necessary and respect documented API retention limits.
- Server-side integrations only: secrets, tokens, and external requests never leave the server.
- Replaceable modules: auth, ranking, and sync components should be swappable as the product matures.

## Matching Logic Overview

Initial scoring should combine:

- explicit user preferences
- freelancer profile relevance
- keyword overlap
- excluded keyword penalties
- rate and budget thresholds
- contract type alignment
- category or industry fit
- freshness weighting

The MVP scoring model should be deterministic, explainable, and easy to tune. It should output both a numeric score and short reasons such as “matches React + TypeScript preference” or “below minimum hourly rate threshold.”

## Implementation Phases

### Phase 0: Foundation

- product docs
- Next.js scaffold
- auth base
- Prisma schema
- env validation
- protected dashboard shell
- Upwork OAuth scaffolding

### Phase 1: Connection and Onboarding

- connect Upwork OAuth end-to-end
- secure token storage
- onboarding preference persistence
- connection status in dashboard and settings

### Phase 2: Profile and Job Intake

- profile sync service
- job search service using official GraphQL APIs
- normalized short-lived jobs table
- refresh workflow with rate-limit-safe guards

### Phase 3: Ranking and Dashboard

- match scoring engine
- explanation generation
- matched jobs dashboard
- job detail view
- save and dismiss workflow

### Phase 4: Proposal Assist

- structured proposal guidance
- evidence prompts based on profile and job fit
- manual click-through to Upwork

### Phase 5: Beta Hardening

- audit logging
- retry handling
- observability
- admin safeguards
- retention enforcement and cleanup jobs

## Risks

- Upwork commercial API approval may gate production usage.
- Rate limits may sharply constrain refresh frequency and multi-user scale.
- Tenant-specific request requirements may vary by endpoint.
- OAuth tokens and profile data are sensitive and require careful handling.
- Cached job data retention may be subject to strict time limits.
- Platform positioning can drift into prohibited automation if product scope expands carelessly.

## Risk Mitigation

- keep all Upwork operations server-side
- treat commercial permission as a launch dependency
- enforce conservative request pacing and backoff
- store tokens encrypted at rest
- record token metadata separately from encrypted token blobs
- design job storage as expiring, short-lived cache data
- keep proposal assistance advisory and user-triggered
- never implement direct apply or proposal submission flows

## Definition of Done for MVP

The MVP is done when:

- a user can sign up and log in
- a user can connect Upwork through the official OAuth flow
- the app stores and refreshes the connection securely
- the app imports usable freelancer profile context
- the user can set and edit preferences
- the app retrieves jobs through official APIs within rate and retention constraints
- the app shows ranked job matches with clear reasons
- the user can save and dismiss jobs
- the app provides proposal guidance only
- the user must still click through to Upwork for final application
- no feature in the product behaves like an auto-apply bot

# Upmatch Tasklist

## Milestone 1: Repo Foundation

### Goal

Establish a production-shaped starter codebase with docs, app shell, schema, env handling, and reusable structure.

### Tasks

- create project docs
- scaffold Next.js App Router structure
- add UI primitives and shell layouts
- add Prisma schema and client module
- add env validation and server-only handling

### Done When

- app boots locally
- docs are complete enough to guide execution
- Prisma schema can generate successfully
- dashboard routes have a coherent shell

## Milestone 2: Auth

### Goal

Allow users to create accounts, sign in, sign out, and access protected dashboard routes.

### Tasks

- add user credential validation
- hash and verify passwords
- issue secure session cookies
- protect dashboard routes with middleware
- add login and signup forms

### Done When

- signup creates a user
- login creates a valid session
- logout clears the session
- unauthenticated dashboard access redirects to login

## Milestone 3: Upwork OAuth Connection

### Goal

Create a compliant server-side Upwork connection flow foundation.

### Tasks

- build OAuth authorization URL helper
- generate and validate state
- implement callback route shape
- scaffold token exchange
- encrypt token storage
- store tenant id metadata

### Done When

- user can initiate connection
- callback route validates inputs
- token persistence interface is wired
- all Upwork code stays on the server

## Milestone 4: Profile Import

### Goal

Import and persist the user’s core Upwork freelancer profile data.

### Tasks

- add GraphQL client abstraction
- define profile query DTOs
- normalize profile payloads
- persist `FreelancerProfile`
- expose sync timestamps and status

### Done When

- a connected user can trigger a profile sync
- profile snapshot exists in the database
- profile sync failures surface safely in UI

## Milestone 5: Preferences Onboarding

### Goal

Let users define the targeting rules that drive search and ranking.

### Tasks

- build onboarding form
- persist user preferences
- add settings edit path
- validate numeric and list inputs

### Done When

- onboarding saves preferences
- settings can display persisted preferences
- malformed input is rejected cleanly

## Milestone 6: Job Search Integration

### Goal

Fetch jobs through official APIs using conservative rate-limited server-side workflows.

### Tasks

- implement job search service
- define normalized jobs storage
- add request pacing and retry policy
- enforce short-lived retention windows

### Done When

- user can refresh jobs
- job records are stored in normalized form
- retention and sync metadata are tracked

## Milestone 7: Ranking Engine

### Goal

Score jobs against user preferences and profile context with explainable reasons.

### Tasks

- define scoring inputs
- implement deterministic scoring rules
- generate explanation bullets
- add unit tests for ranking behavior

### Done When

- jobs receive numeric scores
- explanations are displayed alongside scores
- ranking output is reproducible and testable

## Milestone 8: Dashboard UI

### Goal

Turn the protected dashboard into a working match review interface.

### Tasks

- build matched jobs list
- add connection and sync status cards
- add preference summary surfaces
- add job detail page

### Done When

- dashboard shows real matched jobs
- detail page renders the selected job
- the user can understand status and next actions at a glance

## Milestone 9: Save and Dismiss Workflow

### Goal

Let users actively curate the job feed.

### Tasks

- add save and dismiss endpoints
- persist user job state
- reflect state immediately in dashboard

### Done When

- user can save a job
- user can dismiss a job
- saved and dismissed states persist across reloads

## Milestone 10: Proposal Assist

### Goal

Provide job-specific proposal guidance without submission automation.

### Tasks

- summarize job requirements
- surface relevant profile evidence
- generate proposal outline suggestions
- add click-through to Upwork

### Done When

- job detail page includes proposal assist content
- all final application actions remain on Upwork

## Milestone 11: Background Jobs

### Goal

Support refresh, retention, and retry workflows reliably.

### Tasks

- add scheduled refresh strategy
- add retention cleanup job
- add token refresh handling
- add retry queues for transient failures

### Done When

- sync can run on a schedule
- stale jobs are removed automatically
- transient upstream failures can recover cleanly

## Milestone 12: Beta Hardening

### Goal

Prepare the product for a controlled beta.

### Tasks

- add audit trails and observability
- improve auth and error handling coverage
- verify rate-limit safety
- review copy and UI polish
- run compliance review against actual feature set

### Done When

- critical paths are tested
- operator visibility is sufficient
- security and compliance review issues are closed

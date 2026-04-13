# Upmatch

Upmatch is a compliance-first Upwork job intelligence copilot for freelancers. It helps a user connect their Upwork account, sync profile context, define job preferences, review matched opportunities, and prepare stronger proposals without automating application submission.

## What Is Implemented

This repository now contains the foundation slice for the product:

- Product and engineering docs in [`docs/`](./docs)
- A Next.js App Router scaffold with Tailwind styling
- Cookie-based authentication foundation with protected dashboard routes
- Prisma schema for core user, connection, profile, and preference models
- Environment validation with Zod
- Upwork OAuth server-side scaffolding aligned to official OAuth 2.0 and GraphQL constraints
- Dashboard, onboarding, settings, and jobs placeholder routes

## Product Boundaries

Upmatch is intentionally designed as:

- a job discovery and ranking dashboard
- a decision-support tool for freelancers
- a proposal-assist product that links the user back to Upwork

Upmatch is not:

- an auto-apply bot
- a scraping system
- a proposal spam engine
- a Connects automation tool
- a direct submission client for Upwork proposals

## Documentation

- [Product Plan](./docs/PLAN.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Technical README](./docs/README.md)
- [Tasklist](./docs/TASKLIST.md)

## Local Development

1. Copy `.env.example` to `.env`.
2. Start Postgres and create a database.
3. Install dependencies with `npm install`.
4. Generate Prisma client with `npm run db:generate`.
5. Push the initial schema with `npm run db:push`.
6. Start the app with `npm run dev`.

## Current Focus

The current codebase establishes the secure product spine: auth, protected routing, schema design, env handling, Upwork connection scaffolding, and product shells. The next implementation slice should cover profile sync, jobs ingestion, normalized storage, and ranking.

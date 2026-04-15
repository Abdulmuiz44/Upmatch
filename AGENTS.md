# AGENTS.md

This directory contains multiple software projects. Before making changes, inspect the current repo, detect the stack, and adapt to the project instead of assuming one default workflow.

## General working rules

- Start by reading the repo structure and key files before editing.
- Prefer small, safe, reversible changes over broad rewrites.
- Preserve the existing architecture unless there is a clear reason to improve it.
- Match the code style, folder structure, naming, and conventions already used in the repo.
- When a task is unclear, infer the most likely intent from the codebase and proceed carefully.
- For non-trivial tasks, first make a short plan, then implement.
- After changes, run the most relevant checks available in the repo.
- Summarize what changed, why it changed, and any follow-up risks or next steps.

## Skills to use

### Use `vercel-react-best-practices` when:
- the repo uses React, Next.js, App Router, pages router, or modern frontend patterns
- reviewing component structure, rendering behavior, hydration, state placement, bundle size, or data fetching
- improving performance, server and client boundaries, or frontend maintainability

When using this skill:
- look for unnecessary client components
- reduce wasted rerenders
- improve state locality
- prefer safe, idiomatic React patterns
- preserve behavior unless explicitly asked to redesign

### Use `web-design-guidelines` when:
- working on UI polish, onboarding, forms, landing pages, dashboards, settings pages, or mobile responsiveness
- improving spacing, hierarchy, contrast, CTA clarity, accessibility, empty states, or visual consistency
- refining dark mode and touch usability

When using this skill:
- improve the UI without changing product intent
- keep layouts clean and practical
- prioritize readability, responsiveness, and usability
- avoid decorative changes that do not improve function

### Use `vercel-react-native-skills` when:
- the repo uses React Native, Expo, Expo Router, or native mobile patterns
- working on navigation, mobile layout, animations, lists, images, app structure, or state flows
- improving performance and mobile UX

When using this skill:
- respect platform constraints
- optimize for mobile responsiveness and practical performance
- keep patterns idiomatic to React Native or Expo
- avoid web-only assumptions

### Use `orca-cli` when:
- asked to use Orca
- managing Orca worktrees
- reading or sending messages to an Orca-managed terminal
- syncing repo state with Orca
- updating current worktree comments or checkpoints

When using this skill:
- operate through Orca rather than manually duplicating worktree management
- keep worktree status and progress comments updated when meaningful
- use Orca state as the source of truth for active Orca sessions

## Repo detection rules

Before editing, identify the project type from files such as:

- `package.json`
- `pnpm-lock.yaml`
- `bun.lock`
- `yarn.lock`
- `tsconfig.json`
- `next.config.*`
- `app.json`
- `app.config.*`
- `expo.*`
- `components.json`
- `supabase/`
- `prisma/`
- `android/`
- `ios/`

Then adapt:

- If Next.js or React repo, prioritize `vercel-react-best-practices`
- If React Native or Expo repo, prioritize `vercel-react-native-skills`
- If UI-heavy task, prioritize `web-design-guidelines`
- If Orca workflow is requested or already active, use `orca-cli`

## Editing rules

- Do not rewrite large files unless necessary.
- Do not introduce new dependencies unless justified by the task.
- Prefer fixing root causes over patching symptoms.
- Keep environment variable usage explicit and consistent.
- Keep types strict where possible.
- Preserve backward compatibility unless the task explicitly allows breaking changes.

## Validation rules

After changes, run what is appropriate for the repo, such as:

- install dependencies only if needed
- lint
- typecheck
- test
- build

If a command is unavailable, say so clearly and use the next best validation method.

## Output style

When finishing work:
- state the skill used, if one was used
- summarize the plan briefly
- summarize the files changed
- explain the main implementation decisions
- mention validation performed
- mention any risks, assumptions, or recommended next steps

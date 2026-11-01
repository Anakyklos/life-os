# LifeOS Canonical MVP

Status: CANONICAL \
Authority: validated product decision #88 \
Audience: product/business; contributor; AI agent \
Owner: repository maintainer \
Last reviewed: 2026-10-31 \
Review by: 2027-01-14 \
Update trigger: approved user, scope, target product or product-surface decision \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no

## Product Decision

By binding human decision on 2026-10-31 (Pedro, issue #168, proposal [`docs/adr/0002-linux-desktop-offline-first.md`](../adr/0002-linux-desktop-offline-first.md)), LifeOS will cease to be developed as a web product and will become a **Linux desktop application, offline-first**, where all essential functionality is fully usable without internet connectivity.

The essential product scope remains strictly focused on one core loop:

- **Target product (DECIDED):** Linux desktop application, offline-first.
- **Implemented codebase (IMPLEMENTED):** Implemented in this repository as the narrow weekly operating loop inside the existing React + Express workspace (with experimental Electron adaptors).
- **Technical stack (PENDING):** Definitive desktop runtime, IPC, and local persistence remain subject to evaluation and approval before implementation.

## What This Means

The MVP is not the entire LifeOS productivity suite.

The MVP is the narrow loop that helps a user:

1. define context and constraints
2. generate and confirm a focused weekly plan
3. execute a small set of next actions during the week
4. reflect and leave feedback

## Canonical MVP Surface

Frontend routes:

- `/mvp`
- `/mvp/onboarding`
- `/mvp/weekly-review`
- `/mvp/today`
- `/mvp/reflection`
- `/mvp/admin` for internal analytics only; client visibility is presentation, while data always requires the server allowlist

Backend contract:

- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/verify`
- `/api/auth/logout`
- `/api/auth/profile`
- `/api/auth/data-export`
- `/api/auth/delete-account`
- `/api/mvp/workspace`
- `/api/mvp/onboarding`
- `/api/mvp/weekly-plans/generate`
- `/api/mvp/weekly-plans/:planId/confirm`
- `/api/mvp/action-items/:actionItemId`
- `/api/mvp/daily-checkins`
- `/api/mvp/reflections`
- `/api/mvp/feedback`
- `/api/mvp/admin/overview`
- `/api/mvp/workspace/reset/export`
- `/api/mvp/workspace/reset`
- `/api/mvp/workspace/recovery/latest`
- `/api/mvp/workspace/recovery`

## Scope In

- invite-gated registration and authenticated access
- onboarding intake
- weekly review and weekly plan generation
- daily execution
- reflection and product feedback
- internal visibility into activation and completion signals

## Scope Out

- positioning LifeOS as a general productivity suite for MVP messaging
- treating dashboard, tasks, habits, calendar, journal, health, finances, projects, university, AI assistant, focus, gamification, or design preview as MVP-defining surfaces
- claiming Linux desktop support or packaging is currently implemented or released
- claiming Electron or web is the definitive shipped runtime
- sync or cloud-readiness claims
- requiring network connectivity for the essential loop in the target product
- calling the admin view partner-facing
- treating client route visibility, localhost, invite metadata, or a Vite flag as administrator authority

## Current Constraints

- broader-suite modules and Electron IPC remain in the repository, but their browser aliases redirect to `/mvp`; `/settings` remains an authenticated supporting route
- `/mvp/admin` data is server-authorized by exact authenticated email through `LIFEOS_ADMIN_EMAILS`; an empty allowlist denies everyone
- the current endpoint exposes only the authorized account's analytics, events, and feedback; cross-user/cohort administration is not implemented
- some MVP copy still overstates readiness
- the repo still contains stale desktop-first release docs and broad-suite PRD artifacts

## How To Use This Document

- If a roadmap, spec, or release note conflicts with this file, update that document or mark it superseded.
- New product requirements should assume this MVP boundary unless a higher-authority human decision indexed in `docs/README.md` changes it.
- Engineering docs should point here instead of redefining the MVP in parallel.

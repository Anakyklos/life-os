# LifeOS Canonical MVP

Status: CANONICAL \
Authority: validated product decision #88; reconciled by human decision (2026-10-31) and #168 \
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

To avoid conflating target product requirements with the transitional web implementation present in the repository, this document strictly separates:
1. **Approved Direction (Target Product)**
2. **Currently Implemented Web Contracts (Existing Codebase)**
3. **Pending Architectural Decisions**

---

## 1. Approved Direction (Target Product)

The target product approved by human maintainer Pedro is a native Linux desktop application operating offline-first.

### Core Principles
- **Target platform:** Linux desktop.
- **Offline-first operation:** The essential loop operates entirely locally without requiring network or cloud connectivity.
- **Local data control:** User data is stored locally with full user ownership, transparency, and privacy.
- **Narrow scope:** The product is not a sprawling productivity suite; it focuses exclusively on the core operating loop.

### Essential Product Loop
The essential product consists of a focused 4-stage operational loop:

1. **Context & Constraints (Onboarding):** Define user context, focus areas, and operational constraints.
2. **Weekly Planning (Weekly Review):** Generate, adjust, and confirm a focused weekly plan.
3. **Daily Actions (Today):** Execute a small, prioritized set of next actions during each day.
4. **Reflection (Weekly Review Feedback):** Reflect on weekly execution, record learnings, and calibrate the next cycle.

### Scope In (Essential Product)
- Onboarding intake and constraint definition;
- Weekly planning and commitment confirmation;
- Daily action execution and check-in tracking;
- Reflection and weekly loop calibration;
- Fully local data persistence and recovery.

---

## 2. Currently Implemented Web Contracts (Existing Codebase)

The codebase currently implemented in the repository is a transitional web workspace (React 18 + Express API) with experimental Electron adaptors. These contracts represent the **currently running software**, but they do **NOT** constitute definitive requirements for the Linux desktop product.

### Implemented Frontend Routes (Web SPA)
- `/mvp`: Entry dashboard for the weekly loop workspace.
- `/mvp/onboarding`: Intake form for user context and constraints.
- `/mvp/weekly-review`: Weekly planning and plan confirmation interface.
- `/mvp/today`: Daily action execution surface.
- `/mvp/reflection`: Weekly reflection and feedback capture.
- `/mvp/admin`: Internal-only operational analytics surface (presentation only; backend requires exact email on allowlist).

### Implemented Backend HTTP Contract (Express API)
- **Authentication & Account Lifecycle:**
  - `/api/auth/register` (invite-gated registration)
  - `/api/auth/login` (password verification, session cookie issuance)
  - `/api/auth/verify` (session cookie validation)
  - `/api/auth/logout` (session revocation)
  - `/api/auth/profile` (profile retrieval)
  - `/api/auth/data-export` (portable account data export)
  - `/api/auth/delete-account` (account erasure)
- **MVP Weekly Loop Contract:**
  - `/api/mvp/workspace` (workspace state retrieval)
  - `/api/mvp/onboarding` (onboarding submission)
  - `/api/mvp/weekly-plans/generate` (plan generation)
  - `/api/mvp/weekly-plans/:planId/confirm` (plan confirmation)
  - `/api/mvp/action-items/:actionItemId` (action item mutation)
  - `/api/mvp/daily-checkins` (daily check-in submission)
  - `/api/mvp/reflections` (reflection submission)
  - `/api/mvp/feedback` (product feedback capture)
  - `/api/mvp/admin/overview` (internal analytics retrieval)
  - `/api/mvp/workspace/reset/export` (pre-reset recovery export)
  - `/api/mvp/workspace/reset` (two-step workspace wipe)
  - `/api/mvp/workspace/recovery/latest` (latest recovery snapshot)
  - `/api/mvp/workspace/recovery` (recovery restore)

### Preservation Rule
These contracts, detailed in [`docs/contracts/mvp-route-map.md`](../contracts/mvp-route-map.md), must be preserved intact to keep the current test suite, development commands (`npm run dev`), and demo environments operable until a validated desktop implementation supersedes them.

---

## 3. Pending Architectural Decisions

The following architectural choices are explicitly open and pending technical investigation; they are not approved by the product decision:

- **Local Identity Model:** Transitioning from remote invite-gated registration and HTTP session cookies to a streamlined local identity and secret store appropriate for single-user desktop Linux.
- **Contract Reuse vs. Native IPC:** Evaluating whether to adapt existing HTTP contracts (e.g., via a local loopback daemon as explored in #167) or replace them with native IPC (e.g., Electron `contextBridge`, Tauri commands, or direct language bindings).
- **Future of Analytics:** Determining whether remote/centralized telemetry and administrative dashboards have any valid role in a privacy-respecting, offline-first desktop application, or if they should be replaced by purely local inspection tools.
- **Definitive Local Persistence:** Selecting and implementing an embedded database (such as SQLite) and retiring Prisma/Postgres and Supabase dependencies safely.

---

## Scope Out (Strict Exclusions)

- Positioning LifeOS as a broad productivity suite (dashboard, tasks, habits, calendar, journal, health, finances, projects, university, AI assistant, focus, gamification, or design preview routes are out of scope);
- Claiming Linux desktop support, packaging, or offline verification is already implemented or released;
- Claiming web or Electron is the definitive shipped runtime;
- Requiring cloud sync, central servers, or active internet connectivity for the essential product loop;
- Treating transitional web mechanisms (invite registration, session cookies, `/mvp/admin` allowlist) as permanent requirements of the Linux desktop application;
- Treating client route visibility, localhost, invite metadata, or Vite flags as administrative authority.

## Current Constraints

- Broader-suite modules and Electron IPC remain in the repository, but their browser aliases redirect to `/mvp`; `/settings` remains an authenticated supporting route.
- `/mvp/admin` data is server-authorized by exact authenticated email through `LIFEOS_ADMIN_EMAILS`; an empty allowlist denies everyone.
- The current admin endpoint exposes only the authorized account's analytics, events, and feedback; cross-user/cohort administration is not implemented.
- The repo contains stale desktop-first release docs and broad-suite PRD artifacts under audit/archive.

## How To Use This Document

- If a roadmap, spec, or release note conflicts with this file, update that document or mark it superseded.
- New product requirements must respect the approved direction (Linux desktop offline-first) while honoring the preservation of existing web contracts until an approved migration slice.
- Engineering docs must cite this document as canonical product scope rather than inventing parallel definitions.

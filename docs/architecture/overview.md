# LifeOS Architecture Overview

Status: ACTIVE_SUPPORTING \
Authority: derived current architecture under ADR-0001, ADR-0002, and #168 \
Audience: contributor; AI agent \
Owner: repository maintainer \
Last reviewed: 2026-10-31 \
Review by: 2027-01-14 \
Update trigger: ADR, runtime, schema, route, authentication or persistence boundary change \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no

This document describes the **currently implemented** runtime in the repository. The strategic product direction is defined in [`docs/adr/0002-linux-desktop-offline-first.md`](../adr/0002-linux-desktop-offline-first.md) and canonical product scope in [`docs/product/canonical-mvp.md`](../product/canonical-mvp.md).

## Architecture State

- **DECIDED (Strategic Target):** Linux desktop application, offline-first. Essential loop operates entirely without internet access; data is locally owned by the user.
- **IMPLEMENTED (Current Codebase):** The existing codebase implements the weekly operating loop inside a React 18 + Express web workspace with experimental Electron IPC adaptors.
- **PENDING (Technical Decisions):** Desktop application framework, local persistence engine (e.g. SQLite), IPC mechanism, local identity model, and Linux packaging pipeline.

## Current Implemented Architecture

Treat the current application as a React + Express development codebase with one canonical MVP slice: the weekly operating loop under `/mvp`. Electron code and the broader productivity suite remain present, but they are not the authoritative released product today.

## High-Level Runtime

```mermaid
graph TD
    Client["React app (Vite)"]
    API["Express API"]
    Auth["File-backed auth repository"]
    MVP["MVP repository"]
    Store[("JSON file store or Prisma-backed Postgres")]

    Client -- "HTTP(S) / JSON" --> API
    API --> Auth
    API --> MVP
    MVP --> Store
```

## Frontend

Default frontend runtime:

- React 18
- Vite
- React Router
- Zustand for local state
- Tailwind CSS for styling

Product structure:

- `src/features/mvp/` contains the canonical MVP loop
- the rest of `src/features/*` is legacy or broader-suite product surface
- retained modules and Electron IPC still exist, while legacy browser aliases redirect to `/mvp`

## Backend

Default backend runtime:

- Express in `api/app.ts`
- invite-gated auth endpoints in `/api/auth/*`
- weekly-loop endpoints in `/api/mvp/*`

Persistence behavior:

- web auth remains file-backed in every mode; local scripts explicitly select file-backed MVP persistence
- direct server startup requires `LIFEOS_MVP_REPOSITORY=file|prisma`; there is no implicit repository default
- Prisma-backed MVP storage becomes active only with `LIFEOS_MVP_REPOSITORY=prisma` and a non-empty `DATABASE_URL`; `DATABASE_URL` alone never changes repository mode
- File-backed auth and MVP stores use strict schemas, a process-wide queue per resolved path, and same-directory fsync/rename replacement with a last-known-good backup. They remain single-process/local-only; Prisma is the durable MVP target.

## Canonical MVP Surface

In scope:

- `/mvp`
- `/mvp/onboarding`
- `/mvp/weekly-review`
- `/mvp/today`
- `/mvp/reflection`
- `/mvp/admin` as an internal-only surface: client visibility is presentation and the backend requires an exact configured admin email

Out of scope for canonical MVP framing:

- the broader suite as the primary product story
- claiming Linux desktop support or packaging is already implemented
- claiming Electron or web is the definitive release story
- sync, cloud, or remote hosting requirements for the essential product loop

## Documentation Precedence

Use `AGENTS.md` then `docs/README.md`, followed by the assigned human decision/ADR, the exact canonical or supporting document, and the applicable executable contract. Equal- or higher-authority conflicts are stop-and-report conditions. Historical documents never authorize implementation.

# ADR-0002: Linux desktop offline-first product direction

Status: PROPOSAL \
Authority: human decision by Pedro (2026-10-31) and authorizing issue #168 under recovery program #82 \
Audience: contributor; AI agent; operator/release; product/business; security \
Owner: repository maintainer \
Last reviewed: 2026-10-31 \
Review by: 2026-11-30 \
Update trigger: maintainer ratification, desktop architecture decision, persistence or IPC proposal \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no (documentary only; technical choices require separate ready issues and ADR ratification) \
Related: issues #82, #85, #88, #168; ADR-0001

## Lifecycle notice

ADR lifecycle state: `proposed`.

This document records a binding normative human decision by the repository maintainer regarding product direction. It does not authorize immediate code rewrites or runtime removals. In accordance with repository governance, an ADR remains `proposed` until explicitly marked `accepted` (or `provisional` under a formal recovery mandate) by the human maintainer. It establishes strategic intent without inventing technical approval for unselected stacks.

## Context

On 2026-10-31, the repository maintainer, Pedro, established a binding human decision:

> **LifeOS will cease to be developed as a web product and will become a Linux desktop application, offline-first, fully usable without internet connection in its essential functions.**

This decision supersedes the previous web-first product assumption provisionally adopted under ADR-0001 and issue #85.

While the strategic product target is settled by human authority, this decision **does NOT automatically approve**:

- Electron, Tauri, Qt, GTK, or any other specific desktop framework;
- Rust, Go, or TypeScript as the definitive backend/core language;
- SQLite, structured JSON, or any other specific database as definitive persistence;
- a specific Inter-Process Communication (IPC) strategy or transport;
- removal of Express, React, Prisma, or Supabase;
- a whole-application rewrite (big-bang rewrite);
- data migration or schema mutation;
- integration with external cloud services;
- distribution via any specific package format (e.g., AppImage, Flatpak, Snap, deb, rpm).

Each technical choice requires dedicated technical investigation, evidence, and independent approval. Pedro retains exclusive authority over normative decisions, product scope, trust model, and destructive operations.

## Approved Direction

The approved product direction establishes:

1. **Target product:** A native-feeling Linux desktop application.
2. **Offline-first operation:** Essential features must function completely without an internet connection. Network loss must never impair core usage.
3. **User-controlled data:** All user data is owned and stored locally by default, prioritizing user sovereignty, privacy, and transparent local storage.
4. **Local operation:** Computation, state management, and lifecycle logic run on the local machine.
5. **Optional online integrations:** Any network integration must be additive, optional, explicit, strictly consensual, and failure-tolerant without degrading core features.
6. **Preservation of existing data:** Existing user workspaces, historical states, and experimental stores must be preserved until validated, non-destructive migration exists.
7. **Incremental and reversible transition:** Evolution must proceed via bounded, reversible vertical slices rather than high-risk rewrites.

## Essential Product Scope

The priority operational hypothesis remains the narrow weekly loop established in the canonical MVP:

$$\text{Context / Onboarding} \longrightarrow \text{Weekly Planning} \longrightarrow \text{Daily Actions (Today)} \longrightarrow \text{Reflection / Review}$$

This decision does **not** authorize resurrecting or re-activating legacy modules from the broader productivity suite (such as finances, gamification, AI assistant, broad multi-module dashboard, or calendar integrations). The desktop application will focus on delivering this focused loop with rock-solid offline reliability.

## Status Distinctions

To prevent false claims and execution errors, all contributors and AI agents must preserve this tripartite distinction:

- **DECIDED:** Linux desktop offline-first is the official target product.
- **IMPLEMENTED:** The repository currently contains a functional web implementation (React 18 + Vite frontend and Express HTTP API) alongside experimental Electron adaptors and legacy SQLite code.
- **PENDENTE (Pending):** Desktop framework selection, UI/domain decoupling, IPC transport, definitive storage engine, local identity model, Linux packaging, and automated Linux CI verification.

## Pending Decisions

The following architectural decisions are explicitly open and must be evaluated under future issues before implementation:

1. **Desktop application framework:** Evaluating Electron (reusing existing scaffolding and React UI), Tauri (lightweight webview with Rust backend), native GUI frameworks (Qt, GTK), or alternative desktop hosts.
2. **UI and domain separation:** Defining clear architectural boundaries between frontend presentation and domain logic to facilitate testing and potential runtime migration.
3. **IPC and local communication:** Choosing between native framework IPC (e.g., Electron `contextBridge`/`ipcRenderer`, Tauri commands), local HTTP/RPC over loopback (`127.0.0.1`), or Unix domain sockets.
4. **Definitive persistence:** Selecting and implementing an embedded, single-user local storage mechanism (e.g., SQLite via embedded driver, structured JSON files) and planning the safe retirement of Postgres/Prisma and Supabase dependencies.
5. **Local identity and session:** Replacing web cookie/invite-gated authentication with a streamlined local identity and secret-management model suitable for single-user offline desktop environments.
6. **Security and trust boundaries:** Establishing file system permissions, sandboxing policies, local secrets encryption at rest, and binary verification.
7. **Linux packaging and distribution:** Selecting target formats (AppImage, Flatpak, Snap, deb, rpm, portable archive) and build pipelines.
8. **Backup, export, and restore:** Providing robust local snapshotting, atomic backups, and export/import capabilities that the user can inspect directly.
9. **Data migration strategy:** Creating verifiable, non-destructive migration tooling to import existing web workspace (`.data/mvp-workspace.json`) and legacy Electron database (`lifeos.db`) into the new storage format.
10. **Linux test harness:** Establishing automated testing on Linux runners in CI, including headless display (Xvfb/Wayland), simulated network disconnection (offline testing), and process lifecycle verification.

## Future Options for Technical Investigation

Without committing to any stack prematurely, the following architectural avenues warrant technical exploration:

- **Option A — Electron evolution:** Leverage existing Electron configuration in `electron/` and `src/features/mvp/api/mvp.api.ts`, refining IPC handlers and transitioning persistence from remote/Express to local SQLite/better-sqlite3. Lowest friction for existing React codebase, but carries Electron memory and bundle size overhead.
- **Option B — Tauri / Webview host:** Package the React/Vite UI with Tauri, utilizing a lightweight Rust core for system integration, file I/O, and SQLite persistence. Yields significantly smaller binary and memory footprint, but introduces Rust toolchain dependencies.
- **Option C — Decoupled local service (Frontend + Local Daemon):** Maintain a web-tech UI communicating over local loopback (HTTP/Unix socket) with a resident background daemon (Node.js or Go, as explored in issue #167). Provides clean separation of concerns and headless operation potential.
- **Option D — Pure native Linux desktop:** Reimplement UI and core using native Linux toolkit (e.g., GTK4/Adwaita or Qt/QML). Highest native integration and performance, but demands complete UI rewrite and duplicate engineering effort.

## Validation Requirements

Before LifeOS can be declared a functional Linux desktop application, the following verifiable evidence must be produced:

1. **Packaging & installation:** A reproducible Linux package builds cleanly and installs on a standard Linux distribution (reference baseline: Ubuntu LTS).
2. **Native execution:** The application launches directly in a Linux desktop session with standard window management, without requiring an external web browser or remote server.
3. **Offline verification:** 100% of the canonical loop (onboarding, weekly planning, daily execution, reflection) succeeds in a strictly disconnected environment (network interface down / airplane mode).
4. **Data persistence & crash recovery:** Local data writes survive application restarts and simulated abrupt process termination without corruption.
5. **Automated Linux CI:** A dedicated Linux CI workflow executes automated end-to-end desktop tests and reports passing results.
6. **Performance & accessibility:** Documented startup time, memory footprint at idle, and compliance with accessibility baselines.

## Transition and Reversibility

1. **Preservation of existing assets:** Existing web and Electron components remain functional in `local-dev` mode. No existing code, endpoints, or data files will be deleted until equivalent functionality and data parity are verified in the desktop target.
2. **Coexistence:** The existing web development commands (`npm run dev`) remain documented as the means to execute the current codebase. They must not be mislabeled as the future product target.
3. **Rollback strategy:** Because this change is documentary and normative, rollback consists simply of reverting documentation commits. No user data, database schemas, or package dependencies are put at risk.

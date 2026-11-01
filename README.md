# LifeOS

Status: CANONICAL \
Authority: repository entry and contributor quick start \
Audience: end user; contributor; AI agent \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2027-01-14 \
Update trigger: product surface, runtime, setup or key-path change \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no

> [!IMPORTANT]
> **Product Direction (2026-10-31):**
> By binding human decision from repository maintainer Pedro (2026-10-31, issue #168, proposal [`docs/adr/0002-linux-desktop-offline-first.md`](docs/adr/0002-linux-desktop-offline-first.md)), LifeOS will cease to be developed as a web product and will become a **Linux desktop application, offline-first**, with all essential features fully usable without an internet connection.
>
> **Status distinction:**
> - **DECIDED:** Linux desktop offline-first is the official target product.
> - **DECIDED (architecture, #175 / [ADR-0005](docs/adr/0005-linux-tauri-rust-architecture.md)):** Tauri 2 host, React/TypeScript interface, Rust local core, incremental reversible migration, and essential offline operation.
> - **IMPLEMENTED (transitional/legacy):** The repository still implements the weekly loop in the React 18 + Vite and Express web workspace, with experimental Electron adapters. This is not the Linux target runtime.
> - **PROVISIONAL (#176):** SQLite, XDG paths, detailed Tauri IPC, backup/recovery, and `.deb` packaging are delegated technical selections pending separate ADR integration, validation, and dependency authorization.
> - **PENDING:** Linux implementation and verification, detailed command/capability contracts, and the remaining migration and release gates.
>
> The setup instructions below run the **currently implemented** web codebase; they do not represent a released or completed Linux desktop package.

Use [`docs/README.md`](docs/README.md) to select the current authority for each subject. Equal- or higher-authority conflicts are stop-and-report conditions, not an invitation to select the newest file.

## Current Product Boundary

In scope for the essential loop:

- invite-gated account creation and login (in current web runtime)
- the `/mvp` workspace and its four user-facing loop surfaces:
  - onboarding (context and constraints)
  - weekly review (planning)
  - today (focused daily actions)
  - reflection (weekly review feedback)
- an internal-only admin analytics surface at `/mvp/admin`
- the current `/api/mvp/*` contract in `api/app.ts`

Out of scope for the essential product:

- marketing LifeOS as a broad productivity suite
- treating the dashboard, habits, calendar, journal, health, finances, projects, university, focus, AI assistant, or gamification routes as MVP-defining surfaces
- claiming Linux desktop support or packaging is currently implemented or released
- claiming Electron or web is the definitive shipped runtime
- cloud sync or remote hosting requirements for core functionality

## Current Implemented Runtime

Default development and build flow for the current codebase:

- frontend: React 18 + Vite
- backend: Express
- auth: file-backed invite registration and session cookies in both MVP repository modes
- MVP workspace/recovery persistence: explicitly selected with `LIFEOS_MVP_REPOSITORY=file|prisma`; Prisma changes only this store and also requires `DATABASE_URL`, which never selects a repository by itself

Current runtime status:

- The web runtime (`npm run dev`) is the functional development environment today.
- The web runtime and experimental Electron code are transitional implementations, not the selected Linux target. The target architecture is recorded in [`docs/adr/0005-linux-tauri-rust-architecture.md`](docs/adr/0005-linux-tauri-rust-architecture.md); no Linux package or runtime is implemented or verified.

## Quick Start (Current Web Codebase)

Install dependencies:

```bash
npm ci
```

Run the default app and API:

```bash
LIFEOS_SESSION_SECRET="$(openssl rand -hex 32)" npm run dev
```

The admin route is only presentation until the server authorizes the signed-in identity. To authorize exact accounts, set a comma-separated allowlist such as `LIFEOS_ADMIN_EMAILS=operator@example.com`. An empty or malformed allowlist denies every account; client flags, localhost, invite metadata, and Electron do not grant administrator authority.

The canonical HTTP server rejects JSON bodies above 32 KiB and validates every auth/profile/MVP write with strict bounded schemas. Cookie-authenticated unsafe requests require an exact allowed `Origin`; bearer tokens are explicit request authority. Logout revokes all existing web tokens for the account through a persisted session version. Express deliberately does not trust proxy headers in the supported direct single-process topology.

Canonical workspace reset is a two-step recovery operation, never a bodyless delete: password reauthentication plus the exact `RESET MY WORKSPACE` phrase prepares a versioned portable export and short-lived authorization; commit retains the recovery in the same repository mutation that clears data. `RESTORE MY WORKSPACE` restores a validated envelope, and the latest retained recovery remains available if the reset response is lost. The full web account lifecycle is documented in `docs/contracts/personal-data-lifecycle.md`; experimental Electron preservation/export is documented in `docs/operations/electron-to-web-export.md`, while Electron reset/import remains disabled and non-canonical.

The development scripts select `LIFEOS_OPERATING_MODE=local-dev`. Direct builds must select it explicitly:

```bash
LIFEOS_OPERATING_MODE=local-dev npm run build
```

Direct server starts must also select persistence explicitly. `LIFEOS_MVP_REPOSITORY=file` is local, single-process storage with strict corruption errors, atomic replacement, and a last-known-good `.bak`; `prisma` additionally requires `DATABASE_URL`. File-to-Prisma dry-run, backup, apply, verification, and guarded rollback are documented in `docs/operations/file-to-prisma-migration.md`.

Default local endpoints:

- app: `http://localhost:5173`
- api: `http://localhost:3001`

## Key Paths

- `src/features/mvp/`: weekly-loop MVP UI
- `api/app.ts`: implemented auth and MVP server contract
- `docs/README.md`: documentation authority and conflict index
- `docs/product/canonical-mvp.md`: canonical product framing
- `docs/contracts/mvp-route-map.md`: implemented route and API map

## Verification

- unit and integration tests: `npm run test`
- authoritative web browser journey: `npm run test:e2e`
- advisory Electron smoke: `npm run test:e2e:electron-advisory`
- advisory broad browser placeholders: `npm run test:e2e:advisory`
- type check: `npm run typecheck`
- lint: `npm run lint`

The release-verification ladder and the distinction between authoritative versus advisory Playwright lanes live in `docs/operations/release-verification-ladder.md`.

## Operating Modes

`local-dev` is the only currently supported mode. The repository also contains a fail-closed `controlled-demo` candidate profile. It requires production mode, an exact HTTPS origin, a unique session secret, explicit unique invite seeds, and explicit file persistence; it rejects known fallback credentials, UI bypasses, unreviewed vendors, service-role injection, public source maps, and development branding.

Build and inspect that candidate with:

```bash
LIFEOS_OPERATING_MODE=controlled-demo npm run build
npm run verify:controlled-demo-artifact
```

This does not authorize a shared deployment by itself. The actual host must also pass the expiry, access, rotation, wipe/backup, and deployed-browser evidence in `docs/security/2026-07-16-operating-modes-threat-model.md`. Partner beta and public production remain unsupported.

## CI Quality Gate Policy

- Canonical package manager is `npm`.
- The only accepted lockfile is `package-lock.json`.
- CI must install dependencies with `npm ci` (frozen lockfile behavior).
- Merge readiness is determined by `web / static-and-unit` and `web / canonical-e2e`.
- `web / static-and-unit` runs:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `npm run build:server`
- `web / canonical-e2e` runs the built SPA through Express with `npm run test:e2e`.
- Electron smoke remains advisory and separate from merge readiness.

## License

MIT

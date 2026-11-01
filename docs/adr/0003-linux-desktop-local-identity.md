# ADR-0003: Local offline identity for Linux desktop

Status: CANONICAL \
Authority: explicit human approval by Pedro (2026-10-31), recorded in issue #172; Linux direction #168 / ADR-0002 \
Audience: contributor; AI agent; security; operator/release; product/business \
Owner: repository maintainer \
Last reviewed: 2026-10-31 \
Review by: 2027-01-14 \
Update trigger: identity/session trust boundary, recovery, ownership mapping, desktop stack or local persistence decision \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no; a separate ready issue, approved contracts and applicable gates remain mandatory

ADR lifecycle state: **accepted** for the narrowly scoped human decision below. This ADR does not ratify ADR-0002's unselected technical choices.

## Context

Pedro's 2026-10-31 product decision (#168 / ADR-0002) makes Linux desktop, offline-first operation the target; the React/Express web runtime and experimental Electron adapters remain the **implemented** state. None of the current Electron session paths demonstrates general-purpose, packaged Linux offline support.

Identity is fragmented across web accounts (`api/authRepository.ts`), experimental Electron sessions (`electron/auth/desktopSession.ts`, `electron/ipc/authHandler.ts`), MVP JSON workspaces indexed by `userId` (`api/mvpRepository.ts`) and legacy SQLite rows (`electron/db/BaseRepository.ts`). The latter uses a `local-user-id` fallback when no persisted session is found. `electron/data/desktopExport.ts` counts null/blank owners as unmapped but can omit records under another nonempty ID from both a particular user's export and its unmapped count.

The current Electron bootstrap invokes `initDb()` (which may write schema/WAL state) and `startSyncEngine()` before any proposed historical-data discovery (`electron/main.ts`, `electron/db/database.ts`). SQLite and the MVP JSON store do not share a transaction boundary. These are constraints on a later implementation, not verified migration behavior.

## Decision drivers

- Essential planning, daily actions and reflection must work **without internet, remote account, cloud authentication or server**.
- Simple first-run experience, without an application-specific password gate.
- Stable logical user identity independent of the Linux username and UID.
- User control over existing files, imports and consent.
- Preservation of historical IDs and data, including unknown owners.
- Small, reversible implementation slices with real Linux/offline/recovery evidence.

## Options considered

1. **A — Linux username/UID as the record key:** little initial configuration but unstable across account changes, restores and machines; rejected for the logical data key.
2. **B — One implicit local profile with its own stable application ID:** avoids a separate login and remains independent of username/UID; **approved**.
3. **C — Multiple named local profiles:** adds UI, switching and authorization complexity; not part of the first approved identity model.
4. **D — Mandatory master-password identity:** adds credential recovery and encryption complexity; not required by the first approved model. Optional future protections require a separate decision.

## Decision — approved by Pedro

**Use Option B for the initial LifeOS Linux desktop identity model:**

1. The initial product has **one implicit local profile for its active application data context**, with a **LifeOS-owned, persistent logical identifier**, generated locally and **not derived from** Linux `$USER` or UID. Its value must remain stable across normal restarts and Linux account renames.
2. Creating and resolving this identity for essential features **must work offline** without Supabase, web invites, remote services or a cloud login.
3. **No LifeOS-specific password is mandatory** to enter the essential weekly loop in the initial product. This is a usability decision, **not a guarantee** of data encryption or protection against all local processes.
4. Historical IDs (`usr_*`, Supabase IDs, `local-*`, `local-user-id`, blank/unknown IDs) remain distinct provenance. **Never silently promote, remap, claim, delete or merge** records or a preexisting workspace into the new identity.
5. A user's explicit choice to import or associate historical data constitutes **consent to the operation**, not cryptographic proof of historical ownership. Unknown owners must remain visible to an operator audit and preserved without silent adoption.
6. Existing data must remain recoverable. A new clean profile must not write into protected historical files before an explicit safe transition. No second active source of truth may be created for convenience.

**Approval boundary:** The human selected the identity *model*, **not** the ID algorithm/format, manifest schema/path, filesystem isolation strategy, selected desktop framework, IPC protocol, database, encryption mechanism, package format, migration tool or legacy-module retirement. These remain unresolved. No runtime change is authorized by this ADR alone.

## Required invariants for future implementation

### Bootstrap and historical discovery

- Detect preexisting data **before** potentially mutating initialization (e.g., `initDb()`, schema DDL, WAL changes and sync workers).
- Discovery is read-only and must not relocate, initialize, reformat, truncate, delete or overwrite preexisting data; investigate filesystem and SQLite read-only subtleties under real test.
- Inventory all historical identities and counts, including the synthetic `local-user-id`, other nonblank IDs, missing owners and multiple-workspace cases, without including other users' records in an individual export by default.
- If the operator chooses a clean start, isolate new writes from historical files while preserving a single source of truth for the **active** data context. The exact storage routing remains a separate decision.

### Backup, restore and rollback

- Define and test a **coordinated, consistent checkpoint** of all participating stores and identity metadata. SQLite online backup or `VACUUM INTO` can protect the **SQLite portion**, but neither independently proves consistency with JSON.
- Stop/coordinate writers, validate captured data, publish the verified checkpoint safely and recover from interruption. A timestamp or SHA-256 hash alone does not make a multi-store snapshot atomic or prove ownership.
- Before rollback, preserve a **complete, consistent post-migration state**, including later inserts, updates and deletions. Never blindly delete the identity manifest, overwrite divergent historical data or claim data cannot be lost.
- Block automatic reversal on unresolvable identity or data conflicts. Prove backup/restore, crash recovery, forward migration and reversible round-trip using **synthetic data** before touching user records.
- Use restrictive filesystem permissions where supported, but acknowledge that POSIX permissions do not isolate processes sharing the same UID or privileged users. Physical-disclosure protection, disk encryption and optional local secrets need their own threat assessment.

### IPC and integrations

- Treat renderer IPC payloads and imported files as untrusted; check sender, authorization and runtime schemas.
- No hidden network sync or background upload; online services, if any, are explicit, optional and consented to.
- The existing Electron singleton lock is evidence of current behavior, not proof that all target runtimes already coordinate storage writers.

## Consequences

**Positive, contingent on implementation and verification:** simpler offline UX, identity independent of OS username/UID, and an explicit boundary between active local identity and legacy data.

**Costs and residual risks:** relies primarily on the Linux account/filesystem boundary without an app-specific password; same-UID processes, root access, physical disk access and exported backups require separate protection. Historical ownership may be unprovable. Multi-store snapshots, restore, session recovery and migration are nontrivial and have **not** been implemented or validated by this decision.

## Migration and rollback

No migration is authorized now. A later ready issue must specify exact source and destination, verified synthetic snapshots, conflict/ownership handling, checkpoint protocol across stores, failure injection, post-migration preservation and a rollback drill. Old data and a compatible reader must remain available until the replacement and recovery are demonstrated. Any destructive operation requires separate exact-target authorization.

## Validation required before desktop release

- Fresh install and the complete weekly loop **without network**, cloud account, keyring or remote server.
- Persistent stable identity and data after normal restart, process crash and recovery.
- Historical discovery with no writes or owner assumptions; clean-profile writes do not alter historical bytes.
- Legacy ID inventory and export counts, including `local-user-id` and other nonmatching IDs.
- Coordinated SQLite + JSON + identity backup, restore and forward/rollback synthetic round-trip under failures.
- IPC sender/payload/authorization checks and network-attempt observation.
- Real packaged Linux desktop E2E with accessibility, startup and resource evidence.

Existing web CI and Electron unit/smoke evidence do not satisfy these Linux release gates.

## Pending decisions

Desktop host/stack, persistence and IPC; ID generation and persistence layout; historical import and identity-claim UX; multi-store checkpoint protocol; encryption and optional future profiles; distro/packaging and Linux support matrix; retirement of web/legacy components.

Related: #82, #85, #87, #111, #168, #172; ADR-0001, ADR-0002.

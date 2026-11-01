# ADR-0003: Local offline identity for Linux desktop

Status: CANONICAL \
Authority: identity model explicitly approved by Pedro in #172 (2026-10-31); later decisions #168, #174 and #175; technical selections delegated in #176 and recorded as proposed ADR-0006 through ADR-0008 \
Audience: contributor; AI agent; security; operator/release; product/business \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2027-01-14 \
Update trigger: identity/session trust boundary, recovery, ownership mapping, desktop stack or local persistence decision \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no; a separate ready issue, approved contracts and applicable gates remain mandatory

ADR lifecycle state: **accepted only for the identity model explicitly approved in #172**. Later decisions and technical selections below have separate authority and status; their mention does not extend this ADR's accepted scope or claim implementation.

## Context

Pedro's 2026-10-31 decision (#168 / ADR-0002) sets Linux desktop, offline-first operation as the target; the React/Express web runtime and experimental Electron adapters remain the **implemented** state. Later, Pedro approved an isolated new Linux data context (#174) and the Tauri 2 + React/TypeScript + Rust target architecture (#175). #176 records delegated technical selections for local data, XDG paths, IPC, recovery and packaging, now captured in proposed ADR-0006 through ADR-0008. They are not individually ratified and none establishes a working or released Linux runtime.

Identity is fragmented across web accounts (`api/authRepository.ts`), experimental Electron sessions (`electron/auth/desktopSession.ts`, `electron/ipc/authHandler.ts`), MVP JSON workspaces indexed by `userId` (`api/mvpRepository.ts`) and legacy SQLite rows (`electron/db/BaseRepository.ts`). The latter uses a `local-user-id` fallback when no persisted session is found. `electron/data/desktopExport.ts` counts null/blank owners as unmapped but can omit records under another nonempty ID from both a particular user's export and its unmapped count.

The current legacy Electron bootstrap invokes `initDb()` (which may write schema/WAL state) and `startSyncEngine()` before any historical-data discovery (`electron/main.ts`, `electron/db/database.ts`). SQLite and the MVP JSON store do not share a transaction boundary. These observations describe legacy behavior; they do not require a new isolated Linux startup to inspect historical stores or prescribe migration behavior.

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
6. Preserve historical records and their provenance. No legacy ID or record is silently adopted, and no second active source of truth is created for convenience.

**Approval boundary:** Pedro's approval in #172 selected the identity *model* only. It did not approve a host, persistence, IPC, backup, package or migration design. Later decisions are separate: #174 approves the isolated new context; #175 approves the Tauri 2 + React/TypeScript + Rust target architecture; #176 delegates technical selections recorded in proposed ADR-0006 through ADR-0008. This PR does not implement or independently ratify those later choices.

## Later decisions and technical selections

| Source | Decision | Authority and current state |
|---|---|---|
| [#168](https://github.com/Anakyklos/life-os/issues/168) | Linux desktop, offline-first product direction | Approved by Pedro; current repository implementation remains web/experimental Electron. |
| [#172](https://github.com/Anakyklos/life-os/issues/172) | One implicit local profile with a stable LifeOS-owned ID and no mandatory application password | Approved by Pedro; this is the only decision this ADR marks `accepted`. |
| [#174](https://github.com/Anakyklos/life-os/issues/174) | A new, isolated Linux data context; essential startup does not require opening or inspecting historical stores | Approved by Pedro and recorded in ADR-0004; historical files are preserved and never silently imported or associated. |
| [#175](https://github.com/Anakyklos/life-os/issues/175) | Tauri 2 + React/TypeScript + Rust, implemented in reversible slices | Approved by Pedro as target architecture and recorded narrowly in ADR-0005; implementation and Linux validation remain pending. This does not expand the identity decision in this ADR. |
| [#176](https://github.com/Anakyklos/life-os/issues/176) | New local SQLite controlled by Rust; a dedicated XDG namespace; restricted Tauri IPC; backup/recovery; `.deb` as the primary package | Selected technically under delegated authority and recorded in proposed ADR-0006 through ADR-0008. These details were not individually ratified by Pedro and are not implementation evidence. |

## Required invariants for future implementation

### Bootstrap of the new Linux context

- Initialize only the new active context in its own selected destination. Before writing, validate that destination's path safety, permissions and separation from known legacy locations, environment overrides, symlinks and aliases. Fail closed if it is occupied, inaccessible, ambiguous or cannot be proven distinct; do not silently choose another destination.
- This startup check may compare paths and filesystem metadata needed to establish destination safety, but it must not open or read the contents of historical SQLite/JSON stores, their sidecars or backups. A complete historical inventory is **not** a prerequisite to starting the isolated context, and startup must not imply that history was checked or absent.
- The new context must work offline and must not write to, initialize, reformat, truncate, delete, overwrite, import, remap or associate historical data. Keep one authoritative source for the new active context.

### Future opt-in historical inspection or import

- Historical inspection or import is a separate, explicit, operation-specific user choice. It is isolated from initial startup and is not required to begin using the new context.
- Before reading a selected legacy source, safely identify the exact source paths and relevant stores. Before any mutation of a legacy source, complete safe discovery of its identity, path, permissions and consistency; ambiguity or collision blocks the operation.
- For the specifically selected sources, inventory identities and counts, including `local-user-id`, other nonblank IDs, missing owners and multiple-workspace cases. Establish coordinated backup consistency and a tested recovery path before any operation that could change or import historical records.
- Require an explicit mapping for any records the user chooses to associate. Consent to an import is not proof of historical ownership. Unknown IDs and records remain distinct and preserved; never silently claim, promote, merge, remap or discard them.
- Historical inspection/import failures must not trigger writes to old stores or a silent fallback. Preserve historical source data unless a distinct, explicitly authorized operation says otherwise.

### Backup, restore and rollback

- The selected active SQLite context requires a defined and verified backup/recovery contract before desktop release. The selection in #176 is not evidence that backup or restore has been implemented or tested.
- A future operation involving multiple legacy stores must coordinate writers, capture and validate a consistent checkpoint of all participating stores and identity metadata, and prove recovery before changing source data or importing records. A timestamp or checksum alone does not establish consistency, completeness or ownership.
- Before rollback, preserve a **complete, consistent post-operation state**, including later inserts, updates and deletions. Never blindly delete identity metadata, overwrite divergent historical data or claim data cannot be lost.
- Block automatic reversal on unresolvable identity or data conflicts. Prove backup/restore, crash recovery and reversible round-trips with **synthetic data** before touching user records.
- Use restrictive filesystem permissions where supported, but acknowledge that POSIX permissions do not isolate processes sharing the same UID or privileged users. Physical-disclosure protection, disk encryption and optional local secrets need their own threat assessment.

### IPC and integrations

- Treat renderer IPC payloads and imported files as untrusted; check sender, authorization and runtime schemas.
- No hidden network sync or background upload; online services, if any, are explicit, optional and consented to.
- The existing Electron singleton lock is evidence of current behavior, not proof that all target runtimes already coordinate storage writers.

## Consequences

**Positive, contingent on implementation and verification:** simpler offline UX, identity independent of OS username/UID, and an explicit boundary between active local identity and legacy data.

**Costs and residual risks:** relies primarily on the Linux account/filesystem boundary without an app-specific password; same-UID processes, root access, physical disk access and exported backups require separate protection. Historical ownership may be unprovable. Multi-store snapshots, restore, session recovery and migration are nontrivial and have **not** been implemented or validated by this decision.

## Migration and rollback

This ADR and PR authorize no historical migration. The isolated new context may start without migration or a full historical inventory. A later ready issue must define any opt-in history operation's exact sources and destinations, consent and identity mapping, consistent checkpoints, failure injection, recovery and post-operation preservation. Old data and a compatible reader must remain available until replacement and recovery are demonstrated. Any destructive operation requires separate exact-target authorization.

## Validation required before desktop release

- Fresh install and the complete weekly loop **without network**, cloud account, keyring or remote server.
- Persistent stable identity and new-context data after normal restart, process crash and recovery.
- Destination collision, permission and path-safety checks that do not open historical SQLite/JSON content; writes to the new context leave historical stores untouched.
- Backup, restore and crash recovery for the new active store, verified with synthetic data.
- IPC sender/payload/authorization checks and network-attempt observation.
- Real packaged Linux desktop E2E with accessibility, startup and resource evidence, using the selected `.deb` target.

These gates do **not** require a full inventory, inspection or import of historical stores before first startup.

### Additional gates if historical inspection/import is later offered

- Operation-specific consent, exact source inventory and explicit provenance/identity mapping.
- Coordinated backup consistency, restore and failure recovery for all selected legacy stores.
- No source mutation or silent ownership assumptions; test success, ambiguity and interruption with synthetic data.

Existing web CI and Electron unit/smoke evidence do not satisfy these Linux release gates.

## Remaining decisions and implementation status

The broad host architecture is human-approved in #175 and recorded narrowly in ADR-0005. The local SQLite/Rust, XDG namespace, restricted IPC, backup/recovery and primary `.deb` choices are delegated technical selections in #176, recorded as proposed ADR-0006 through ADR-0008. They were not approved as part of #172, are not individually ratified by Pedro, and none is implemented or verified by this ADR or PR.

Optional historical import and identity-claim UX, encryption, additional profiles, the Linux support matrix, and retirement of web/legacy components remain separate decisions. Any implementation requires its own ready issue and evidence; this documentary ADR authorizes no runtime change.

Related: #82, #85, #87, #111, #168, #172, #174, #175, #176; ADR-0001, ADR-0002.

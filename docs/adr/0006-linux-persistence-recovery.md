# ADR-0006: Linux local persistence and recovery

Status: PROPOSAL \
Authority: delegated technical selection recorded in issue #176; not individually ratified by Pedro \
Audience: contributor; AI agent; operator/release; security \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2026-12-01 \
Update trigger: persistence, identity storage, namespace, schema, backup, restore, or recovery decision \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no \
Related: #168, #172, #174, #175, #176, #177; ADR-0002, ADR-0003, ADR-0004, ADR-0005

ADR lifecycle state: **proposed**. Issue #176 delegates technical selection to the maintainer and labels the selections provisional. The indexed scope of recovery mandate #82 permits autonomous issue, PR, and configuration work, but does not explicitly authorize ADRs to use the provisional lifecycle. Under the rule in [the ADR lifecycle policy](README.md#lifecycle), this proposal must remain proposed until a human ratifies it or an explicit mandate authorizes provisional ADRs. It is not accepted and does not authorize code or dependencies.

## Context and authority boundary

The accepted product direction is Linux desktop and offline-first (#168). The accepted identity model is an implicit local profile with a stable LifeOS identifier, not derived from a Linux username or UID (#172). The accepted transition uses a new isolated context and leaves historical stores untouched by default (#174). The accepted target architecture is Tauri 2, React/TypeScript, and a Rust core, migrated in reversible slices (#175).

Issue #176 delegates selection of the new local persistence and recovery approach. This ADR records that delegated selection as a proposal. It does not expand the human decisions in ADR-0003 or ADR-0004, authorize access to historical data, or prove implementation.

Observed legacy code is not the target design: the web MVP uses file-backed JSON through api/atomicJsonFile.ts and api/mvpRepository.ts; Electron uses a separate JSON workspace and better-sqlite3 database. electron/db/database.ts enables WAL and creates legacy tables, while electron/main.ts initializes that database and starts the sync engine during startup. These facts describe code only. No database, backup, or personal-data file was opened for this ADR.

## Proposed selection

The delegated selection is one new SQLite database, owned and accessed only by Rust through rusqlite. It is the sole authoritative store for the new profile identity and active workspace. UI state is a projection; backups and exports are not additional authorities. No ORM, required server, second authoritative JSON store, or Tauri SQL plugin is selected.

Initial SQLite settings are journal_mode=DELETE, synchronous=EXTRA, and foreign_keys=ON. Verify the effective settings on every Rust connection and fail if SQLite did not apply them. Rust owns a single serialized writer, uses bounded lock waiting with explicit failure, and keeps transactions short. Rollback journals are SQLite-managed; recovery code must not delete a journal manually after interruption. WAL is deferred for the initial local flow.

The database has a reserved LifeOS application_id marker and a versioned schema tracked with user_version. Exact marker value, busy timeout, crate version, feature set, and dependency linkage remain unselected implementation details. Issue #176 records bundled SQLite as an initial linkage preference; compare that option with system linkage for dependency, license, update, and package impact, then obtain dependency approval before fixing the build strategy. Issue #176 sets SQLite 3.51.3 as an initial package floor; verify the effective runtime version and current security/bug-fix status before implementation. DELETE mode avoids WAL-specific recovery cases but does not remove the need to assess updates and test the selected library. Migrations are versioned, transactional, and idempotent. Before migration, the application must create and validate a backup; it must reject unknown or future schema versions and must not silently create an empty database when an existing file is invalid or inaccessible.

The profile receives a random UUID v4 generated locally once and persisted in the authoritative database. It remains stable across restarts and Linux username changes and is not derived from a UID, username, email, or legacy identifier. Workspace and identity changes share the same database and transaction boundary. This records an identifier mechanism under #176; it does not revise the accepted identity model in ADR-0003 or authorize automatic association of historical records.

## Proposed isolated XDG namespace

Use a distinct application identifier, org.anakyklos.lifeos, separate from the experimental Electron identifier com.lifeos.app. The proposed active data path is:

- Data: XDG_DATA_HOME/anakyklos/lifeos-linux/state.sqlite3
- Data fallback when XDG_DATA_HOME is unset, empty, or invalid: HOME/.local/share/anakyklos/lifeos-linux/state.sqlite3
- Configuration: XDG_CONFIG_HOME/anakyklos/lifeos-linux; fallback HOME/.config/anakyklos/lifeos-linux
- Cache: XDG_CACHE_HOME/anakyklos/lifeos-linux; fallback HOME/.cache/anakyklos/lifeos-linux
- Auxiliary state, only if needed and never as a second domain authority: XDG_STATE_HOME/anakyklos/lifeos-linux; fallback HOME/.local/state/anakyklos/lifeos-linux

XDG values must be absolute. A usable absolute HOME is required when an XDG base must fall back; otherwise startup fails explicitly. The application must not fall back to the working directory, /tmp, a legacy path, or a second store. This namespace is a selected proposal, not proof that it is distinct on every host.

Before any write, a future implementation must reject known legacy collisions, unsafe symlinks or aliases, inaccessible or occupied destinations, and paths whose separation cannot be established without opening historical content. It must not scan the home directory or inspect legacy SQLite/JSON files, sidecars, or backups during essential startup. ADR-0004 remains controlling for this boundary.

Use private directory permissions of 0700 and database/backup file permissions of 0600 where supported; verify them in the target environment. These permissions do not isolate processes sharing the same UID, root, physical access, or unencrypted backups.

## Backup, restore, failure, and rollback contract

Backups use SQLite's Online Backup API through rusqlite rather than copying a live database file. A backup must be validated for SQLite integrity, known schema version, profile identity, and logical workspace invariants before it is treated as usable. A checksum may detect byte changes but cannot establish completeness, ownership, or correctness.

Before a migration, preserve a validated snapshot. Before an explicit restore, pause writes and preserve the current state, including changes made after the last backup. Restore requires user consent, an exact target, input validation, controlled replacement, and post-restore checks. On any failed restore or rollback, preserve the prior database and all recoverable state; do not reset to a blank workspace or silently select another path. Automatic retention, snapshot naming, and publication mechanics remain implementation decisions.

SQLite transactions and synchronous settings reduce specific interruption risks; they cannot guarantee survival of every power loss, filesystem defect, storage-controller failure, corruption, or external modification. The exact behavior must be tested on the supported storage/filesystem path. Symlink and time-of-check/time-of-use risks also remain until a concrete path-handling design is implemented and tested.

## Alternatives and trade-offs

| Option | Reason considered | Trade-off |
|---|---|---|
| Versioned JSON as the active store | Existing TypeScript helpers already serialize file mutations through a per-path queue and replace files through a temporary file and rename. It offers a smaller first persistence slice. | The new domain would need to own aggregate rewrite, schema evolution, relationships, concurrency, and crash recovery. It remains useful for explicit export/import formats, but not as a second active source of truth. |
| SQLite with WAL | Supports concurrent readers and a writer. | The first local flow has one Rust writer and no demonstrated read-concurrency need. WAL adds persistent sidecars and checkpoint/recovery cases. Revisit only with measured need and new recovery evidence. |
| SQLite with DELETE and EXTRA | Provides transactions and a single authoritative database file between operations; fits the selected single-writer boundary. | Adds a native crate/build and migration surface; rollback journals still exist during transactions, and behavior depends on the filesystem and storage stack. |
| Existing Electron SQLite/JSON stores | Reuse could reduce initial coding. | They are legacy stores with different identities, paths, schemas, and startup behavior. Reusing or opening them would violate the isolation decision in ADR-0004. |

## Evidence, risks, and review conditions

Available evidence: current legacy source files; issue decisions #168 and #172–#176; Anakyklos resource-efficiency and module-autonomy policies; SQLite and rusqlite documentation. The current runtime has no demonstrated Tauri/Rust database, backup, or restore path.

Missing evidence: approved dependency assessment for rusqlite and its features; collision-free path proof on target systems; filesystem and crash/restart tests; schema/migration tests; backup/restore and rollback drills; resource measurements; real packaged Linux execution. No dependencies were installed and no historical data was accessed.

Reopen or reject this proposal if the selected dependency or SQLite settings fail the target build, measured workload, filesystem tests, or recovery contract; if the XDG destination aliases legacy data; if stable local identity cannot be preserved; or if a simpler store meets the same transaction and recovery requirements with materially lower cost. Human ratification must explicitly confirm or replace the selection. Reversal of implementation must preserve the active database and all post-transition data.

## Future validation gate

A separate ready implementation issue must validate path collisions and permissions without reading legacy contents; effective SQLite version and PRAGMA settings on every connection; single-writer and concurrent-start behavior; transaction rollback; migration replay and future-schema refusal; process interruption/restart; SQLite integrity and logical invariants; consistent backup through the SQLite API; consented restore; and preservation of current state after failed restore. Use synthetic fixtures until separately authorized migration work exists. Passing documentation or web CI does not satisfy these gates.

## Sources

- Delegated selection: [issue #176](https://github.com/Anakyklos/life-os/issues/176); accepted boundaries: [ADR-0003](0003-linux-desktop-local-identity.md), [ADR-0004](0004-linux-context-isolation.md), and [ADR-0005](0005-linux-tauri-rust-architecture.md).
- Legacy implementation inspected: [atomicJsonFile.ts](../../api/atomicJsonFile.ts), [mvpRepository.ts](../../api/mvpRepository.ts), [database.ts](../../electron/db/database.ts), and [main.ts](../../electron/main.ts).
- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir/); [SQLite PRAGMA documentation](https://sqlite.org/pragma.html); [SQLite atomic commit](https://sqlite.org/atomiccommit.html); [SQLite Online Backup API](https://sqlite.org/backup.html); [rusqlite backup module](https://docs.rs/rusqlite/latest/rusqlite/backup/index.html).
- Anakyklos [Technology Palette](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/README.md), [Rust profile](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/languages/rust.md), and [resource-efficiency policy](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/policies/resource-efficiency.md).

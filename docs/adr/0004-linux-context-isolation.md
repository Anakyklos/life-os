# ADR-0004: Isolated Linux data context

Status: CANONICAL \
Authority: human decision approved by Pedro in issue #174 (2026-11-01) \
Audience: contributor; AI agent; operator/release; security \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2027-01-14 \
Update trigger: Linux context boundary, historical-data access, destination safety, or rollback decision \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no; a separate ready issue, approved contracts, and applicable gates remain mandatory

ADR lifecycle state: **accepted only for the isolated-context strategy approved in #174**. This ADR does not accept the identity model beyond #172, the target architecture from #175, or the delegated technical selections in #176.

## Context

Pedro approved Linux desktop, offline-first product direction in [#168](https://github.com/Anakyklos/life-os/issues/168), the implicit local identity model in [#172](https://github.com/Anakyklos/life-os/issues/172), and a new, isolated Linux context in [#174](https://github.com/Anakyklos/life-os/issues/174). The repository's currently implemented runtime remains the web application with experimental Electron code; these decisions do not establish Linux implementation, validation, or release.

Historical SQLite and JSON stores, sidecars, workspaces, and backups may contain records with different or unknown identities. Essential startup in the new context must not depend on finding, opening, reading, importing, or reconciling them. Preserving their contents and ownership is a separate requirement from deciding whether a new destination is safe to use.

## Authority and boundaries

| Source | Decision | Authority and state |
|---|---|---|
| [#168](https://github.com/Anakyklos/life-os/issues/168) | Linux desktop, offline-first product direction | Approved by Pedro; product direction only. |
| [#172](https://github.com/Anakyklos/life-os/issues/172) | One implicit local profile with a stable LifeOS-owned identifier and no mandatory application password | Approved by Pedro; recorded in ADR-0003, which remains canonical for identity. |
| [#174](https://github.com/Anakyklos/life-os/issues/174) | Start with a new context isolated from historical stores; no required history inspection or automatic import/association | Approved by Pedro; this is the only decision this ADR marks `accepted`. |
| [#175](https://github.com/Anakyklos/life-os/issues/175) | Tauri 2 + React/TypeScript + Rust target architecture | Approved separately by Pedro and recorded narrowly in ADR-0005; implementation evidence remains pending. This does not expand the isolation decision in this ADR. |
| [#176](https://github.com/Anakyklos/life-os/issues/176) | New Rust-controlled SQLite, dedicated XDG namespace, restricted Tauri IPC, backup/recovery, and primary `.deb` | Delegated selections recorded in proposed ADR-0006 through ADR-0008; not individually ratified by Pedro or implemented. |

The authority of #175 and #176 is not expanded by their inclusion here. In particular, this ADR does not claim that any of these technologies or contracts have been implemented. Any recovery safeguards required for a future legacy-data operation are prerequisites for that separately authorized work; they do not ratify the proposed backup/recovery selection in ADR-0006, and this ADR selects no storage or backup technology.

## Decision — approved by Pedro

1. The first Linux context is a new active data context, with a destination proven separate from known historical storage locations before any write to that destination.
2. Essential initialization may establish and validate only the new context. It does not require a complete inventory of historical data and must not open or read historical SQLite/JSON contents, sidecars, workspaces, or backups.
3. Destination validation may use path resolution and filesystem metadata needed to establish safety and separation. It must detect or reject collisions, aliases, and unsafe symbolic-link paths against known legacy locations. It must not recursively search the home directory or infer history from unread files.
4. If the destination is occupied unexpectedly, ambiguous, inaccessible, affected by an unsafe alias or symlink, or cannot be proven separate, initialization fails before writing. It must report the failure; it must not silently fall back to a historical location or another destination.
5. Historical stores and their sidecars and backups remain intact and inert by default. Startup must not initialize, rewrite, truncate, delete, overwrite, import, reassign, merge, or associate any historical record or identity with the new context. It must not imply that historical data was inventoried, absent, or owned by the active profile.
6. The new context follows the identity decision in #172: one implicit local profile with a persistent LifeOS-owned logical identifier independent of Linux username and UID. That identity does not claim historical records or establish their ownership.
7. Any later inspection or import of historical data is a separate, explicit, consented, operation-specific action. Before reading selected sources, safely discover and identify those exact sources. Before any legacy mutation, establish the selected identities and provenance, source consistency, recoverable backups, and an explicit mapping for any records the user elects to associate. Ambiguity blocks the operation; no record is silently adopted or altered.
8. Rollback of application code or packaging preserves the complete data created in the new context. Rollback must not delete, overwrite, or rewrite that context; if an earlier version cannot safely use it, leave it intact and stop rather than resetting or redirecting it.
9. No online service, account, sync, or network connection is required to initialize or use the isolated context's essential functions.

## Consequences

The new context can begin without making assumptions about the existence, contents, identities, or recoverability of historical stores. Historical inspection and import remain possible as separately designed operations with consent, provenance, and recovery controls.

The destination boundary and history-operation contract still require a concrete implementation and verification. Path checks alone do not prove safety until exercised against filesystem aliases, symbolic links, permissions, collisions, and failure cases on the supported Linux environment.

## Migration and rollback

This ADR authorizes no migration or runtime change. Starting the isolated context does not migrate historical records. A future history operation must have its own ready issue, exact source and destination scope, consent flow, identity/provenance mapping, consistency and recovery plan, and validation evidence before it can read or mutate selected legacy data.

Rollback applies to the application version, not to user data. It must preserve the new context without destructive downgrade or silent redirection. This ADR does not select a storage engine, namespace, backup implementation, or package format.

## Validation required before implementation or release claims

Future implementation evidence must separately establish:

- a fresh isolated context can initialize offline without reading historical file contents or requiring a historical inventory;
- destination collisions, path aliases, unsafe symbolic links, invalid paths, and permission failures stop before any write, with no silent fallback;
- startup leaves historical stores, sidecars, and backups unchanged and does not associate their records with the new identity;
- application rollback preserves the complete new-context data;
- any separately offered history inspection/import requires operation-specific consent, safe discovery, identity/provenance inventory, consistent backups and recovery, and explicit mapping before mutation.

Passing web checks or documenting these requirements does not prove Linux behavior, implementation, support, or release readiness.

Related: #82, #168, #172, #174, #175, #176; ADR-0002, ADR-0003.

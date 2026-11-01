# ADR-0007: Linux IPC and trust boundaries

Status: PROPOSAL \
Authority: delegated technical selection recorded in issue #176; not individually ratified by Pedro \
Audience: contributor; AI agent; security \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2026-12-01 \
Update trigger: Tauri command surface, renderer authority, plugin permission, or online integration change \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no \
Related: #168, #172, #174, #175, #176, #177; ADR-0002, ADR-0003, ADR-0004, ADR-0005

ADR lifecycle state: **proposed**. Issue #176 delegates technical selection to the maintainer and labels the selections provisional. The indexed scope of recovery mandate #82 does not explicitly authorize ADRs to use the provisional lifecycle. Under the rule in [the ADR lifecycle policy](README.md#lifecycle), this remains a proposal pending human ratification or an explicit mandate. It is not accepted and does not authorize code or dependencies.

## Context and authority boundary

ADR-0005 accepts Tauri 2 with a React/TypeScript interface and Rust local core. This proposal specifies the security direction for their boundary. It does not change the accepted architecture, the identity decision in ADR-0003, or the historical-data isolation decision in ADR-0004.

Current evidence belongs to the legacy application: Electron exposes APIs through electron/preload.ts and handlers; that preload includes generic resource and legacy request entry points. electron/main.ts registers handlers and starts database and sync initialization. These paths are not the target Tauri contract and are not being changed here.

## Proposed boundary

React/TypeScript is a presentation layer and sends bounded requests to explicit Tauri commands. It has no direct authority over the database or filesystem. Rust owns persistence, filesystem access, identity and workspace invariants, validation, and any state-changing operation.

Commands are specific to a user-visible application operation. Rust validates payload shape, size, and meaning before acting, including data that was typed or checked in the renderer. No command exposes arbitrary SQL, caller-selected filesystem paths, generic resource/action dispatch, unrestricted shell/process execution, or broad filesystem access. The Tauri SQL or filesystem plugin is not selected as a direct renderer data path. HTTP/Express is not required for local application behavior and must not become an implicit fallback.

Tauri capabilities and permissions are reviewed per window, plugin, command, and release configuration. The existence of a capability file alone is not proof that custom Rust commands are restricted: Tauri documents that commands registered with invoke_handler are usable by all app windows and webviews by default unless the command manifest restricts them. Tauri command scopes also require the application command to enforce the passed scope; bypasses must be reviewed. The future implementation must deliberately configure and test command exposure, permissions, and scopes; it must not assume plugin capabilities automatically authorize or protect every custom command.

The renderer, browser-originated values, and all imported files are untrusted inputs. Rust must independently validate them. Imported content is parsed under explicit size/format limits and cannot choose an arbitrary destination or cause historical data to be opened implicitly. Online integrations are optional, isolated from the essential local path, and require clear user consent. No background upload, telemetry, or cloud fallback is part of this selection.

No command names, payload schemas, capability manifest, plugin list, URL/origin policy, or network contract is approved here. Examples in issue #176 are candidates, not a final IPC API.

## Alternatives and trade-offs

| Option | Benefits | Costs and risks |
|---|---|---|
| Narrow Tauri commands with Rust validation | Matches the approved target stack; keeps privileged filesystem and database operations in the local core; avoids a mandatory local server. | Requires Rust expertise, careful command inventory, validation, and separate tests for each authorization boundary. A registered command can be exposed too broadly if the manifest and windows are not reviewed. |
| Electron preload and IPC | The repository has an experimental implementation, TypeScript handlers, and existing UI adapters; reuse could reduce initial porting. | Electron main/preload carry Node and filesystem authority, Chromium/Node update costs, and broad existing APIs. The current generic resource and legacy bridges require redesign and do not prove a safe future contract. |
| HTTP/Express or loopback service | Existing web API contracts and schemas may be reusable. | Adds a listening/transport boundary and server lifecycle to an offline desktop path; loopback access and authentication become additional concerns. It is not required by the approved target architecture. |
| Renderer access to SQL or unrestricted filesystem plugins | May shorten UI-side integration work. | Gives presentation code direct authority over durable data and paths, complicates validation and recovery, and violates the selected Rust-owned boundary. |

## Security review and risks

This boundary reduces the amount of privileged code callable from the renderer; it does not eliminate XSS, malicious imported content, command authorization errors, unsafe Rust, dependency vulnerabilities, or same-user/root access. Rust memory and concurrency guarantees do not prove that command semantics are correct. Every command and plugin remains an individually reviewed security boundary.

A future command review must identify its caller window and origin assumptions, authorization rule, payload schema and limits, database/filesystem effects, error behavior, and offline behavior. Tests must attempt unauthorized calls, malformed and oversized inputs, invalid state transitions, path manipulation, and imported files with hostile content. Review the generated Tauri configuration and packaged assets, not only source capability declarations.

## Evidence, reversibility, and future gates

Available evidence: issue #176 delegation, ADR-0005 architecture decision, inspected legacy preload/handlers, and current Tauri v2 security documentation. No Tauri commands, capabilities, or plugin permissions are implemented in the repository.

Missing evidence: final command inventory; origin/window configuration; capability and command-manifest behavior in a packaged build; malicious input testing; dependency review; offline network observation; independent security review.

Reject or revise this proposal if a command requires broad renderer authority, if a plugin cannot be restricted to the required operations, if packaged configuration exposes commands to unintended windows or sources, or if the boundary cannot be tested. Removing or changing a command is reversible only after callers and durable effects are accounted for. Human ratification or an explicit provisional mandate is required before this proposal governs implementation.

A separate ready issue must validate per-command exposure, payload boundaries, filesystem and database isolation, optional-consent network behavior, and a packaged Tauri security configuration. No Linux IPC has been implemented or validated by this ADR.

## Sources

- Delegated selection: [issue #176](https://github.com/Anakyklos/life-os/issues/176); accepted architecture: [ADR-0005](0005-linux-tauri-rust-architecture.md); identity and isolation: [ADR-0003](0003-linux-desktop-local-identity.md) and [ADR-0004](0004-linux-context-isolation.md).
- Legacy implementation inspected: [Electron main](../../electron/main.ts), [preload](../../electron/preload.ts), [trusted handlers](../../electron/ipc/trustedHandler.ts), and [resource handler](../../electron/ipc/resourceHandler.ts).
- Tauri v2 [capabilities](https://v2.tauri.app/security/capabilities/), [permissions](https://v2.tauri.app/security/permissions/), [security overview](https://v2.tauri.app/security/), and [command scopes](https://v2.tauri.app/security/scope/).
- Anakyklos [Technology Palette](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/README.md), [TypeScript profile](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/languages/typescript.md), [Rust profile](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/languages/rust.md), and [module-autonomy policy](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/policies/module-autonomy.md).

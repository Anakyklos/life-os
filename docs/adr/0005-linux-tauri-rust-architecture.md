# ADR-0005: Tauri 2, React/TypeScript, and Rust for Linux desktop

Status: CANONICAL \
Authority: explicit human approval by Pedro in issue #175 (2026-11-01) \
Audience: contributor; AI agent; operator/release; security \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2027-01-14 \
Update trigger: target host, UI/core boundary, migration sequence, or accepted architecture decision changes \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no; a separate ready issue, dependency authorization, and applicable implementation and Linux validation gates remain mandatory \
Related: issues #168, #172, #174, #175, #176, #177; ADR-0001, ADR-0002, ADR-0003, ADR-0004

ADR lifecycle state: **accepted only for the five architecture decisions stated below**. This ADR does not accept the provisional technical selections in #176 and does not claim implementation, Linux validation, support, or release.

## Context

Pedro approved Linux desktop, offline-first as the product direction in [#168](https://github.com/Anakyklos/life-os/issues/168). Separate human decisions approved a local identity model in [#172](https://github.com/Anakyklos/life-os/issues/172) and an isolated Linux data context in [#174](https://github.com/Anakyklos/life-os/issues/174). On 2026-11-01, Pedro explicitly approved **Tauri 2 + React/TypeScript + a Rust core** as the target architecture in [#175](https://github.com/Anakyklos/life-os/issues/175), accepting the cost of moving business rules from TypeScript to Rust when needed, provided the migration remains incremental and reversible.

The repository's implemented application remains a transitional React/Vite + Express web application with experimental Electron paths. The existing MVP UI adapter chooses HTTP for the web runtime and an Electron `window.api.mvp` bridge for desktop (`src/features/mvp/api/mvp.api.ts`). The Electron entry point initializes the historical database and sync engine (`electron/main.ts`); web data uses the Express API and file-backed or explicitly selected Prisma persistence (`api/server.ts`, `api/mvpRepository.ts`). These are current implementation facts, not the target architecture. Existing React components may be reusable, but their HTTP and Electron transport wiring is not a Tauri contract.

The product and architecture boundaries are distinct:

- [ADR-0002](0002-linux-desktop-offline-first.md) records the Linux desktop, offline-first product direction.
- [ADR-0003](0003-linux-desktop-local-identity.md) remains canonical for the identity model approved in #172.
- [ADR-0004](0004-linux-context-isolation.md) remains canonical for the isolated new context approved in #174.
- This ADR records only the target host, interface/core languages, reversible migration, and essential offline operation approved in #175.
- [#176](https://github.com/Anakyklos/life-os/issues/176) contains separate, delegated technical selections. They are provisional, pending their own ADR integration, and are not individually ratified by #175.

## Decision drivers

- Keep the approved essential LifeOS loop usable without network access.
- Reuse the existing React/TypeScript interface where it is suitable without carrying forward web-server or Electron authority by accident.
- Place privileged local operations behind a narrow native core rather than making the renderer the authority for durable data or filesystem changes.
- Preserve a reversible path from the existing TypeScript implementation and its data.
- Keep Linux dependencies, resource use, update responsibility, and maintenance effort visible and measurable.

## Decision — approved by Pedro in #175

The target architecture is:

1. **Tauri 2** is the desktop host for the Linux target.
2. **React and TypeScript** provide the interface and presentation layer.
3. **Rust** provides the local application core, including privileged filesystem and integrity boundaries.
4. Essential functions work **offline**; no remote service is required for the essential product loop.
5. The transition is **incremental and reversible**, using small slices with verification rather than a big-bang rewrite.

These five decisions are the full accepted scope of ADR-0005. Rust is the authority for privileged operations in the target architecture; the UI is a client of that core. This does not select persistence, paths, detailed IPC commands or permissions, backup/recovery design, or a release package.

## Decision boundary

| Topic | Authority and state |
|---|---|
| Linux product direction and essential offline use | Approved in #168 / ADR-0002. |
| Tauri 2 host; React/TypeScript interface; Rust local core; incremental reversible migration; essential offline operation | Approved in #175; accepted here only within that scope. |
| Local identity | Separately approved in #172 and recorded in ADR-0003; not expanded here. |
| Isolated new Linux context and preservation of historical data | Separately approved in #174 and recorded in ADR-0004; not expanded here. |
| SQLite, XDG namespace and exact paths, detailed Tauri IPC/capabilities, backup/recovery, and primary `.deb` package | Delegated technical selections in #176; provisional, not individually ratified by Pedro, and pending separate ADR integration, dependency authorization, and validation. |
| Linux runtime, installer, offline behavior, support matrix, and release | Not implemented or verified by this ADR. |

Issue [#177](https://github.com/Anakyklos/life-os/issues/177) remains blocked until these decisions are formally integrated and any required dependencies are authorized. This ADR itself authorizes neither #177 implementation nor dependency changes.

## Options considered

The comparison below uses the current repository structure, the #175/#176 issue records, the Anakyklos Technology Palette and policies, and current upstream framework documentation. Footprint comparisons are qualitative expectations only. No comparable Linux package, idle-memory, or startup measurements were available, so they are not performance findings.

| Option | Migration cost | Linux dependencies | Security and integrity boundary | Footprint expectation | Maintenance cost |
|---|---|---|---|---|---|
| **Tauri 2 + React/TypeScript + Rust — selected** | Reuse of React UI is possible, but existing HTTP/Electron adapters must be replaced or separated. Porting selected domain rules and their tests from TypeScript to Rust is a substantial, explicitly accepted cost; small slices limit divergence and rollback risk. | Rust/Cargo and native build tooling are required. Linux development uses GTK/WebKitGTK system packages; runtime WebKit compatibility and package dependencies vary by distribution and must be verified for the actual target. | Rust is suited to validation and privileged filesystem/data boundaries. Tauri's command/capability surface must still be explicitly restricted and tested; Rust does not prevent logic errors or unsafe designs. | Tauri can rely on the installed system WebView instead of packaging Chromium, which may reduce the application bundle/runtime baseline. This depends on distro libraries and has not been measured for LifeOS. | Adds Rust build and review skills plus WebKitGTK compatibility work. Keeps React/TypeScript for UI. A small, stable command surface and few dependencies are necessary to retain the expected maintenance benefit. |
| **Electron + React/TypeScript** | Lowest initial cost because the repository already contains Electron, a preload bridge, and an MVP UI adapter. Local/offline separation and legacy database/sync bootstrap still require significant redesign; TypeScript business rules remain easier to reuse. | Distributes Chromium/Node with the application and still needs Linux system integration libraries. It avoids a system WebKitGTK runtime dependency but has its own native package and ABI support matrix. | Can be hardened with local content, renderer sandboxing, context isolation, no Node integration, narrow preload APIs, and sender/payload checks. The inspected main window sets sandboxing, context isolation, and no Node integration; its preload/IPC surface still needs handler-level authorization and payload review. Main-process and preload authority also require timely Electron/Chromium/Node updates. | Bundles Chromium and Node and uses Chromium's multi-process model, so a larger installed and resident footprint is expected than a system-WebView host; measure on target hardware before making a LifeOS claim. | Reuses current TypeScript and Node skills, but retains Electron-specific packaging, security updates, native modules, and runtime dependency management. |
| **React/TypeScript plus a Go local service and a desktop host** | UI reuse is possible, but a Go core and host must be added and business rules still moved out of Express. This introduces a second process and a versioned local IPC/lifecycle contract. | Requires Go toolchain for development and packaging of the service, plus a separate UI host and its dependencies. A single Go executable alone does not provide the desktop window. | Go is a credible choice for I/O and process orchestration, but it does not offer Rust's ownership and memory-safety guarantees at the selected privileged boundary. A separate service also expands process, endpoint, and shutdown boundaries. | A Go service can have a modest native runtime, but total idle cost includes the service and UI host. No LifeOS measurements exist. | Go is CORE in the palette and can simplify long-lived orchestration, but this design adds a runtime, IPC contract, lifecycle owner, and additional release artifacts without a demonstrated need in the approved target. |
| **Native GTK/Qt interface with Rust core** | Highest UI migration cost: the React UI and its web component ecosystem would need replacement, alongside domain migration. | Uses the selected toolkit's native Linux stack; the exact libraries and compatibility matrix depend on GTK/Qt and packaging choice. | A Rust core could preserve native data boundaries, but the UI/toolkit still requires a carefully defined interface and input validation. | Potentially avoids a general-purpose web runtime; actual binary, process, and idle use depends on toolkit and must be measured. | Adds a second UI stack and would duplicate existing presentation work. It is not justified while React reuse is an explicit target. |

### Why Rust is justified despite its SPECIALIST classification

The Anakyklos Technology Palette classifies Rust as **SPECIALIST**, not as the default implementation language. Its use here is justified by the specific native boundary the target architecture needs: validating IPC input, handling filesystem paths and aliases, protecting local data integrity, and eventually implementing recovery-sensitive operations. These are concrete areas where memory safety, ownership, and concurrency guarantees can reduce classes of implementation risk.

TypeScript is **CORE** for the React interface and remains appropriate for presentation and UI state. Go is also **CORE** and remains plausible for a runtime dominated by I/O orchestration and process lifecycle. The selected target gives Rust the privileged boundary role while avoiding a separate Go service and its second process/IPC lifecycle. Rust is not selected as a performance claim or as a rewrite of the UI. Its additional training, review, build, and dependency costs are real; the explicit migration and equivalence-test requirements are how the accepted decision constrains those costs.

The Anakyklos module-autonomy policy keeps this native core owned by LifeOS; the decision does not create a shared cross-repository runtime. Resource efficiency remains an evidence requirement: measure startup and idle resource use, and do not add an always-running service or polling loop without a demonstrated need.

Rust does not prove correct authorization, safe paths, correct recovery, or correct product behavior. The future implementation still needs explicit command allowlists, payload validation, dependency review, failure tests, and measured Linux evidence. Any `unsafe` code or FFI must be narrowly isolated and reviewed.

## Migration contract

The initial path is:

1. Build an **isolated Tauri shell with React** and local frontend assets. It must not import or initialize the legacy Electron bootstrap, Express server, historical stores, or sync engine.
2. Produce and execute the first Linux **`.deb`** package. This is a migration milestone requested by #175 and aligned with Anakyklos packaging policy; the package-format selection remains provisional under #176 until its separate ADR and dependency authorization. Confirm installation and runtime dependencies on the declared Linux target before making a support claim.
3. Add the **Rust core** with only explicitly authorized and validated commands. The exact Tauri IPC, permission, and capability contracts remain subject to #176's separate ADR; do not give the renderer general filesystem, SQL, shell, or network authority.
4. Introduce **local persistence in a later slice**, only after the applicable #176 selection is separately recorded, authorized, and tested. The initial shell does not imply a database or recovery design.
5. Move business rules to Rust **one bounded slice at a time**. Reuse React/TypeScript presentation where useful and preserve one authoritative implementation for each migrated rule.
6. Add **equivalence and recovery tests** for each migrated behavior, including interruption and restart cases. Until real user-data migration is separately approved, recovery evidence must use synthetic fixtures.
7. Retire the web runtime only after the desktop target demonstrably replaces its required behavior, migration and recovery preserve user data, and the remaining compatible readers or exports are no longer needed under a separately ready issue.

The first shell and first package are not evidence that the weekly loop, persistence, recovery, accessibility, or Linux release is complete. Existing web and Electron implementations and their data paths remain preserved until replacement evidence and a separate authorization support any retirement.

## Consequences and risks

### Benefits

- Gives Linux desktop work one approved host/UI/core direction while keeping the existing React interface useful where it can be reused.
- Places local privileged operations behind a native core and supports offline operation without a required server.
- Keeps a path to reverse or pause the transition before old runtime and data contracts are retired.

### Costs and risks

- Porting TypeScript domain logic to Rust adds implementation time and creates a risk of behavioral drift; slice-level equivalence tests and a single authority per rule are required.
- System WebKitGTK versions, Linux libraries, package metadata, graphics sessions, and accessibility behavior need verification on real target environments.
- Rust's type guarantees cannot replace threat modeling, command authorization, input validation, recovery design, or security review.
- No footprint or performance advantage has been demonstrated for LifeOS; record startup time, idle RSS, package size, dependency set, and CPU use on target Linux hardware before making quantitative claims.
- Existing runtime/data retirement is a separate data-risk decision. A code rollback must not delete or redirect data created by the new context.

## Validation required before support or release claims

Future implementation issues must define and produce evidence for at least:

- fresh isolated Linux launch and essential-loop operation with network unavailable;
- executable package installation, desktop launch, clean uninstall behavior, and declared system dependencies on the supported distribution;
- narrow IPC command/capability checks and rejection of invalid or unauthorized input;
- persistence, restart, process interruption, backup, restore, and rollback using synthetic data before any real-data operation;
- equivalence tests between retained TypeScript behavior and each Rust-migrated slice;
- filesystem collision, symlink/alias, permission, and historical-data preservation cases required by ADR-0004;
- startup time, idle RSS, package size, CPU use, dependency footprint, accessibility, and desktop-session evidence on the declared target.

Passing web CI, documenting this ADR, or producing a shell/package artifact alone does not prove Linux support, offline behavior, migration safety, or release readiness.

## Sources consulted

- LifeOS decisions: [#168](https://github.com/Anakyklos/life-os/issues/168), [#172](https://github.com/Anakyklos/life-os/issues/172), [#174](https://github.com/Anakyklos/life-os/issues/174), [#175](https://github.com/Anakyklos/life-os/issues/175), and [#176](https://github.com/Anakyklos/life-os/issues/176).
- Current code: [`package.json`](../../package.json), [`src/features/mvp/api/mvp.api.ts`](../../src/features/mvp/api/mvp.api.ts), [`electron/main.ts`](../../electron/main.ts), [`electron/preload.ts`](../../electron/preload.ts), [`api/server.ts`](../../api/server.ts), and [`api/mvpRepository.ts`](../../api/mvpRepository.ts).
- Anakyklos Architecture: [Technology Palette](https://github.com/Anakyklos/architecture/blob/main/README.md), [Technology Selection Guide](https://github.com/Anakyklos/architecture/blob/main/languages/AGENT-GUIDE.md), [Rust](https://github.com/Anakyklos/architecture/blob/main/languages/rust.md), [TypeScript](https://github.com/Anakyklos/architecture/blob/main/languages/typescript.md), [Go](https://github.com/Anakyklos/architecture/blob/main/languages/go.md), [resource efficiency](https://github.com/Anakyklos/architecture/blob/main/policies/resource-efficiency.md), [module autonomy](https://github.com/Anakyklos/architecture/blob/main/policies/module-autonomy.md), and [Linux packaging](https://github.com/Anakyklos/architecture/blob/main/policies/linux-packaging.md).
- Upstream framework references: [Tauri architecture](https://v2.tauri.app/concept/architecture/), [Tauri app size](https://v2.tauri.app/concept/size/), [Tauri Linux prerequisites](https://v2.tauri.app/start/prerequisites/), [Tauri security and trust boundaries](https://v2.tauri.app/security/), [Tauri capabilities](https://v2.tauri.app/security/capabilities/), [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security), and [Electron process model](https://www.electronjs.org/docs/latest/tutorial/process-model).

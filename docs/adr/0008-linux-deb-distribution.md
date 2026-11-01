# ADR-0008: Linux .deb distribution proof

Status: PROPOSAL \
Authority: delegated technical selection recorded in issue #176; not individually ratified by Pedro \
Audience: contributor; AI agent; operator/release; security \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2026-12-01 \
Update trigger: primary Linux package, package identity, supported target, runtime dependencies, or update path changes \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no \
Related: #168, #174, #175, #176, #177; ADR-0002, ADR-0004, ADR-0005

ADR lifecycle state: **proposed**. Issue #176 delegates technical selection to the maintainer and labels the selections provisional. The indexed scope of recovery mandate #82 does not explicitly authorize ADRs to use the provisional lifecycle. Under the rule in [the ADR lifecycle policy](README.md#lifecycle), this remains a proposal pending human ratification or an explicit mandate. It is not accepted and does not authorize a build, dependency, release, or support claim.

## Context and authority boundary

ADR-0005 selects Tauri 2 + React/TypeScript + Rust as the target architecture. The Anakyklos [Linux Packaging and Installation Policy](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/policies/linux-packaging.md) identifies .deb as the primary artifact for Debian-family desktop targets, including Ubuntu, and says AppImage is not the default. Issue #176 delegates selecting the initial Linux distribution proof and package path.

The repository currently implements a React/Express web application with experimental Electron code. It has no Tauri runtime, Linux .deb, or validated Linux support matrix. This ADR records a package selection and proof plan only.

## Proposed selection

- Primary Linux artifact: .deb, consistent with Anakyklos packaging policy.
- Proposed package name: anakyklos-lifeos, subject to package-registry, repository, and installed-file collision checks before implementation.
- First proof target: Ubuntu 24.04 x86_64. This is the first environment to test, not a general support declaration.
- Verify actual WebKitGTK and other system dependencies from the built package metadata and installed runtime on the proof target. Do not assume the development toolchain dependency list is the runtime package dependency list.
- Prove installation, application launch, normal close, and removal on a real Ubuntu 24.04 x86_64 environment. Record package metadata and declared dependencies.
- Test offline startup and essential local behavior without a required server or internet. This package proof alone does not prove data persistence, recovery, or the complete weekly loop.
- Exercise X11 and Wayland only in real sessions available for the test. Report only the sessions actually exercised.
- Measure package size, startup time, idle RAM, and idle CPU under a recorded environment. No numeric budget or performance claim is selected by this proposal.
- Do not ship a permanent application-specific updater. A later update path should use the operating system package manager or an explicitly approved distribution channel.
- AppImage is deferred unless a later issue demonstrates a distribution requirement that .deb and other approved options do not satisfy.

The package identity is separate from the proposed application identifier org.anakyklos.lifeos in ADR-0006. Neither identifier is proven collision-free by this ADR.

## Alternatives and trade-offs

| Option | Benefits | Costs and risks |
|---|---|---|
| .deb primary | Matches Anakyklos policy and native Debian-family installation, dependency declaration, removal, and package-manager workflows. | Requires accurate dependency metadata and real install/launch/remove checks; does not by itself establish a signed repository or automatic updates. |
| AppImage primary | Portable single-artifact distribution may help users outside Debian-family packaging. | Not the Anakyklos default; duplicates libraries and update/removal expectations, and increases artifact and maintenance surface. Add only for a demonstrated need. |
| Flatpak, Snap, or RPM first | May serve other distribution ecosystems and sandbox models. | Expands packaging, permissions, dependency, and support matrices before demand is established. No such target is selected here. |
| No installed package, run from source | Avoids package metadata initially. | Cannot prove the intended end-user installation path, system dependency declaration, or clean removal required by #177. |

The approved Tauri architecture is not reopened by this package comparison. Electron packaging is not an alternate target under this ADR.

## Security, maintenance, and evidence limits

Package metadata and installation hooks are part of the trust boundary. A future package must install only the application and declared runtime requirements, use deterministic and reversible hooks, and avoid silently installing unrelated Anakyklos services. Package removal must not delete user data. Updater daemons, broad maintainer scripts, and undeclared runtime downloads are excluded.

Available evidence: delegated package selection in #176, Anakyklos packaging policy, and upstream Tauri Debian packaging guidance. Missing evidence: actual package build, collision check for anakyklos-lifeos, dependency closure on Ubuntu 24.04, clean installation and removal, launch without network, session coverage, and resource measurements. No package has been built or installed as part of this documentation task.

Revise this proposal if the package name collides, the target environment cannot install or launch the package with declared dependencies, the actual WebKitGTK/runtime requirements differ materially, clean removal cannot preserve user data, or measured maintenance cost outweighs the Debian-family path. AppImage or another format requires a concrete later justification and a separately reviewed scope.

## Future validation and release gate

A separate ready implementation issue must produce and install a real .deb, execute and remove it on Ubuntu 24.04 x86_64, verify actual dependencies and WebKitGTK, exercise network-offline startup, observe X11/Wayland only where real sessions are available, and record package size, startup, idle RAM, and CPU. Compatibility with any other distribution or architecture requires evidence from that target. CI builds, documentation, or a smoke run in an uninstalled development environment do not establish Linux support or release readiness.

Issue #177 remains blocked until the required ADRs and authority are reconciled, dependency assessment and approval are complete, and its readiness gates are met. This ADR does not start or authorize #177.

## Sources

- Delegated selection: [issue #176](https://github.com/Anakyklos/life-os/issues/176); target architecture: [ADR-0005](0005-linux-tauri-rust-architecture.md); isolation boundary: [ADR-0004](0004-linux-context-isolation.md).
- Anakyklos [Linux packaging policy](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/policies/linux-packaging.md) and [resource-efficiency policy](https://github.com/Anakyklos/architecture/blob/f8ab0a1def7b6c527fa1d5f26ceaafe8204d7d50/policies/resource-efficiency.md).
- Tauri v2 [Debian packaging](https://v2.tauri.app/distribute/debian/), [Linux prerequisites](https://v2.tauri.app/start/prerequisites/), and [application size](https://v2.tauri.app/concept/size/).

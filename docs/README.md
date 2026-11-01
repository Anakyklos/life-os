# LifeOS documentation authority index

Status: CANONICAL \
Authority: repository documentation authority and search index \
Audience: contributor; AI agent; operator/release; product/business; security \
Owner: repository maintainer \
Last reviewed: 2026-10-31 \
Review by: 2027-01-14 \
Update trigger: any document status, authority, owner, path, active exception or subject source changes \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no

## How to use this index

Read `AGENTS.md`, then this index, then the assigned issue and its exact linked decision before selecting implementation sources. A document describes intent only within its stated subject and authority. Tests, schemas, workflows and code prove current behavior; they do not override a higher-authority product or architecture decision.

Only one document may be CANONICAL for a subject. When two sources of equal or higher authority conflict, stop and report the conflict in the owning issue. Do not reconcile it from code, recency or inference alone.

## Current authority map

| Subject | Current source | State | Authority source | Audience | Owner | Update trigger | Review by |
|---|---|---|---|---|---|---|---|
| Agent entrypoint | [`../AGENTS.md`](../AGENTS.md) | CANONICAL | repository governance; #82/#84/#168 | contributor; AI agent | repository maintainer | agent authority or execution contract | 2027-01-14 |
| Documentation authority | this file | CANONICAL | #89, #131 and #168 | contributor; AI agent; operator/release; product/business; security | repository maintainer | any indexed field or path | 2027-01-14 |
| Repository entry and quick start | [`../README.md`](../README.md) | CANONICAL | validated product/runtime decisions #85/#88/#168 | end user; contributor; AI agent | repository maintainer | product surface, runtime, setup or key-path change | 2027-01-14 |
| Governance map | [`governance/README.md`](governance/README.md) | CANONICAL | #84 and merged governance PR #99 | contributor; AI agent | repository maintainer | governance source or gate | 2027-01-14 |
| Agent execution protocol | [`governance/agent-protocol.md`](governance/agent-protocol.md) | CANONICAL | #84 and repository governance | contributor; AI agent | repository maintainer | issue authorization, stop condition or execution protocol | 2027-01-14 |
| Change-control policy | [`governance/policies.md`](governance/policies.md) | CANONICAL | #84 and #89 | contributor; AI agent | repository maintainer | dependency, docs, PR, ADR or rollback policy | 2027-01-14 |
| Issue readiness and completion | [`governance/readiness-and-done.md`](governance/readiness-and-done.md) | CANONICAL | #84 | contributor; AI agent | repository maintainer | Definition of Ready/Done | 2027-01-14 |
| Issue taxonomy | [`governance/labels.md`](governance/labels.md) | CANONICAL | #84/#90; `.github/labels.json` is executable catalog | contributor; AI agent | repository maintainer | label state machine or catalog | 2027-01-14 |
| ADR lifecycle | [`adr/README.md`](adr/README.md) | CANONICAL | #84 and governance policy | contributor; AI agent | repository maintainer | ADR lifecycle or template | 2027-01-14 |
| Product scope | [`product/canonical-mvp.md`](product/canonical-mvp.md) | CANONICAL | validated product decision #88; reconciled by #168 | product/business; contributor; AI agent | repository maintainer | approved user, scope or surface decision | 2027-01-14 |
| Target product direction | [`adr/0002-linux-desktop-offline-first.md`](adr/0002-linux-desktop-offline-first.md) | PROPOSAL | human decision by Pedro (2026-10-31); #168 | contributor; AI agent; operator/release; product/business; security | repository maintainer | maintainer ratification or desktop architecture decision | 2026-11-30 |
| Product positioning | [`product/2026-07-16-product-positioning-brief.md`](product/2026-07-16-product-positioning-brief.md) | ACTIVE_SUPPORTING | provisional decision #88 under #82 | product/business; contributor; AI agent | repository maintainer | research, naming, audience or claim decision | 2026-10-16 |
| Design-partner research | [`product/design-partner-research-protocol.md`](product/design-partner-research-protocol.md) | ACTIVE_SUPPORTING | research preparation #147 for discovery #104 | product/business; researcher; repository maintainer | repository maintainer | research question, population, collected field, consent, retention or decision rule | 2026-10-16 |
| Canonical runtime (implemented) | [`adr/0001-canonical-runtime.md`](adr/0001-canonical-runtime.md) | ACTIVE_SUPPORTING | provisional runtime decision #85 under #82; web direction superseded by Pedro's 2026-10-31 decision | contributor; AI agent; operator/release | repository maintainer | runtime, transport, persistence or release authority | 2027-01-14 |
| Operating modes and trust boundaries | [`security/2026-07-16-operating-modes-threat-model.md`](security/2026-07-16-operating-modes-threat-model.md) | ACTIVE_SUPPORTING | provisional security decision #87 under #82 | security; operator/release; contributor; AI agent | repository maintainer | auth, secret, deployment or supported-mode boundary | 2026-10-16 |
| Architecture navigation | [`architecture/README.md`](architecture/README.md) | ACTIVE_SUPPORTING | #85, #132 and #136 | contributor; AI agent | repository maintainer | architecture source, ADR or integration boundary | 2026-10-16 |
| Current architecture map | [`architecture/overview.md`](architecture/overview.md) | ACTIVE_SUPPORTING | derived from #85, #132, and reconciled by #168 | contributor; AI agent | repository maintainer | ADR, schema, router or auth boundary | 2027-01-14 |
| Supabase boundary | [`architecture/supabase/README.md`](architecture/supabase/README.md) | ACTIVE_SUPPORTING | #85, #87 and #136 | contributor; AI agent; security | repository maintainer | Supabase consumer, Prisma authority or runtime-support change | 2026-10-16 |
| MVP route/API contract | [`contracts/mvp-route-map.md`](contracts/mvp-route-map.md) | ACTIVE_SUPPORTING | executable API/routes reconciled by #132 | contributor; AI agent; operator/release | repository maintainer | route, payload, auth or repository contract | 2026-10-16 |
| MVP telemetry vocabulary | [`contracts/telemetry-event-map.md`](contracts/telemetry-event-map.md) | ACTIVE_SUPPORTING | current in-product event contract | product/business; security; contributor; AI agent | repository maintainer | event, transport, processor or retention | 2027-01-14 |
| Personal-data lifecycle | [`contracts/personal-data-lifecycle.md`](contracts/personal-data-lifecycle.md) | ACTIVE_SUPPORTING | #110 and executable web lifecycle | security; operator/release; contributor; AI agent | repository maintainer | personal data, export, deletion or processor | 2026-10-16 |
| Operations navigation | [`operations/README.md`](operations/README.md) | ACTIVE_SUPPORTING | #109, #111, #116 and #136 | operator/release; contributor; AI agent | repository maintainer | operational runbook or supported evidence lane | 2026-10-16 |
| Release verification | [`operations/release-verification-ladder.md`](operations/release-verification-ladder.md) | ACTIVE_SUPPORTING | #86; Web CI; protection applied in #100 | operator/release; contributor; AI agent | repository maintainer | required check, build, E2E or mode gate | 2026-10-16 |
| File-to-Prisma migration | [`operations/file-to-prisma-migration.md`](operations/file-to-prisma-migration.md) | ACTIVE_SUPPORTING | #109 and migration command/tests | operator/release; security; contributor; AI agent | repository maintainer | schema, migration CLI, ledger or drill | 2026-10-16 |
| Electron preservation/export | [`operations/electron-to-web-export.md`](operations/electron-to-web-export.md) | ACTIVE_SUPPORTING | #111; Electron remains experimental | operator/release; security; contributor; AI agent | repository maintainer | Electron schema, identity or export envelope | 2026-10-16 |
| Advisory tooling | [`operations/advisory-tooling.md`](operations/advisory-tooling.md) | ACTIVE_SUPPORTING | #116 and real package commands | contributor; AI agent; operator/release | repository maintainer | command, owner, evidence boundary or CI promotion | 2027-01-14 |
| Contributor setup | [`operations/setup-guide.md`](operations/setup-guide.md) | ACTIVE_SUPPORTING | package scripts and runtime decisions reconciled by #132 | contributor; AI agent | repository maintainer | runtime, quick-start, env or persistence | 2026-10-16 |
| Audit evidence navigation | [`audits/README.md`](audits/README.md) | ACTIVE_SUPPORTING | #89 and #133; dated snapshots remain evidence only | contributor; AI agent; operator/release; history | repository maintainer | audit addition, relocation, metadata correction or successor | 2027-01-14 |

Historical and audit material is indexed separately for provenance. It is not current implementation authority.

## Executable authority boundaries

- `.github/workflows/ci.yml` and `playwright.release.config.ts` define the two canonical web evidence lanes named in #100.
- `package.json#scripts` is the command registry. Commands prove only the behavior their owning lane declares.
- Prisma schema/migrations support the optional canonical web repository; [`architecture/supabase/README.md`](architecture/supabase/README.md) records the separate experimental/legacy Supabase consumers.
- Docker, Electron Playwright, broad Playwright and PWA artifacts are supporting/advisory evidence, not product support claims.
- GitHub settings applied by #100 are external state. The issue record is the authority; repository prose cannot prove that remote state remains unchanged.

## Active exceptions and provisional decisions

| Source | Scope and effect | Owner | Starts | Ends |
|---|---|---|---|---|
| [Recovery mandate #82](https://github.com/RenyEnnos/life-os/issues/82) | permits autonomous issue/PR/configuration execution, self-merge after evidence, and human review after execution; permanent secret/data/production limits remain | repository maintainer | explicit maintainer mandate | program completion, explicit revocation or a later human decision |
| [Linux desktop direction #168](https://github.com/Anakyklos/life-os/issues/168) | target product is Linux desktop offline-first; supersedes web-first strategic target; implementation choices pending | repository maintainer | human decision (2026-10-31) | maintainer ratification or superseding product decision |
| [Runtime decision #85](https://github.com/RenyEnnos/life-os/issues/85) | web/HTTP canonical for currently implemented codebase; web product direction superseded by #168; Electron experimental; PWA advisory; Android unsupported | repository maintainer | validated decision | superseding desktop implementation or mandate termination review |
| [Security decision #87](https://github.com/RenyEnnos/life-os/issues/87) | only local-dev supported; shared modes fail closed until their gates pass | repository maintainer | validated decision | superseding security decision or mandate termination review |
| [Product decision #88](https://github.com/RenyEnnos/life-os/issues/88) | narrow invite-only weekly loop and evidence-bounded claims | repository maintainer | validated decision | ratification, rejection or superseding product decision |
| [GitHub controls #100](https://github.com/RenyEnnos/life-os/issues/100) | PR + two canonical checks for non-bypass actors; admin bypass and zero approvals remain provisional under #82 | repository maintainer | verified configuration | remote reconfiguration or post-mandate governance review |

An exception applies only to its exact recorded scope. The default policy resumes automatically when the exception ends; an agent must not infer a replacement exception from tool access or prior behavior.

## Historical and migration inventory

- Dated evidence remains under [`audits/`](audits/README.md), is immutable, and never authorizes current implementation.
- Superseded desktop and broad-suite narratives remain searchable under [`archive/`](archive/README.md), outside the primary authority path.
- The obsolete MVP checklist and March planning records are preserved under [`archive/`](archive/README.md) and cannot authorize implementation.
- Completed agent plans/specs are preserved by verified issue/PR delivery under [`archive/deliveries/`](archive/deliveries/README.md) and cannot be executed as active instructions.
- Active product, architecture, contract and operations sources use the minimal taxonomy indexed above; #136 owns this path migration.
- Do not link historical plans or archive paths from Quick Start, Key Paths or issue templates as current authority.

## Conflict and update protocol

1. Identify the subject row and exact authority source.
2. Compare scope, state, active exception and update trigger—not filename recency.
3. Treat code/config as observed behavior unless the issue authorizes changing desired intent.
4. Stop on an equal- or higher-authority conflict and link it to the owning issue.
5. Update this index in the same PR whenever a path, state, owner, authority, exception or review date changes.

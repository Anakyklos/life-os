# Architecture Decision Records

Status: CANONICAL \
Authority: durable architecture decisions and ADR index \
Audience: contributor; AI agent \
Owner: repository maintainer \
Last reviewed: 2026-11-01 \
Review by: 2027-01-14 \
Update trigger: ADR addition, lifecycle change, or ADR template revision \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no

## Purpose

ADRs record decisions that are costly to reverse. They explain context and trade-offs; they do not replace implementation issues.

## Lifecycle

- `proposed` — drafted for discussion;
- `provisional` — active, reversible decision made under an explicit autonomous mandate; requires later maintainer ratification, rejection, or replacement;
- `accepted` — approved by the maintainer;
- `rejected` — considered and declined;
- `superseded` — replaced by another ADR;
- `deprecated` — no longer recommended but not yet removed.

Only a human maintainer may mark an ADR accepted.

A provisional ADR may direct ongoing recovery work only when an explicit maintainer mandate authorizes provisional decisions. It must name its rollback trigger and may not represent itself as human-ratified.

## ADR Index

| ADR | Title | State | Authority | Scope |
|---|---|---|---|---|
| [`0001`](0001-canonical-runtime.md) | Canonical runtime and release evidence | ACTIVE_SUPPORTING (`provisional`) | #85 under #82 | Documents the web/Express implementation and advisory Electron code currently in the repo; web-first direction superseded by Pedro's 2026-10-31 decision. |
| [`0002`](0002-linux-desktop-offline-first.md) | Linux desktop offline-first product direction | PROPOSAL (`proposed`) | Human decision by Pedro (2026-10-31); #168 under #82; later decisions #172, #174-#176 | Establishes Linux desktop offline-first as the product target; #175's architecture is recorded in ADR-0005, while #176's delegated technical selections remain provisional. |
| [`0003`](0003-linux-desktop-local-identity.md) | Offline local identity model | CANONICAL (`accepted`) | Human approval by Pedro (2026-10-31), recorded by #172 | Accepted only for the identity model in #172; cross-references the isolated transition #174, target architecture #175 and provisional technical selection #176 without expanding accepted scope or claiming implementation. |
| [`0004`](0004-linux-context-isolation.md) | Isolated Linux data context | CANONICAL (`accepted`) | Human decision by Pedro (2026-11-01), recorded by #174 | Accepted only for starting a new isolated context and preserving history by default; separate from #172 identity, #175 target architecture and provisional #176 selections. No implementation or Linux validation is claimed. |
| [`0005`](0005-linux-tauri-rust-architecture.md) | Tauri 2 + React/TypeScript + Rust Linux target architecture | CANONICAL (`accepted`, narrow scope) | Explicit human approval by Pedro (2026-11-01); #175 | Accepts only Tauri 2 host, React/TypeScript interface, Rust local core, incremental reversible migration, and essential offline operation. It does not accept #176's technical selections or authorize implementation. |

## Naming

Use:

`NNNN-short-kebab-title.md`

Example:

`0001-canonical-runtime.md`

## Template

```markdown
# ADR-NNNN: Title

Status: proposed
Date: YYYY-MM-DD
Decision owner: repository maintainer
Related issues:
Supersedes:
Superseded by:

## Context

Observed facts, constraints, and the decision that must be made.

## Decision drivers

- driver
- driver

## Options considered

### Option A

Benefits, costs, risks, and evidence.

### Option B

Benefits, costs, risks, and evidence.

## Decision

Human-approved choice. Leave unresolved while status is proposed.

## Consequences

### Positive

### Negative

### Risks

## Migration and rollback

Steps, data compatibility, rollback trigger, and verification.

## Validation

Evidence required to confirm the decision works.
```

## Required ADR topics during recovery

The recovery program currently requires decisions for runtime/release, persistence, authentication/authorization, and any retained multi-runtime strategy.

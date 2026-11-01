# AGENTS.md

Status: CANONICAL \
Authority: repository-wide operating rules for AI agents \
Audience: contributor; AI agent \
Owner: repository maintainer \
Last reviewed: 2026-10-31 \
Review by: 2027-01-14 \
Update trigger: agent authority, issue authorization, validation or active exception changes \
Supersedes: none \
Superseded by: none \
Authorizes implementation: no \
Related: issues #82, #84, #85, #88, #89, #91, #100, #131, #168; ADR-0001, ADR-0002

## Purpose

This file defines how AI agents may work in the LifeOS repository. It is intentionally short. Read the current authority, lifecycle, and active-exception index in `docs/README.md`; detailed rules live in `docs/governance/`.

## Current freeze

LifeOS is under product, architecture, security, documentation, and debloat review.

Unless a human-approved decision, ready implementation issue, or exact active exception indexed in `docs/README.md` says otherwise, agents must not:

- treat legacy code or the newest code as the desired architecture;
- add features or dependencies;
- perform broad rewrites, migrations, renames, or cleanup;
- remove code only because it appears unused;
- turn proposals, old PRDs, comments, or historical plans into requirements;
- begin a second issue after completing the assigned one.

Target product and runtime rules:
- **Product direction (DECIDED):** On 2026-10-31, repository maintainer Pedro decided that LifeOS will cease to be developed as a web product and will become a Linux desktop application, offline-first (issue #168; proposal `docs/adr/0002-linux-desktop-offline-first.md`). Agents must not advance or evolve LifeOS as a web-first or cloud-hosted product.
- **Implemented codebase (IMPLEMENTED):** The codebase currently implemented in the repository remains the React + Express web application and experimental Electron code governed by `docs/adr/0001-canonical-runtime.md`.
- **Architectural choices (PENDING):** Desktop framework, local persistence, IPC, and Linux packaging are pending technical selection and maintainer approval.
- Agents must not remove non-canonical runtimes, rewrite code, or claim Linux desktop support without an explicit ready implementation issue and verified evidence.

## Authority order

When sources conflict, use this order:

1. explicit human decision recorded in an issue or PR;
2. approved ADR;
3. implementation issue marked ready;
4. canonical product and contract documentation;
5. applicable tests and schemas;
6. current code;
7. comments, historical plans, generated summaries, and agent inference.

A conflict between higher-authority sources is a stop condition. Report it; do not resolve it silently.

## Required execution contract

Every agent must:

1. read the assigned issue and linked decisions;
2. restate the objective, scope, exclusions, and stop conditions;
3. inspect relevant files before editing;
4. identify contradictions, risks, and unknowns;
5. propose a short plan and expected file list;
6. keep the diff limited to the issue;
7. add or update tests for behavior changes;
8. run applicable validation;
9. report commands, results, limitations, and unperformed work;
10. stop when the issue is complete.

## Issue authorization

Only an issue labeled `status:ready` and satisfying the Definition of Ready may authorize implementation.

These issue types never authorize product code by themselves:

- `type:tracking`
- `type:audit`
- `type:decision`
- `type:governance` when explicitly documentary
- research or discovery issues

## Permanent prohibitions

Agents must not:

- commit secrets, credentials, personal data, or production tokens;
- disable tests or weaken assertions merely to obtain a green check;
- add silent fallbacks that hide infrastructure failure;
- claim support, security, compatibility, performance, or readiness without evidence;
- mix feature work with unrelated refactoring;
- add abstractions for hypothetical future use;
- install dependencies without an approved dependency assessment;
- change snapshots without explaining the user-visible behavior;
- modify generated or lock files unless the issue requires it;
- merge their own PR unless explicitly authorized by the maintainer.

## Validation baseline

Use only commands that exist in `package.json` and apply to the changed scope. Do not copy commands from historical documentation.

Minimum expectations for code changes normally include:

- `npm run typecheck`
- `npm run lint`
- relevant tests
- `npm run build`

Runtime-specific checks are governed by the active runtime ADRs. Canonical merge evidence for the current codebase is `web / static-and-unit` plus `web / canonical-e2e`; Electron smoke remains advisory and neither runtime's evidence proves the other. Web check runs do not constitute evidence of Linux desktop or offline-first support.

## Detailed governance

Read:

- `docs/README.md`
- `docs/governance/README.md`
- `docs/governance/agent-protocol.md`
- `docs/governance/readiness-and-done.md`
- `docs/governance/policies.md`
- `docs/governance/labels.md`
- `docs/adr/README.md`

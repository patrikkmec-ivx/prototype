---
id: CORE-SYNC-STANDARD
title: Domain ↔ Core Sync API Standard (Care Plans first)
collection: core
area: tech
type: spec
owner: patrik
status: draft-for-approval
version: 0.1
created: 2026-07-21
updated: 2026-07-21
review_due: 2026-10-21
tags: [sync, api, care-plans, fhir, events, milestone, timeline]
related: [CORE-TECH-CLINICAL-CORE, CORE-MAP-CAREPLAN-PATHWAY, CP-TECH-STANDARD]
iso_controls: [A.8.1]
classification: Dôverné — interné
---

# Domain ↔ Core Sync API Standard v0.1 (Care Plans first)

> **Authority: NORMATIVE.** Instantiates Core E3. Defines how a domain microservice with its
> own database (Care Plans first) communicates with the Clinical Core. RFC 2119 keywords.
> On conflict: CORE-TECH-CLINICAL-CORE wins.

## S1. Boundary
**Requirements:** The domain owns its **protocol database** (running-plan orchestration,
step states, domain UI state). The Core owns **clinical truth**. The Core MUST NEVER read
the domain database; the domain MUST NEVER access the Core store except via the regional
FHIR R4 REST API. No message bus, no shared tables, no GitHub at runtime (D2).

## S2. Write path (domain → Core)
**Requirements:** Every clinical fact originated in the domain (observation, condition
change, medication event, document-worthy content) MUST be written to the Core via the C1
producer contract with `Provenance.agent` = the domain service and the acting practitioner,
`entity.source = careplan`. Writes MUST be idempotent (client-generated idempotency key)
and replayable per C7. A fact that exists only in the domain database is a conformance
violation (SYNC-01).

## S3. Timeline events and the milestone flag
**Requirements:** The domain emits timeline events as Core resources; an event intended for
the **patient pathway** carries `milestone: true` and a milestone class from the M3 taxonomy
(core-11) or from the domain pack's declared extension set. Flagging outside the declared
set is rejected in CI (SYNC-03). Unflagged events surface on the encounter/plan level only —
the pathway never shows plan internals (MAP-01).

## S4. Version pinning
**Requirements:** A running `CarePlan` MUST record `instantiatesCanonical` including the
PlanDefinition **version** it was started on (D7 pinning). Version upgrade of a running plan
is an explicit clinician action written as a new event with both versions in `Provenance`.

## S5. Read path (Core → domain)
**Requirements:** The domain reads the patient compartment through the FHIR API scoped by
tenant, role and purpose-of-use (H5). Reads are audited (H2). The domain MAY cache reads
with TTL; caches obey erasure cascade (H6c).

## S6. Renders
**Requirements:** Documents are produced by `@hilbi/summary-engine` in-process (D3) from
Core resources — the domain never composes clinical documents from its own database.

## S-CONF Conformance
SYNC-01: no clinical fact persists only in the domain DB. SYNC-02: every timeline event
resolves to a Core resource (MAP-01 click-through). SYNC-03: `milestone: true` only on
pack-declared classes. SYNC-04: every running CarePlan carries pinned version; upgrades
audited. SYNC-05: domain functions with Core temporarily unreachable (C7 queue) and
reconciles on replay.

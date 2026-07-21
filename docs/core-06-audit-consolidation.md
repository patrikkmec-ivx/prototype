---
id: CORE-AUDIT-CONSOLIDATION
title: Cross-Region Audit Consolidation — Inputs to core-01 v0.10
collection: core
area: audit
type: review
owner: patrik
status: final
version: 1.0
created: 2026-07-21
related: [CORE-AUDIT-US, CORE-AUDIT-EU, CORE-AUDIT-IN]
classification: Dôverné — interné
---

# Cross-Region Audit Consolidation

Three independent audits (US / EU / India) against `core-01` v0.9. Severity totals:
**7 Critical** (US 2, EU 3, IN 2), **11 Major**, remainder Minor/Observation. None challenges
the core thesis — the FHIR-native two-layer model + region packs held. Every finding is a
**boundary / governance** addition, exactly as G1 promises.

## Convergent findings — all three regions point at the same gaps

| Theme | US | EU | IN | Proposed core-01 v0.10 clause (additive, via K35) |
|---|---|---|---|---|
| Consent lifecycle | US-05 | EU-05 | IN-02 | Purpose-of-use checked at read against active `Consent`; packs bind (DS4P / EHDS permit / ABDM artefact); revocation halts flows + audit. |
| Identity & matching | US-06 | national ID | IN-07 | Per-region identifier policy + duplicate merge (`Patient` link/merge + Provenance). |
| Signature model | US-01 | EU-03 | — | Signature level per doc class (AdES/QES), stored as `Provenance.signature`, practitioner-bound. |
| Erasure vs immutable | US-07 | EU-02 | IN-02 | Erasure/restriction design: legal-hold adjudication, tombstones, crypto-shred `Binary`, cascade + backups. **v1.0 gate.** |
| Region pack >= terminology | US-01/03/04 | EU-01/04 | IN-01/05 | Rewrite G1: pack = profiles + terminology + role/exchange adapters + access APIs. |
| Notes dual-expose | US-03 | EEHRxF | IN-03 | Finalized `Composition` also exposed as region doc type (US Core DocumentReference / ABDM record / EEHRxF). |
| Offline resilience | — | — | IN-04 | Producers tolerate intermittent connectivity (idempotent queue + replay preserving Provenance). |

## Region-specific criticals (own packs, not core)

- US: SMART on FHIR patient access + information-blocking (US-01/02); NCPDP eRx (US-04).
- EU: national sub-packs gematik/ISiK, ezdravie (EU-01); EHDS manufacturer + EEHRxF 5 categories (EU-04); AI Act/MDR qualification of IQ predictions (EU-06).
- IN: ABDM HIP/HIU role module + Gateway certification (IN-01); NHCX claims (IN-05).

## Recommended action

1. core-01 v0.10 — add the 7 convergent clauses (additive). EU-02 erasure is the only v1.0 gate.
2. Three region-pack scope docs (core-07-pack-us/-eu/-in) — enumerate region criticals as pack requirements.
3. Route to Roman (business) + Marek (compliance).

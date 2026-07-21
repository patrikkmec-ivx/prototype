---
id: CORE-PACK-IN
title: India Region Pack — ABDM Role Architecture, Scope & Service Boundaries
collection: core
area: tech
type: spec
owner: patrik
status: draft-for-approval
version: 0.1
created: 2026-07-21
updated: 2026-07-21
review_due: 2026-10-21
tags: [region-pack, india, abdm, abha, hip, hiu, dpdp, nhcx, nrces]
related: [CORE-TECH-CLINICAL-CORE, CORE-AUDIT-IN, CORE-AUDIT-CONSOLIDATION]
iso_controls: [A.8.1, A.5.12]
classification: Dôverné — interné
---

# India Region Pack — Scope & Service Boundaries v0.1

> **Authority: NORMATIVE** for the India region pack. Derives from CORE-TECH-CLINICAL-CORE
> v0.10; on conflict the Core Standard wins. RFC 2119 keywords. Closes region-specific
> findings of CORE-AUDIT-IN.
> **Deployment mode (A6/O9): PRIMARY.** No external EHR exists beneath Hilbi; the Core is the
> clinician's system of record and carries the full regional burden. Operated by HHI on the
> India data plane (Core G2).
> **Thesis check:** NRCeS national profiles are FHIR R4 — the canonical model needs the least
> adaptation of the three regions. The work is the **ABDM role machinery**, not the model.

---

## P1. Position — ABDM participant, Data Fiduciary under DPDP

**Description:** ABDM is a consent-driven federated exchange (Gateway + Consent Manager),
not open REST (IN-01). Hilbi participates as **HIP** (Health Information Provider — records
we originate) and **HIU** (Health Information User — records we fetch on consent). Under the
DPDP Act 2023 + DPDP Rules 2025 (notified 2025-11, phasing into 2027), HHI is a Data
Fiduciary and — at health-data scale — presumptively a **Significant Data Fiduciary (SDF)**.
**Requirements:** HIP and HIU roles MUST be implemented as pack microservices (P2); ABDM
milestone certification **M1 → M2 → M3** is release-gating for India production.

## P2. `pack-in-abdm-role` — HIP + HIU role module

**Description:** The Gateway client implementing both roles (IN-01).
**Requirements:** MUST implement: ABHA-verified care-context linking (deterministic identity
per Core B5 — no probabilistic matching where ABHA exists, IN-07); consent-artefact
validation before any data flow; **encrypted data-on-demand push** semantics (HIP serves
bundles on valid consent; HIU requests via Consent Manager — never open pull); Gateway
callback handling with idempotency (pairs with Core C7 replay). `preliminary` resources MUST
Not enter any outbound bundle (E-CONF-02 applies at the exchange boundary).

## P3. `pack-in-consent` — Consent Manager & DPDP binding

**Description:** Regional instantiation of Core H5 (IN-02).
**Requirements:** ABDM consent artefacts map to `Consent` with purpose, scope (care contexts,
record types, date range) and validity window; purpose-of-use is checked at read (H5).
**Revocation MUST halt HIU flows immediately** and deny subsequent reads, audited
(E-CONF-07). DPDP consent notices (plain-language, itemized) are served at grant; consent
records retained per DPDP Rules.

## P4. `pack-in-records` — ABDM record-type exposure

**Description:** D6 dual-expose in ABDM form (IN-03).
**Requirements:** Normative mapping, CI-tested (E-CONF-08):

| Hilbi Composition profile | ABDM record type |
|---|---|
| dekurz.soap (ambulatory note) | `OPConsultRecord` |
| report.discharge | `DischargeSummaryRecord` |
| eRX prescription render | `Prescription` |
| lab/diagnostic report | `DiagnosticReportRecord` |
| Immunization render | `ImmunizationRecord` |
| Life ID summary | `WellnessRecord` |
| scanned/uploaded document | `HealthDocumentRecord` |

## P5. `pack-in-nhcx` — claims adapter

**Description:** India's claims exchange (NHCX) is FHIR-based; commercial differentiator
(IN-05).
**Requirements:** Claim/ClaimResponse are generated from the same D5 coded sections that
drive billing gating — no separate coding pass. Optional per customer; not release-gating.

## P6. `pack-in-dpdp` — SDF obligations service

**Description:** DPDP Rules 2025 operational duties for a Significant Data Fiduciary.
**Requirements:** (a) DPO resident in India (HHI), contact surfaced in product;
(b) annual DPIA + independent audit cycle, evidence packaged from E-CONF/H2 runs
(auto-documentation); (c) **algorithmic due diligence**: IQ deployment in India is gated on
a documented assessment that algorithms do not risk data-principal rights — binds Core C4
gate + O8 outcome; (d) breach workflow: notify the Data Protection Board and affected data
principals within **72 h**, template + drill owned by Marek; (e) erasure at purpose-end and
retention defaults per DPDP Rules feed the H6 matrix (O6).

## P7. Offline profile (C7 mandatory)

**Requirements:** Core C7 resilience is MANDATORY in India (IN-04): producer clients queue
writes with idempotency keys, replay preserves clinical time in `Provenance`; read surfaces
use cacheable projections. Field-ops acceptance test: full dekurz authoring cycle on
intermittent connectivity.

## P8. Pack parameters (Core G3)

| Parameter | India value |
|---|---|
| Deployment mode (A6) | primary |
| Identifier policy (B5) | ABHA verified, deterministic linking; local MRN secondary |
| Signature level (C6) | practitioner e-signature bound to Hilbi ID; national escalation TBD (O7) |
| Retention / erasure (H6) | DPDP purpose-end erasure + Rules retention defaults; matrix owner Marek (O6) |
| `preliminary` SLA (B4) | SHOULD; exchange boundary hard-gated (P2) |
| Terminology | SNOMED CT free (member country) — O4 trivial for IN (IN-08) |
| Languages | narrative = render parameter (Core D1); rollout list per market plan (IN-06) |

## P9. Conformance (pack-level)

**Requirements:** PACK-IN-01: no outbound bundle without a valid, unexpired consent artefact
(P2/P3). PACK-IN-02: revocation halts an in-flight HIU flow within the ABDM-mandated window,
audited (E-CONF-07). PACK-IN-03: every `final` Composition maps to an ABDM record type (P4,
E-CONF-08). PACK-IN-04: offline authoring cycle passes the field-ops test (P7). PACK-IN-05:
M1–M3 certification evidence archived in the conformity harness.

## Findings closure map

| Audit finding | Closed by |
|---|---|
| IN-01 ABDM role module | P1/P2 |
| IN-02 DPDP consent lifecycle | P3 + Core H5 |
| IN-03 record-type mapping | P4 |
| IN-04 offline resilience | Core C7 + P7 |
| IN-05 NHCX claims | P5 |
| IN-06 multilingual | Core D1/D17 + P8 |
| IN-07 ABHA identity | Core B5 + P8 |
| IN-08 SNOMED free | P8 (O4 reprioritized to SK/US) |
| IN-09 store economics | O1 (Juraj) — per-plane choice permitted by Core B1 |
| IN-10 Co-WIN import | Core C5 + B2 `Immunization` (validated example) |

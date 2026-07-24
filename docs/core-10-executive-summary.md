---
id: CORE-EXEC-SUMMARY
title: Clinical Core — Executive Summary for Sign-off (Roman · Marek)
collection: core
area: ops
type: brief
owner: patrik
status: for-circulation
version: 1.0
created: 2026-07-21
related: [CORE-TECH-CLINICAL-CORE, CORE-PACK-US, CORE-PACK-EU, CORE-PACK-IN, CORE-AUDIT-CONSOLIDATION]
classification: Confidential — internal
---

# Clinical Core — executive summary for sign-off

**To:** Roman (business) · Marek (compliance) · **From:** Patrik · **Date:** 2026-07-21
**Canonical documents (GitHub `docs/`):** core-01 v0.10 (normative standard) · core-02 v2
(diagram) · core-03/04/05 (independent US/EU/IN audits) · core-06 (consolidation) ·
core-07/08/09 (region packs).

## What has been decided

The progress-note engine from SM+ is promoted to a **platform Clinical Core**: a FHIR R4
store as the single clinical truth, documents (progress notes, reports) are only
renders, domains (SM+ and others) are data packs, regions adapt at the boundary through
packs — the canonical model is never forked.

**Position (A6):** Hilbi is an orchestrator, not a competitor to Epic. Two modes per
market: **companion** (we run on top of a certified EHR; the clinical truth held by us
is only care plans plus engagement, the rest is written back to the master EHR) and
**primary** (we are the physician's system of record — there we carry the full regional
burden). Certification capabilities are separate BE microservices inside the packs,
never in the core.

## Audit outcome

Three independent audits (US / EU / India): 7 critical findings, **none of which
challenged the core** — all are boundary or governance additions. Seven convergent
clauses are incorporated in v0.10 (additive, K35). The single v1.0 design gate (GDPR
erasure versus an immutable store) is closed by clause H6.

## What I am asking to approve

| # | Decision | Who |
|---|---|---|
| 1 | core-01 v0.10 → `active` v1.0 (conditional on items 2–4) | Roman + Marek |
| 2 | Deployment modes per market (O9): US = companion · India = primary · EU = per member state (SK outpatient clinics primary) | Roman |
| 3 | Ownership of open items: O2+O6 retention and erasure matrix, O7 signature matrix, O8 MDR/AI Act qualification of IQ predictions — Marek; O1 store selection — Juraj; O5 `sm_*` migration — Viktor | Marek confirms capacity |
| 4 | Region packs core-07/08/09 as the binding scope of the BE microservices (the basis of the dev plan) | Roman |

## Risks and deadlines that need to be seen

- **EHDS (EU):** we are an EHR system manufacturer; first-wave obligations from
  26 March 2029, EEHRxF implementing acts by 26 March 2027 — the architecture is ready
  and tracked through K35.
- **India:** the DPDP Rules 2025 are already in force (phased to 2027); HHI is almost
  certainly a Significant Data Fiduciary → a DPO in India, an annual audit, and
  algorithmic due diligence for IQ.
- **US:** no ONC certification (companion) — the critical condition is A6 discipline:
  no clinical truth outside the care-plan scope without write-back.
- **IQ predictions:** until Marek closes O8 they remain `preliminary`, labelled and
  non-prescriptive.

## Next step after approval

Tag v1.0 → a microservice dev plan derived from core-07/08/09 (Dominika splits it,
Viktor leads) → connecting the Care Plans domain and the patient pathway from the
cockpit to the Core (a mapping document, not a new architecture).

---
id: CORE-AUDIT-US
title: Independent Audit — US Perspective (Clinical Core Standard v0.9)
collection: core
area: audit
type: review
owner: patrik
status: final
version: 1.0
created: 2026-07-21
audited_document: CORE-TECH-CLINICAL-CORE v0.9
classification: Dôverné — interné
---

# Independent Audit — United States

**Audited artifact:** `core-01-tech-clinical-core-standard.md` v0.9 (draft-for-approval)
**Audit perspective:** CMIO / interoperability office of a large US academic medical center,
HIMSS EMRAM Stage 7, ONC-certified EHR environment, TEFCA participant. Class exemplars of this
profile: Mayo Clinic, Cleveland Clinic, UCSF Health. *(Independent expert review authored
against that profile; not issued by any named institution.)*
**Scope:** conformance of the Standard with US regulatory + interoperability reality
(HIPAA, 21st Century Cures Act / information blocking, ONC §170.315(g)(10), US Core/USCDI,
TEFCA, NCPDP, 42 CFR Part 2), and operational fitness for a US health system.
**Method:** clause-by-clause review; findings rated **Critical / Major / Minor / Observation**.

---

## Verdict

**Conditionally sound.** The FHIR-R4-native, two-layer architecture is exactly the direction
US leaders have converged on, and the region-pack approach (G1) is credible. However, the
Standard currently treats the US pack as a profile/terminology exercise, while several US
obligations are **behavioral** (patient access, information blocking, e-prescribing rails,
sensitive-data segmentation). Four findings are blocking for a US deployment.

---

## Findings

### US-01 · CRITICAL — Patient Access API & SMART on FHIR are absent
**Clauses:** G1, B1, E1.
The Standard defines the FHIR API as an internal contract. In the US, a certified Patient
Access API (§170.315(g)(10)) with **SMART App Launch / OAuth2 scopes** is a market-entry
requirement, and refusing or delaying access is **information blocking** under the Cures Act.
**Required:** G1 US pack MUST include a certified patient/third-party access capability
(SMART on FHIR, US Core queries, bulk FHIR `$export`), and Part H MUST add an information-
blocking clause: data classified `final` MUST be available to the patient without delay.

### US-02 · CRITICAL — Quarantine (B4) can collide with information blocking
**Clauses:** B4, C4.
Excluding `preliminary` from renders is correct. But the Standard lets AI/OCR content remain
`preliminary` indefinitely (C4). If clinically used content sits unvalidated and therefore
invisible to the patient, that pattern has been treated as blocking in OCR/lab contexts.
**Required:** define a **maximum residence time in `preliminary`** for content that has been
clinically relied upon, plus an escalation queue (your "To verify" inbox) with SLA.

### US-03 · MAJOR — Clinical notes mapping conflicts with US Core
**Clauses:** B2, D4.
US Core exchanges clinical notes as `DocumentReference` (note classes per USCDI), not
`Composition`. B2 maps the dekurz to `Composition` only.
**Required:** the render pipeline MUST dual-expose every finalized Composition as a US Core
`DocumentReference` (note class coded) in the US pack. This is a pack behavior, not a model
fork — compatible with G1, but must be stated normatively.

### US-04 · MAJOR — e-Prescribing is not FHIR in the US
**Clauses:** B2 (MedicationRequest), C1.
US eRx runs on **NCPDP SCRIPT** (plus EPCS for controlled substances and state PDMP checks).
`MedicationRequest` is the canonical home, fine — but the Standard implies FHIR end-to-end.
**Required:** G1 US pack MUST name an NCPDP SCRIPT adapter + EPCS/PDMP hooks as boundary
adapters; otherwise the prescription flow (your eRX surface) is not deployable in the US.

### US-05 · MAJOR — Sensitive-data segmentation (42 CFR Part 2) underspecified
**Clauses:** H1.
`meta.security` data-class tags exist, but Part 2 (substance-use disorder records) requires
consent-bound segmentation and redisclosure prohibition — sentence-level behavior, not just a
tag.
**Required:** define a sensitivity label vocabulary (HL7 DS4P) and require renderers (D3/D4)
to honor labels when composing documents (a Composition MUST NOT include Part-2 content
without the matching Consent).

### US-06 · MAJOR — Patient identity & matching strategy missing
**Clauses:** B1, G1.
No national identifier exists in the US; MPI/matching is the #1 operational failure mode in
multi-source ingestion (your producers C1–C5).
**Required:** add a normative identity clause: per-region identifier policy, matching
methodology, and duplicate-merge workflow (`Patient` link/merge with Provenance).

### US-07 · MINOR — HIPAA amendment right vs additive-only history
**Clauses:** B3.
HIPAA grants patients the right to request amendment. `amended` status exists but the
patient-initiated workflow (request → adjudication → amendment or denial letter) is absent.
**Required:** reference an amendment workflow in Part H; keep additive mechanics.

### US-08 · MINOR — Accounting of disclosures
**Clauses:** H2.
`AuditEvent` covers writes; HIPAA accounting of disclosures needs **read/export** audit with
recipient identity, queryable per patient. Make read-audit explicit.

### US-09 · OBSERVATION — TEFCA/QHIN posture
Not required for launch, but US leaders will ask on day one. Recommend a G1 note: US pack
roadmap includes QHIN connectivity (IHE/FHIR facade) — architecture already permits it.

### US-10 · OBSERVATION — CPT licensing for billing hooks
**Clauses:** D5, O4.
US billing implies CPT/HCPCS (AMA license). Extend O4 beyond SNOMED to CPT.

---

## Summary table

| # | Severity | Area | Blocking for US launch |
|---|---|---|---|
| US-01 | Critical | Patient access / SMART | Yes |
| US-02 | Critical | Quarantine vs info blocking | Yes |
| US-03 | Major | Notes as DocumentReference | Yes |
| US-04 | Major | NCPDP eRx rails | Yes (for eRX) |
| US-05 | Major | Part 2 segmentation | For behavioral-health data |
| US-06 | Major | Identity/matching | Yes |
| US-07 | Minor | Amendment workflow | No |
| US-08 | Minor | Disclosure accounting | No |
| US-09 | Obs. | TEFCA | No |
| US-10 | Obs. | CPT license | No |

**Positive note:** A3 (renders never create facts), C4 (AI review gate) and E-CONF-05 are
stronger than what most US incumbents enforce today; keep them untouched.

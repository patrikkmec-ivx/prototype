---
id: CORE-AUDIT-IN
title: Independent Audit — India Perspective (Clinical Core Standard v0.9)
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

# Independent Audit — India

**Audited artifact:** `core-01-tech-clinical-core-standard.md` v0.9 (draft-for-approval)
**Audit perspective:** digital-health leadership of a top private hospital network with deep
ABDM integration (HIP/HIU live, ABHA-linked records at scale), NABH-accredited. Class
exemplars: Apollo Hospitals, Max Healthcare, AIIMS digital program. *(Independent expert
review authored against that profile; not issued by any named institution.)*
**Scope:** ABDM architecture (ABHA, HIP/HIU, Consent Manager, Gateway), NRCeS FHIR profiles,
DPDP Act 2023, NHCX claims, Indian operational reality (connectivity, languages, scale, cost).
**Method:** clause-by-clause; findings rated **Critical / Major / Minor / Observation**.

---

## Verdict

**Strong canonical core; the India pack is underestimated.** India's national profiles are
FHIR R4, so B2 lands closer to ABDM than the US/EU packs land to theirs. The gap is
architectural: **ABDM is a consent-driven federated exchange, not a REST integration** — the
"adapters" framing (G1) does not capture HIP/HIU/Consent-Manager machinery, and DPDP consent
lifecycle needs first-class treatment. Two blocking findings.

## Findings

### IN-01 · CRITICAL — ABDM is a role architecture, not an adapter
**Clauses:** G1, E1. To operate in ABDM the platform must implement **HIP** and **HIU** roles
against the ABDM Gateway: care-context linking to **ABHA**, consent-artefact validation,
encrypted data-on-demand flows (push over consent, not open REST), milestone certification
(M1/M2/M3). **Required:** India pack in G1 = an **ABDM role module** (HIP+HIU+ABHA+Gateway
client), not a terminology layer. Canonical model untouched.

### IN-02 · CRITICAL — DPDP consent lifecycle must be first-class
**Clauses:** B2 (Consent), H1, H3. DPDP Act 2023 makes Hilbi a **Data Fiduciary**; consent via
Consent Managers has validity/purpose/revocation. The Standard maps `Consent` but defines no
lifecycle: grant → purpose-bound access → expiry → revocation → cascade → breach notification.
**Required:** consent-lifecycle clause (core: purpose-of-use checked at read against active
Consent; India pack binds ABDM artefacts). Revocation MUST halt HIU flows immediately, audited.

### IN-03 · MAJOR — ABDM record types must map to D4 profiles
**Clauses:** B2, D4. ABDM exchanges `OPConsultRecord`, `DischargeSummaryRecord`, `Prescription`,
`DiagnosticReportRecord`, `ImmunizationRecord`, `WellnessRecord`, `HealthDocumentRecord`.
**Required:** India pack normative map Composition ↔ ABDM record type (dekurz→OPConsultRecord,
report.discharge→DischargeSummaryRecord, Life ID→WellnessRecord), CI-tested (E-CONF-05).

### IN-04 · MAJOR — Offline-first / low-bandwidth resilience absent
**Clauses:** B1, F1, D3. Tier-2/3 connectivity is a fact; synchronous FHIR REST per read/save
fails in the field. **Required:** resilience clause — local queue for C1 writes with
idempotency keys, replay preserving Provenance timestamps, cacheable read projections.
Platform-wide property, benefits all regions.

### IN-05 · MAJOR — NHCX claims rail for billing hooks
**Clauses:** D5. India's claims exchange (NHCX) is FHIR-based; D5 billing gate → NHCX adapter
(Claim/ClaimResponse) from the same coded sections. Reuse of D5, commercial differentiator.

### IN-06 · MINOR — Multilingual narrative render (22 languages; narrative = render param).
### IN-07 · MINOR — ABHA into the identity clause (verified linking, not probabilistic).
### IN-08 · OBSERVATION — SNOMED CT free in India (O4 trivial for IN; prioritize SK/US).
### IN-09 · OBSERVATION — Store economics per-plane at 10^7 patients (B1 permits per-plane).
### IN-10 · OBSERVATION — Co-WIN import via `Immunization` + C5 (validated example).

## Summary table

| # | Severity | Area | Blocking for IN launch |
|---|---|---|---|
| IN-01 | Critical | ABDM HIP/HIU role module | Yes |
| IN-02 | Critical | DPDP/consent lifecycle | Yes |
| IN-03 | Major | ABDM record-type mapping | Yes (exchange) |
| IN-04 | Major | Offline resilience | Field-ops gate |
| IN-05 | Major | NHCX claims | No (commercial) |
| IN-06 | Minor | Multilingual render | No |
| IN-07 | Minor | ABHA identity | With identity clause |
| IN-08 | Obs. | SNOMED free | No |
| IN-09 | Obs. | Store economics | With O1 |
| IN-10 | Obs. | Co-WIN example | No |

**Positive note:** Because NRCeS profiles are FHIR R4, the canonical model (B2) requires the
**least** adaptation of the three regions — the "gold standard" thesis holds best in India,
provided the ABDM role machinery (IN-01) is treated as architecture, not integration.

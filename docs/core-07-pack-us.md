---
id: CORE-PACK-US
title: US Region Pack — Scope & Service Boundaries
collection: core
area: tech
type: spec
owner: patrik
status: draft-for-approval
version: 0.1
created: 2026-07-21
updated: 2026-07-21
review_due: 2026-10-21
tags: [region-pack, us, smart-on-fhir, ncpdp, us-core, uscdi, hipaa]
related: [CORE-TECH-CLINICAL-CORE, CORE-AUDIT-US, CORE-AUDIT-CONSOLIDATION]
iso_controls: [A.8.1, A.5.12]
classification: Dôverné — interné
---

# US Region Pack — Scope & Service Boundaries v0.1

> **Authority: NORMATIVE** for the US region pack. Derives from CORE-TECH-CLINICAL-CORE
> v0.10 (the "Core Standard"); on conflict the Core Standard wins. Requirement keywords per
> RFC 2119. Closes region-specific findings of CORE-AUDIT-US.
> **Deployment mode (A6/O9): COMPANION.** Hilbi runs on top of the customer's certified EHR.

---

## P1. Position — companion, not certified module

**Description:** In the US, Hilbi is a SMART on FHIR application over the customer's
ONC-certified EHR (Epic, athenahealth, Oracle Health, …). The external EHR remains the system
of record for encounter documentation. Hilbi does **not** pursue ONC Health IT Certification.
**Requirements:** Hilbi-originated clinical truth in the US MUST be limited to the care-plan
and patient-engagement scope (Core A6). All other clinical writes MUST flow back to the master
EHR (P3). Baseline interoperability targets are pinned: **US Core STU 6.1.0 / USCDI v3**
(the ONC certification baseline the host EHRs implement as of 2026-01-01); version upgrades
follow the host-EHR ecosystem via K35.
**Explicitly out of pack scope:** ONC §170.315 certification of any Hilbi module; TEFCA/QHIN
connectivity (roadmap observation US-09, architecture already permits an IHE/FHIR facade).

## P2. `pack-us-smart-client` — SMART on FHIR client microservice

**Description:** The read/launch boundary to the host EHR. Closes US-01 in companion form:
patient and clinician access ride the host EHR's certified §170.315(g)(10) API.
**Requirements:** MUST implement SMART App Launch 2.x (EHR launch + standalone), OAuth2
scopes per deployment, US Core 6.1.0 queries for the compartment, and bulk FHIR `$export`
**consumption** where the host offers it. Tokens and refresh flows are tenant-scoped; every
fetched external resource is stored per Core A2 (reference or provenance-marked import,
never Hilbi-authored). EHR-vendor marketplace onboarding (Epic App Market /
athenahealth Marketplace) is a delivery prerequisite tracked per customer.

## P3. `pack-us-writeback` — master-EHR write-back adapter

**Description:** The companion-mode write boundary (Core A6).
**Requirements:** Clinical facts produced in Hilbi outside the care-plan/engagement scope
(e.g. a dekurz-class note authored in the cockpit) MUST be written back to the master EHR —
as FHIR write where the host supports it, otherwise as a `DocumentReference`-wrapped document
push. Write-back success/failure MUST be audited (H2); on failure the record stays in Hilbi
flagged `writeback-pending` and MUST NOT be silently dropped. The master-EHR copy is the
system of record; the Hilbi copy carries `Provenance` linking both.

## P4. `pack-us-erx` — NCPDP SCRIPT e-prescribing adapter

**Description:** US eRx runs on NCPDP SCRIPT rails, not FHIR (US-04). Serves the eRX surface.
**Requirements:** `MedicationRequest` remains the canonical home (Core B2); this adapter
translates to/from NCPDP SCRIPT at the boundary. EPCS (controlled substances: identity
proofing, two-factor signing) and state PDMP checks are mandatory hooks before transmission.
In companion deployments where the host EHR owns eRx, this service defers to the host and
records the prescription by reference.

## P5. `pack-us-docexpose` — US Core document exposure

**Description:** D6 dual-expose in US form (US-03).
**Requirements:** Every `final` Composition MUST be exposed as a US Core `DocumentReference`
with USCDI note-class coding (dekurz → progress note; discharge report → discharge summary).
The mapping table is a pack artifact, CI-tested per E-CONF-08.

## P6. `pack-us-segmentation` — sensitivity segmentation (DS4P / 42 CFR Part 2)

**Description:** Consent-bound segmentation of sensitive categories (US-05), binding Core H5.
**Requirements:** MUST label substance-use-disorder and other sensitive-class content with
HL7 DS4P `meta.security` labels at write; renderers and exposures (P3, P5) MUST honor labels:
no Part-2 content in any Composition, write-back or export without a matching active
`Consent`, and redisclosure notices attach where required.

## P7. `pack-us-identity` — MPI / matching policy

**Description:** B5 instantiation; no national identifier exists (US-06).
**Requirements:** Probabilistic matching IS the US mechanism; algorithm, threshold and score
MUST be recorded in `Provenance` per match; duplicate merge via `Patient.link` per Core B5.
Where the host EHR supplies its MRN, the MRN is the tenant-authoritative identifier.

## P8. Pack parameters (declared per Core G3)

| Parameter | US value |
|---|---|
| Deployment mode (A6) | companion |
| `preliminary` residence SLA (B4) | MANDATORY — max residence + "To verify" escalation queue; value set per customer contract, default 72 h for clinically relied-upon content (information-blocking exposure, US-02) |
| Signature level (C6) | simple electronic signature bound to practitioner identity; EPCS two-factor for controlled substances (P4) |
| Retention / erasure matrix (H6) | no patient erasure right (HIPAA); state retention laws prevail (typ. 6–10 y, longer for minors) — matrix per state, owner Marek (O6) |
| Amendment workflow | HIPAA right-to-amend: request → adjudication → `amended` version or denial letter, audited (US-07) |
| Terminology licensing | SNOMED CT US affiliate + **CPT/HCPCS (AMA license)** for D5 billing hooks — extends O4 (US-10) |

## P9. Conformance (pack-level)

**Requirements:** PACK-US-01: no clinical write outside care-plan/engagement scope persists
in Hilbi without a write-back record (P3). PACK-US-02: no Part-2 content passes any render
or export without matching Consent (P6, E-CONF-07). PACK-US-03: every `final` Composition
has a US Core `DocumentReference` exposure (E-CONF-08). PACK-US-04: `preliminary` residence
SLA breach raises an escalation event (B4).

## Findings closure map

| Audit finding | Closed by |
|---|---|
| US-01 SMART/patient access | P2 (companion: host EHR API) |
| US-02 quarantine vs info blocking | P8 SLA + PACK-US-04 |
| US-03 notes as DocumentReference | P5 |
| US-04 NCPDP eRx | P4 |
| US-05 Part 2 segmentation | P6 |
| US-06 identity/MPI | P7 |
| US-07 amendment workflow | P8 |
| US-08 disclosure accounting | Core H2 (v0.10) |
| US-09 TEFCA | out of scope, roadmap note P1 |
| US-10 CPT license | P8 → O4 |

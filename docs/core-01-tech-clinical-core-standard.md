---
id: CORE-TECH-CLINICAL-CORE
title: Hilbi Clinical Core (EHR Engine) — SSOT Standard
collection: core
area: tech
type: spec
owner: patrik
status: draft-for-approval
version: 0.9
created: 2026-07-21
updated: 2026-07-21
review_due: 2026-10-21
tags: [ssot, standard, fhir, ehr, dekurz, composition, templates, provenance]
related: [CP-TECH-STANDARD, CP-TECH-CONTRACTS, GSR-TECH-ARCH, GSR-SEC-ISO]
iso_controls: [A.8.1, A.5.12, A.8.11]
classification: Dôverné — interné
---

# Hilbi Clinical Core (EHR Engine) — Standard v0.9

> **Authority: NORMATIVE.** This document is the Single Source of Truth (SSOT) for the Hilbi
> Clinical Core — the domain-agnostic clinical record engine of the platform. Every clinical
> producer (manual entry, OCR, speech-to-note, vaccination records, IQ predictions), every
> renderer (dekurz, reports, messages) and every clinical domain microservice (SM Care Plan+
> being the first) derives from it. If any implementation, contract or example conflicts with
> this document, **this document wins** and the other must be corrected.
> **Format:** each element has a **Description** (what it is) and **Requirements** (conformance).
> Requirement keywords **MUST / MUST NOT / SHOULD / MAY** follow RFC 2119.
> **Authoritative language:** **English.** Clinician-authored content is in the clinician's
> language (see CP-TECH-STANDARD D17).
> **Anchored in:** HL7 FHIR R4, HL7 IPS, US Core / USCDI, EU EHDS, India ABDM (FHIR IN),
> ISO/IEC 27001 + 27799, ISO 13606, IEC 62304 — see Normative references.
> **Status:** draft v0.9 — for approval by Roman (business) and Marek (compliance) via K35
> change control; becomes `active` v1.0 upon sign-off.

---

## Normative references — standards anchoring

| Standard | Body | What it anchors here |
|---|---|---|
| **HL7 FHIR R4** | HL7 | Canonical data model, versioning, Provenance, Composition, the only cross-service clinical contract (Parts B, D, F). |
| **HL7 IPS (International Patient Summary)** | HL7 | Baseline canonical resource set and summary semantics (B6 alignment with CP-TECH-STANDARD). |
| **US Core / USCDI** | HL7 / ONC | US regional profile pack (Part G). |
| **EU EHDS + national eHealth (e.g. NCZI/ISIN)** | EU / member states | EU regional profile pack, EHR-system manufacturer obligations (Part G). |
| **ABDM / FHIR India** | NHA India | India regional profile pack (Part G). |
| **ISO/IEC 27001 + ISO 27799** | ISO/IEC | Security controls over clinical data: tenancy, audit, residency (Part H). |
| **ISO 13606** | ISO | EHR communication semantics alongside FHIR for national-system sync. |
| **IEC 62304** | IEC | Software life-cycle for the engine build/release pipeline. |
| **RFC 2119** | IETF | Requirement keyword semantics. |

---

## PART A — Position and principles

### A1. Position: the Clinical Core is the system of record for Hilbi-originated clinical data
**Description:** The Clinical Core is the platform's clinical record engine: a regional FHIR R4
store plus a domain-agnostic summary/render engine. It is the single clinical truth for every
record **created inside the Hilbi platform** (dekurz entries, IQ speech-to-note output, OCR
digitized documents, vaccination records, IQ predictions, care-plan clinical writes).
**Requirements:** All Hilbi-originated clinical data MUST be persisted as FHIR R4 resources in
the Clinical Core. No service, domain or surface may hold clinical truth outside the Core.

### A2. Relationship to CP-TECH-STANDARD A1 ("orchestrator, not an EHR") — conflict resolution
**Description:** CP-TECH-STANDARD A1 states the external EHR/NIS is master of the clinical
record. Both statements are true on different scopes: the **external** EHR/NIS remains master
of records originated in that external system; the **Hilbi Clinical Core** is master of records
originated in Hilbi. External records are referenced or imported with provenance — never
duplicated as truth.
**Requirements:** For externally-originated data the Core MUST store either a reference
(`DocumentReference` / identifier) or an imported copy explicitly marked with
`Provenance` (external source) and MUST NOT present it as Hilbi-authored. CP-TECH-STANDARD A1
remains valid for external systems; this clause supersedes any reading of A1 that would deny
Hilbi a system of record for its own originated data. This clause MUST be cross-referenced
from CP-TECH-STANDARD at its next revision (K35).

### A3. Two-layer model: resources are truth, documents are renders
**Description:** Layer 1 — structured FHIR resources (Observation, Condition, Encounter, …)
are the canonical clinical truth. Layer 2 — human-readable documents (dekurz, discharge
report, VÚSCH report, referral, patient message) are **renders**: FHIR `Composition`
instances generated from Layer 1 by the summary engine using versioned templates.
**Requirements:** A renderer MUST NOT create clinical facts; it may only project resources
that already exist. One resource set MAY feed many Compositions. Editing a render that
changes a clinical fact MUST write back to Layer 1 (the resource), then re-render.

### A4. Domain-agnostic core, domain-registered content
**Description:** The Core knows "resource → context → template → Composition". It does not
know what MRI, EDSS or McDonald 2017 are. Clinical domains (SM+, cardiology, …) register
their content — profiles, templates, mappings, protocols — **as data artifacts**, never as
code inside the Core.
**Requirements:** The Core MUST NOT contain domain-specific logic. Domain artifacts MUST be
expressed in the template stack of Part D. A new domain MUST be onboardable with zero changes
to Core code (conformance test E-CONF-03).

### A5. Producer equivalence
**Description:** Manual entry, OCR digitization, speech-to-note (Hilbi IQ), device/wearable
feeds, vaccination imports and IQ predictions are all **producers**: interchangeable writers
of Layer-1 resources distinguished only by provenance.
**Requirements:** Every producer MUST write the same canonical resource types through the same
write contract (Part C). Downstream consumers (renders, gating, billing) MUST NOT branch on
producer identity except via `Provenance` (e.g. review gates for AI-produced content, C4).

---

## PART B — Canonical data model (FHIR R4)

### B1. Canonical store
**Description:** One FHIR R4 store per regulatory region (EU/Frankfurt, US, India) is the
Clinical Core persistence. Implementation (GCP Healthcare API, HAPI) is an ops decision; the
FHIR R4 REST surface is the contract.
**Requirements:** All reads and writes of clinical data MUST go through the FHIR API of the
regional store. Direct database access to the store by any service other than the Core itself
is PROHIBITED.

### B2. Canonical resource mapping
**Description:** Every clinical concept used on the platform maps to exactly one FHIR home.
The authoritative mapping table (initial set, extended additively via K35):

| Platform concept | FHIR R4 resource |
|---|---|
| Visit / encounter / follow-up | `Encounter` |
| Vital signs, labs, scores (EDSS, BMI, SpO2, HRV…) | `Observation` |
| Imaging (MRI, radiology) | `ImagingStudy` + `DiagnosticReport` (+ derived `Observation`) |
| Diagnosis / clinical impression | `Condition` (+ `ClinicalImpression`) |
| Medication (DMT, prescriptions) | `MedicationRequest` / `MedicationStatement` |
| Vaccination | `Immunization` |
| Scanned / uploaded documents | `DocumentReference` (+ `Binary`) |
| Structured forms (modals, PRO) | `Questionnaire` + `QuestionnaireResponse` |
| Patient communication / education | `Communication`; consent as `Consent` |
| Protocol definition (phases, gating) | `PlanDefinition` + `ActivityDefinition` |
| Patient protocol instance | `CarePlan` |
| Rendered clinical document (dekurz, report) | `Composition` (profile per format) |
| Published/exported document (PDF) | `DocumentReference` referencing the `Composition` |
| Audit | `Provenance` + `AuditEvent` |
| IQ prediction / AI inference | `Observation`/`RiskAssessment` with AI `Provenance` |

**Requirements:** New concepts MUST be mapped here before implementation (K35, additive).
A concept MUST NOT have two FHIR homes.

### B3. Immutability and versioning
**Description:** Clinical history is additive (KB-ARCH-00). Corrections create new resource
versions; nothing is destructively edited.
**Requirements:** The store MUST retain full `_history` for every resource. Deletion is a
status change (`entered-in-error`), never physical removal, except lawful erasure workflows
(Part H).

### B4. Record status lifecycle (quarantine)
**Description:** The SM+ `validated:false` split-save generalizes to the FHIR status
lifecycle: `preliminary` (draft/unvalidated) → `final` (validated/signed) → `amended`.
**Requirements:** Resources in `preliminary` MUST be excluded from rendered Compositions,
protocol gating, billing and IQ synthesis unless a surface explicitly requests drafts.
Validation override MUST emit `AuditEvent(action=validation_override)`.

---

## PART C — Producer contract

### C1. Single write path
**Description:** One write contract for all producers: create/update FHIR resources via the
regional FHIR API with mandatory metadata.
**Requirements:** Every clinical write MUST carry: (a) `Provenance` with `agent` = author
(practitioner | patient | device | AI-service) and `entity` = source
(`manual` | `ocr` | `speech` | `device` | `import` | `iq-prediction`); (b) tenant and
data-class `meta.security` tags; (c) initial `status` per B4.

### C2. OCR producer
**Description:** Digitization stores the original artifact and the extracted structure.
**Requirements:** The original scan MUST persist as `DocumentReference`/`Binary`; extracted
facts MUST be written as canonical resources referencing the source document; extraction
enters as `preliminary` until clinician verification ("To verify" surface state).

### C3. Speech-to-note producer (Hilbi IQ Record Session)
**Description:** Transcription + AI structuring of a recorded session into canonical
resources; the SOAP/VÚSCH "output format" is a **render choice**, not a data shape.
**Requirements:** The audio artifact MUST persist as `Binary` + `DocumentReference` (retention
per Part H). AI-structured facts MUST be written as canonical resources with AI `Provenance`,
`preliminary` until the clinician signs the reviewed draft; signing sets `final` and triggers
the Composition render (Part D). The signed note MUST appear on the patient timeline as a
first-class record.

### C4. AI review gate
**Description:** AI-produced content (speech, OCR, IQ predictions) requires human
accountability before it becomes clinical truth.
**Requirements:** No AI-produced resource may reach `final` without an identified clinician
action (sign/verify). The UI MUST attribute AI authorship visibly (author-on-hover =
"Hilbi IQ"). IQ predictions (`RiskAssessment`) MAY remain `preliminary` indefinitely and MUST
be labelled as predictions wherever surfaced (AI Act Art. 50 transparency).

### C5. Device / wearable and import producers
**Description:** Life ID behavioral/vital feeds and external imports (vaccination registries,
national systems) are producers like any other.
**Requirements:** Same write path (C1); source system recorded in `Provenance`; regional
terminology normalized at the boundary via the region pack ConceptMaps (Part G), never inside
consumers.

---

## PART D — Template stack and summary engine

### D1. Template stack is data, FHIR-native
**Description:** A "template" decomposes into FHIR authoring artifacts:
`PlanDefinition`/`ActivityDefinition` (protocol/phases + gating), `StructureDefinition`
(Composition profile = required sections of a dekurz/report/message), `Library`
(FHIRPath/CQL bindings: which resources feed which section — the declarative "token engine"),
`StructureMap` (declarative transforms, e.g. OCR/speech JSON → resources), plus a versioned
narrative body (markdown with tokens) attached to the profile.
**Requirements:** Templates MUST be pure data artifacts. Imperative per-domain mappers and
formatters (SM+ `mapMri`, `formatters.sm.ts` pattern) MUST be migrated to
`Library`/`StructureMap`; new domains MUST NOT introduce imperative mappers into the Core.

### D2. Template pipeline = care-plan pipeline
**Description:** Template artifacts are authored in GitHub, validated in CI, published to the
regional FHIR server, and resolved by the Core at runtime — identical to the Care Plans
pipeline.
**Requirements:** The Core MUST resolve templates only from the FHIR server; the Core MUST
NEVER call GitHub (reaffirms CP pipeline rule). Every template is semantically versioned;
a rendered `Composition` MUST record the template id+version it was produced with; template
updates MUST NOT retro-change existing Compositions.

### D3. Summary engine = shared library
**Description:** `@hilbi/summary-engine` builds a render context from FHIR resources and
renders `Composition` + narrative. It runs in-process (Core services, domain microservices);
it is not a network service. FHIR is the only network contract.
**Requirements:** The engine MUST be stateless, deterministic for a given
(resource set, template version) input, and side-effect-free except emitting the resulting
`Composition`.

### D4. Output formats
**Description:** SOAP dekurz, admission report (AOS), VÚSCH report, discharge report, referral,
patient message — each is a Composition profile + body over the same Layer-1 resources.
**Requirements:** The seed platform set MUST include `dekurz.soap` (generic clinical note) and
at least one report profile (`report.aos`); domain packs add theirs (e.g. `report.vusch`).
Format selection in any UI selects a profile; it MUST NOT alter what data is captured.

### D5. SOAP and billing hooks
**Description:** SOAP completeness (SOAP-01..11) and billing gating (BILL) operate on coded
section semantics, independent of template wording.
**Requirements:** Every dekurz-class Composition profile MUST code its sections with SOAP
slot codes (S/O/A/P) via `Composition.section.code`; gating and billing MUST read section
codes and resource references — never parse narrative text.

---

## PART E — Service topology and domain contract

### E1. Boundaries
**Description:** Core = regional FHIR store + template resolution + summary engine + generic
profiles. Domain microservices (SM+ first) = protocol logic, domain UX, domain packs. IQ =
producer + consumer services. All exchange exclusively over FHIR.
**Requirements:** A domain microservice MUST NOT own a clinical store; its private storage is
limited to non-clinical operational state (UI prefs, cache with TTL). SM+ `sm_*` tables MUST
be migrated to Core resources per B2 (migration plan is a separate deliverable).

### E2. Domain pack (registration contract)
**Description:** A domain onboards by publishing a **domain pack**: profiles
(StructureDefinitions), protocols (PlanDefinitions), bindings (Libraries), transforms
(StructureMaps), terminology (ConceptMaps/ValueSets), templates (bodies), all versioned
through the D2 pipeline.
**Requirements:** A pack MUST pass CI conformance (schema + reference resolution + region-pack
compatibility) before publish. Packs are additive; breaking changes require a new major
version and K35.

### E-CONF Conformance tests
**Requirements:** E-CONF-01: every producer write carries C1 metadata (reject otherwise).
E-CONF-02: no `preliminary` resource appears in a `final` Composition. E-CONF-03: a reference
"toy domain" pack onboards with zero Core code changes. E-CONF-04: render determinism (D3).
E-CONF-05: region-pack swap (Part G) changes no Core behavior, only profiles/terminology.

---

## PART F — Timeline and surfaces

### F1. Timeline is a projection
**Description:** The patient pathway/timeline is a read projection over Core resources
(Encounter-anchored), not a store.
**Requirements:** Timeline entries MUST derive from resources; completing a protocol step is
evidenced by the existence of the mapped resource (SM+ `getEventCompletion` pattern,
generalized). "Next step" logic reads `CarePlan`/`PlanDefinition`, not UI state.

### F2. Prefill is a projection, not a copy
**Description:** SM+ "Prevziať z posledného" generalizes: forms prefill from the latest
relevant resource in the patient compartment; unchecking resets the form and never deletes
history.
**Requirements:** Prefilled values MUST be visibly badged; saving writes a **new** resource
version/instance (B3).

---

## PART G — Regional adaptability (the gold-standard clause)

### G1. One canonical core, region packs at the boundary
**Description:** The Core canonical model (B2) is region-neutral and IPS-aligned. Regional
compliance (US Core/USCDI, EU EHDS + national systems, India ABDM) is achieved by **region
packs**: profile layers + terminology ConceptMaps + export/exchange adapters. Adaptation is
API mapping at the boundary — never a fork of the canonical model.
**Requirements:** Regional requirements MUST be implemented as: (a) additional profile
constraints on canonical resources, (b) ConceptMap terminology translation (ICD-10-CM vs
ICD-10 vs national codes, LOINC/SNOMED bindings), (c) exchange adapters (EHDS exchange format,
ABDM building blocks, US Core API). A region pack MUST NOT add region-specific resource types
to the canonical mapping; if a concept has no canonical home, extend B2 via K35 for all
regions at once.

### G2. Residency and isolation
**Description:** Three isolated data planes (EU/Frankfurt, US via HHUS, India via HHI) each
run their own Core store; HHTech (UAE) remains synthetic-data-only.
**Requirements:** Clinical resources MUST NOT cross regional planes. Cross-region features
operate on de-identified/aggregate data only, through the RWD boundary. Region packs are
deployed per plane; template/domain packs are global artifacts deployed into each plane.

---

## PART H — Governance, security, compliance

### H1. Tenancy and access
**Requirements:** Every resource carries tenant + data-class `meta.security` tags; access
enforcement uses FHIR compartments (patient) and role scopes. RWD/secondary use remains fully
isolated (GSR data-plane rule).

### H2. Audit
**Requirements:** Every write, validation override, sign event, template publish and region-
pack deploy MUST emit `Provenance`/`AuditEvent`. Audio/scan artifacts follow the retention
schedule agreed with compliance (open item O2).

### H3. Change control
**Requirements:** Changes to this Standard, to B2 mapping, to the template stack or to region
packs go through K35 change control; normative statements are additive where possible; owner
approvals: Patrik (architecture) → Roman (business) → Marek (compliance).

### H4. AI transparency
**Requirements:** AI-produced or AI-assisted content MUST be attributable end-to-end
(Provenance → UI attribution → Composition narrative note where required), satisfying AI Act
Article 50 obligations for Hilbi IQ.

---

## PART I — Migration from SM+ (first consumer)

**Description:** SM+ proved the two-layer model; migration is generalization, not rewrite.
Order: (1) stand up Core store + engine library with generic pack (`dekurz.soap`,
`report.aos`); (2) wire producers (manual → speech-to-note → OCR) to the C1 contract;
(3) publish the SM domain pack (profiles/protocol/bindings) via D2; (4) migrate `sm_*`
tables to resources (dual-write window, then cut-over); (5) retire imperative mappers per D1.
**Requirements:** During dual-write, the Core is truth and `sm_*` is a legacy read model;
conflicts resolve in favor of the Core. Cut-over completion is an E-CONF gated milestone.

---

## Open items (blocking v1.0 sign-off)

| # | Item | Owner |
|---|---|---|
| O1 | Store implementation choice per plane (GCP Healthcare API vs HAPI) + cost model | Juraj |
| O2 | Retention schedule for audio/scan `Binary` artifacts per region | Marek |
| O3 | CP-TECH-STANDARD A1 cross-reference amendment (A2 here) | Patrik → K35 |
| O4 | Terminology licensing per region (SNOMED CT affiliate status SK/US/IN) | Marek |
| O5 | `sm_*` → FHIR migration plan (separate deliverable, Part I) | Viktor |

---

## TL;DR

```
Producers (manual · OCR · speech · device · import · IQ) ──C1──►  FHIR R4 store (regional, truth)
                                                                        │
                     domain packs + templates (GitHub→CI→FHIR) ──D2──►  │
                                                                        ▼
                                        @hilbi/summary-engine (library) render
                                                                        ▼
                              Composition (dekurz · AOS · VÚSCH · message) ──► timeline / export
Region packs (US Core · EHDS · ABDM) adapt at the boundary — the canonical core never forks.
```

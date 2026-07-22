---
id: CORE-TECH-CLINICAL-CORE
title: Hilbi Clinical Core (EHR Engine) — SSOT Standard
collection: core
area: tech
type: spec
owner: patrik
status: draft-for-approval
version: 0.11
created: 2026-07-21
updated: 2026-07-21
review_due: 2026-10-21
tags: [ssot, standard, fhir, ehr, dekurz, composition, templates, provenance]
related: [CP-TECH-STANDARD, CP-TECH-CONTRACTS, GSR-TECH-ARCH, GSR-SEC-ISO, CORE-AUDIT-CONSOLIDATION]
iso_controls: [A.8.1, A.5.12, A.8.11]
classification: Dôverné — interné
---

# Hilbi Clinical Core (EHR Engine) — Standard v0.11

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
> **Status:** draft v0.10 — v0.9 + the seven convergent audit clauses (CORE-AUDIT-CONSOLIDATION)
> and the deployment-mode clause A6, all additive. For approval by Roman (business) and Marek
> (compliance) via K35 change control; becomes `active` v1.0 upon sign-off. The single remaining
> v1.0 design gate (EU-02 erasure) is closed by H6.

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

### A6. Deployment modes: companion vs primary
**Description:** Hilbi is a data orchestrator, not an EHR competitor. Per market the Core
operates in one of two declared modes. **Companion mode:** Hilbi runs on top of a certified
external EHR (e.g. as a SMART on FHIR application over Epic/athenahealth); the external EHR
remains the system of record for encounter documentation. **Primary mode:** no external EHR
exists beneath Hilbi (e.g. India, SK ambulatory practices without a NIS); the Core is the
clinician's system of record and carries the full regional EHR burden.
**Requirements:** The deployment mode MUST be declared per market in the region pack (Part G).
In companion mode, Hilbi-originated clinical truth MUST be limited to the care-plan and
engagement scope; all other clinical writes MUST be written back to the master EHR through the
pack's write-back adapter, with the external record referenced per A2. In primary mode the
full Standard applies. Certification-relevant capabilities (patient access APIs, exchange
rails, logging/export components) MUST be implemented as separate BE microservices activated
by the region pack — never compiled into the Core.

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
status change (`entered-in-error`), never physical removal, except the erasure/restriction
design of H6.

### B4. Record status lifecycle (quarantine)
**Description:** The SM+ `validated:false` split-save generalizes to the FHIR status
lifecycle: `preliminary` (draft/unvalidated) → `final` (validated/signed) → `amended`.
**Requirements:** Resources in `preliminary` MUST be excluded from rendered Compositions,
protocol gating, billing and IQ synthesis unless a surface explicitly requests drafts.
Validation override MUST emit `AuditEvent(action=validation_override)`.
A region pack MAY declare a **maximum residence time** in `preliminary` for content that has
been clinically relied upon, with an escalation queue ("To verify") and SLA — mandatory in the
US pack (information-blocking exposure, CORE-AUDIT-US US-02).

### B5. Patient identity and matching
**Description:** Multi-source ingestion (C1–C5) makes identity the primary operational failure
mode. Identifier regimes differ per region: no national identifier in the US (MPI/matching),
verified **ABHA** in India, national IDs/eIDs in EU member states.
**Requirements:** Each region pack MUST declare its identifier policy: authoritative
identifiers, verification method, matching methodology. Where a verified identifier exists
(e.g. ABHA), linking MUST be deterministic; probabilistic matching MAY be used only where no
verified identifier exists and MUST record its method and score in `Provenance`. Duplicate
resolution uses `Patient.link` + merge with full `Provenance`; merged records are never
physically collapsed (B3 applies).

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

### C6. Signature model
**Description:** "Signing" (B4, C3, C4) is a legal act, not merely a status transition. The
required signature level differs per document class and jurisdiction (eIDAS AdES/QES in the
EU; practitioner e-signature regimes elsewhere).
**Requirements:** Every sign event MUST store a signature artifact in `Provenance.signature`
bound to the practitioner identity. The required signature **level** (simple / advanced /
qualified) is declared per Composition profile in the region pack (or national sub-pack, G3);
the Core MUST refuse the `final` transition when the pack-required level is not met.
Signature verification data MUST survive export (D6).

### C7. Producer resilience (offline / intermittent connectivity)
**Description:** Field conditions (tier-2/3 connectivity in India, mobile use everywhere)
make synchronous-only writes unfit for clinical use.
**Requirements:** Producer clients MUST be able to queue C1 writes locally with idempotency
keys and replay on reconnect; replay MUST preserve the original event time in `Provenance`
(clinical time and replay time both recorded). Read surfaces SHOULD use cacheable projections
(F1). Queued content is clinical data: encrypted at rest, purged after confirmed replay.
This is a platform-wide property, not an India-only feature.

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

### D6. Regional document exposure (dual-expose)
**Description:** Regions exchange documents in their own envelope: US Core clinical notes as
`DocumentReference` (note classes per USCDI), ABDM record types (`OPConsultRecord`,
`DischargeSummaryRecord`, `Prescription`, …), EHDS **EEHRxF** priority categories.
**Requirements:** Every `final` Composition MUST additionally be exposed as the regional
document type declared by the active region pack; the Composition ↔ regional-type mapping is
a pack artifact and CI-tested (E-CONF-08). The Composition remains the canonical render;
regional exposures are derived and MUST reference it. Seed mappings: dekurz →
US Core `DocumentReference` / ABDM `OPConsultRecord`; discharge report →
`DischargeSummaryRecord` / EEHRxF discharge category.

### D7. Template governance: system → provider → physician (Patrik decision 2026-07-21)
**Description:** Three tiers. **System templates** — the Hilbi-authored seed set, published
via D2. **Provider templates** — a registered provider (tenant) may clone, edit, create and
**version** templates; provider templates are available to every physician of that provider
and carry the provider's header/footer, including informed-consent and per-country
confirmation blocks. **Physician assets** — stamp and signature image stored in the
physician profile, used in print/export renders only.
**Requirements:** Provider templates flow through the same D2 pipeline mechanics with a
tenant scope tag; they MUST NOT weaken normative constraints of the underlying Composition
profile (SOAP section codes, D5). Per-country confirmation/consent datasets are
standard-approved artifacts configured in country settings and provider-editable as
templates. The stamp/signature image is presentation only and NEVER substitutes the C6
digital signature (timestamp / eID / biometrics / PIN per the pack-required level).
**Version lifecycle:** running `CarePlan` instances stay **pinned** to the
PlanDefinition version they were started on; activating a newer version is an explicit
clinician action, never automatic. Rendered Compositions never retro-change (D2).
**Language:** the canonical template source is **English**; market translations are
localization layers in the region pack and MUST NOT fork the template.

---

## PART E — Service topology and domain contract

### E1. Boundaries
**Description:** Core = regional FHIR store + template resolution + summary engine + generic
profiles. Domain microservices (SM+ first) = protocol logic, domain UX, domain packs. IQ =
producer + consumer services. All exchange exclusively over FHIR.
**Requirements:** A domain microservice MUST NOT own a clinical store; its private storage is
limited to non-clinical operational state (UI prefs, cache with TTL) **and domain protocol
state** (running-plan orchestration — separate database permitted, Patrik decision
2026-07-21). Clinical facts MUST NOT live only in a domain database (E3). SM+ `sm_*` tables MUST
be migrated to Core resources per B2 (migration plan is a separate deliverable).

### E2. Domain pack (registration contract)
**Description:** A domain onboards by publishing a **domain pack**: profiles
(StructureDefinitions), protocols (PlanDefinitions), bindings (Libraries), transforms
(StructureMaps), terminology (ConceptMaps/ValueSets), templates (bodies), all versioned
through the D2 pipeline.
**Requirements:** A pack MUST pass CI conformance (schema + reference resolution + region-pack
compatibility) before publish. Packs are additive; breaking changes require a new major
version and K35.

### E3. Domain ↔ Core sync contract
**Description:** A domain microservice (Care Plans first) runs its own logic and protocol
database; the Core receives synced clinical facts and **timeline events** — not every
internal detail of the plan. The full contract is CORE-SYNC-STANDARD (core-12).
**Requirements:** Transport is FHIR R4 REST only (E1); the Core never reads a domain
database and the domain never bypasses the FHIR API. Every clinical fact produced in the
domain MUST write to the Core via C1 (Provenance agent = the domain service). Timeline
events carry a `milestone` flag only for pack-declared milestone classes (MAP/M3); the
patient pathway consumes flagged events, the plan detail stays in the domain surface.

### E-CONF Conformance tests
**Requirements:** E-CONF-01: every producer write carries C1 metadata (reject otherwise).
E-CONF-02: no `preliminary` resource appears in a `final` Composition. E-CONF-03: a reference
"toy domain" pack onboards with zero Core code changes. E-CONF-04: render determinism (D3).
E-CONF-05: region-pack swap (Part G) changes no Core behavior, only profiles/terminology.
E-CONF-06: a **national sub-pack** swap (G3) passes the same test. E-CONF-07: consent
revocation (H5) halts ongoing exchange flows immediately and is audited. E-CONF-08: every
`final` Composition has a regional exposure per the D6 mapping of the active pack.

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
ICD-10 vs national codes, LOINC/SNOMED bindings), (c) **role/exchange modules** implemented as separate BE
microservices per A6 (e.g. ABDM HIP/HIU Gateway client, NCPDP SCRIPT eRx, SMART on FHIR
patient-access API, EEHRxF export), (d) certification obligations of the market. A region pack MUST NOT add region-specific resource types
to the canonical mapping; if a concept has no canonical home, extend B2 via K35 for all
regions at once.

### G2. Residency and isolation
**Description:** Three isolated data planes (EU/Frankfurt, US via HHUS, India via HHI) each
run their own Core store; HHTech (UAE) remains synthetic-data-only.
**Requirements:** Clinical resources MUST NOT cross regional planes. Cross-region features
operate on de-identified/aggregate data only, through the RWD boundary. Region packs are
deployed per plane; template/domain packs are global artifacts deployed into each plane.

### G3. Pack composition and national sub-packs
**Description:** A region pack is more than profiles + terminology — and the "EU" is 27
national eHealth systems, not one market.
**Requirements:** A region pack consists of: profiles, terminology, role/exchange modules,
access APIs, certification obligations, deployment mode (A6), identifier policy (B5),
signature matrix (C6), `preliminary` residence SLA where required (B4), and the
retention/erasure matrix (H6). The **EU pack MUST be structured as a base pack
(EHDS/EEHRxF + IPS) plus national sub-packs** with the same additive mechanics — e.g.
gematik/ISiK (DE), ezdravie/NCZI (SK). A national sub-pack MAY add adapters and constraints;
it MUST NOT alter the canonical model (G1 applies transitively). E-CONF-06 tests the swap.

---

## PART H — Governance, security, compliance

### H1. Tenancy and access
**Requirements:** Every resource carries tenant + data-class `meta.security` tags; access
enforcement uses FHIR compartments (patient) and role scopes. RWD/secondary use remains fully
isolated (GSR data-plane rule).

### H2. Audit
**Requirements:** Every write, validation override, sign event, template publish and region-
pack deploy MUST emit `Provenance`/`AuditEvent`. Every **read/export** of a clinical
compartment MUST also emit `AuditEvent` with the recipient identity, queryable per patient —
this single mechanism satisfies the EHDS logging component and HIPAA accounting of
disclosures (CORE-AUDIT-EU EU-04, CORE-AUDIT-US US-08). Audio/scan artifacts follow the retention
schedule agreed with compliance (open item O2).

### H3. Change control
**Requirements:** Changes to this Standard, to B2 mapping, to the template stack or to region
packs go through K35 change control; normative statements are additive where possible; owner
approvals: Patrik (architecture) → Roman (business) → Marek (compliance).

### H4. AI transparency
**Requirements:** AI-produced or AI-assisted content MUST be attributable end-to-end
(Provenance → UI attribution → Composition narrative note where required), satisfying AI Act
Article 50 obligations for Hilbi IQ.

### H5. Consent lifecycle and purpose of use
**Description:** Consent is not a stored document but an enforced lifecycle:
grant → purpose-bound access → expiry → revocation → cascade. Regional bindings differ
(HL7 DS4P sensitivity labels + 42 CFR Part 2 in the US, EHDS permits in the EU, ABDM consent
artefacts + DPDP in India).
**Requirements:** For data classes that require it (declared per pack), the Core MUST
evaluate **purpose-of-use at read** against an active `Consent` carrying purpose, scope and
validity window. Revocation MUST take effect immediately: ongoing exchange flows halt,
subsequent reads are denied, and both are audited (H2, E-CONF-07). Renderers (D3/D4) MUST
honor sensitivity labels: a Composition MUST NOT include consent-bound content without a
matching active `Consent` (no Part-2 content without Part-2 consent).

### H6. Erasure, restriction and legal hold
**Description:** Erasure rights (GDPR Art. 17, DPDP purpose-end erasure) and retention duties
(medical-record laws, US state retention) point in **opposite directions per region**; in an
additive store (B3) erasure is an architectural feature, not a workflow footnote. This clause
closes audit finding EU-02 — the single v1.0 design gate.
**Requirements:**
(a) **Adjudication:** every erasure request runs through legal-hold adjudication against the
region pack's retention/erasure matrix; statutory retention prevails where the law says so;
the adjudication outcome (grant/deny/partial + legal basis) is itself audited.
(b) **Mechanism:** `Binary` artifacts are **crypto-shredded** (per-artifact keys destroyed);
structured resources are masked with **tombstones** that preserve referential integrity —
a Composition referencing an erased resource renders a tombstone marker, never the content;
`_history` is included in the cascade.
(c) **Cascade:** erasure propagates to derived exposures (D6), exports, producer queues (C7),
caches, and the RWD ingestion boundary.
(d) **Backups:** erased data MUST become unrecoverable within a declared SLA (key destruction
or backup cycling), stated in the pack's matrix.
(e) **Restriction of processing** (GDPR Art. 18) is a `meta.security` label that excludes the
resource from renders, exchange and IQ synthesis while preserving it intact.

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
| O6 | Retention/erasure matrix per region & member state (feeds H6, G3) | Marek |
| O7 | Signature-level matrix per document class per country (C6) | Marek |
| O8 | MDR / AI Act qualification of IQ predictions (MDCG 2019-11; until resolved predictions stay `preliminary`, labelled, non-prescriptive) | Marek |
| O9 | Deployment-mode declaration per market (A6): US=companion, IN=primary, EU=per member state | Patrik → Roman |
| O10 | Per-country confirmation/consent dataset catalog (D7) — standard approval | Marek |

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
Region packs (US Core · EHDS+national · ABDM) adapt at the boundary — the canonical core never forks.
Deployment mode per market (A6): companion (over external EHR) or primary (Core = system of record).
```

---

## Changelog

**v0.10 (2026-07-21)** — additive, per CORE-AUDIT-CONSOLIDATION (K35):
A6 deployment modes (companion/primary); B4 `preliminary` residence SLA hook; B5 identity &
matching; C6 signature model (eIDAS AdES/QES); C7 producer resilience (offline); D6 regional
document dual-expose; G1 role/exchange modules as BE microservices; G3 pack composition +
EU national sub-packs; H2 read/export audit (EHDS logging + HIPAA disclosures); H5 consent
lifecycle & purpose-of-use; H6 erasure/restriction/legal-hold design (**closes EU-02, the
v1.0 gate**); E-CONF-06..08; open items O6–O9.
**v0.11 (2026-07-21)** — Patrik decisions: D7 template governance (system/provider/
physician tiers, provider versioning, EN canonical + localization, pinned running plans,
stamp = presentation only); E1 domain protocol DB permitted; E3 domain↔Core sync contract
(→ core-12); O10.
**v0.9 (2026-07-21)** — initial draft.

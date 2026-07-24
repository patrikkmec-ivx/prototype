---
doc_id: TBD (assign per gsr-13)
title: "SOAP core, case layer and billing derivation — cockpit"
version: 1.3-draft
date: 2026-07-20
authority: "proposed by: Patrik (CEO) · approved by: Roman (CBO) · applied by: Dominika/Viktor · checked by: Marek"
type: normative
ssot_for: "the cockpit clinical record model (SOAP), the case layer, the derivation of claims"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: draft — awaiting approval (Roman) and compliance review (Marek)
related: [cp-01-tech-standard, cp-13-tech-smplus-mapping, cp-14-tech-soap-screen-flow, cp-17-tech-report-conformance-standard, cp-18-tech-report-lifecycle]
language_note: "English is authoritative (D17). Translated from the Slovak original on 2026-07-24 with no semantic change; verified by check_translation.py — rule set, order, modality, cross-references and code identifiers unchanged."
---

# SOAP core, case layer and billing derivation

Purpose: one clinical record model for every market (US, EU, India). The physician
performs actions; the system maps them into the SOAP structure in the background. Flows
differ in the order of input, not in the data model.

> **Scope.** This document defines the **record model**. What may happen to a record —
> coding, signature, versioning, provenance, sharing and AI transparency — is defined by
> `cp-17-tech-report-conformance-standard` (normative). In a conflict over those areas
> cp-17 takes precedence.

## 1. Normative rules — core

- **SOAP-01** Every clinical entry MUST be assigned to exactly one SOAP slot (S/O/A/P).
- **SOAP-02** SOAP is NEVER presented as a mandatory form; it arises from the accumulation of actions.
- **SOAP-03** The progress note is a compilation of the encounter's actions into a FHIR `Composition` with sections S/O/A/P; it is compiled continuously in the background.
- **SOAP-04** Action mapping: eRx → `MedicationRequest` (P) · order → `ServiceRequest` (P) · follow-up → `Appointment` (P) · diagnosis/note → `Condition`/text (A) · vitals/findings/results → `Observation` (O) · complaints/history/chat extract → S.
- **SOAP-05** A one-line note defaults to slot **A**; the S/O/A/P switch is available, never mandatory.
- **SOAP-06** Signing the progress note validates the minimum set per `market_rules`; missing slots are indicated (completeness `S○ O● A● P●`) and NEVER block beyond the market minimum.
- **SOAP-07** An order is NOT an incomplete progress note. An order opens a loop (pending result); the result is written as O. The first-level categories in the UI are exclusively **Radiology** and **Labs** (not modalities such as MRI); the items are catalogue-driven per market and facility.
- **SOAP-08** The final report is a render of the `Composition` (→ `DocumentReference`). Two templates exist: **Rx slip** (the IN default) and the **full report** (the EU/US default, containing eRx and follow-up). One data object, no branching on content.
- **SOAP-09** `market_rules` is configuration, not a code branch: the minimal-sign set · the requirement to code the diagnosis (ICD-10) · the default render template · follow-up presentation (IN: a one-click chip beside the Rx · EU/US: a line in the report).

- **SOAP-10** A reverse suggestion of A from P (for example a proposed diagnosis derived from prescribed medication) is permitted EXCLUSIVELY as an explicitly confirmed suggestion — it fills the field and the physician confirms; never autofill, never a silent write.

## 2. Normative rules — case layer

- **CASE-01** Every `Encounter` MUST belong to exactly one `EpisodeOfCare`. An outpatient case is an episode with a single encounter (with no additional UI overhead).
- **CASE-02** Moving a patient between departments closes the encounter and opens a new one within the same episode. The patient is NEVER copied.
- **CASE-03** A handoff between departments generates an IQ draft summary in ISBAR structure from the compiled SOAP case; the summary is an event on the timeline and is confirmed by the handing-over physician.
- **CASE-04** Every event carries an author AND a department. A case has one timeline; a department sees its own slice, the attending physician of the case sees the whole.


## 2b. Normative rules — encounter layering on the timeline

- **ENC-01** The timeline shows encounter granularity by default; atomic events are layered beneath it as SEPARATE REDUCED CARDS on a nested axis (tile → mini-axis with cards → detail). The same visual card language at every level, only smaller.
- **ENC-02** The first action on a patient opens an encounter; every further action in the session attaches automatically. A signature closes the encounter. Grouping is a by-product of the work, never an extra step.
- **ENC-03** An encounter with a single event renders as that event alone (degeneration — an Indian Rx-only entry remains a single card).
- **ENC-04** An asynchronous order result attaches to the encounter the order came from; the loop closes inside the group.
- **ENC-06** Tile collapse rules: expanded while work is in progress (In progress); a signature collapses it automatically into a clean summary; historical encounters are collapsed by default; the chevron toggles at any time.
- **ENC-05** The encounter type and name are derived from the physician's speciality (GP examination, Orthopaedic examination…) and are editable. The summary tile aggregates the key information of the partial actions (A; P · O) plus SOAP chips, state and count.

## 3. Normative rules — billing derivation

- **BILL-01** The billing basis is derived EXCLUSIVELY from clinical objects; it is never entered as a parallel record.
- **BILL-02** The system is a suggestion engine: it proposes `ChargeItem` candidates and the physician confirms. Automatic claiming without confirmation is prohibited (US: False Claims Act exposure; EU: review audits).
- **BILL-03** `ChargeItem` candidates are collected per encounter (confirmed when the stay closes) and aggregated per episode at discharge → bill / DRG batch / `Invoice`. This closes gap H31 (cp-13).
- **BILL-04** The E/M level suggestion (US) is derived from the MDM elements of the SOAP data and MUST carry a justification drawn from the physician's own data. The goal is complete capture of what was legitimately performed, never upcoding.
- **BILL-05** Internal revenue attribution per department is a by-product of the CASE and BILL layers; it requires no additional record.

## 4. Flows (informative)

**A — India, Rx-first:** Rx (P) → optionally one sentence (A) → signature (minimum A+P) → Rx slip. Follow-up as a one-click chip.
**B — EU/US, linear S-O-A-P:** sequential entry → signature → full report including eRx and the follow-up line.
**C — Orders:** Radiology/Labs → pending loop → result as O (in the same or a follow-up encounter).
**Multi-department case:** flows A–C repeat per encounter inside one episode; discharge aggregates both the report and the bill.

Reference diagram: `cp-14-tech-soap-screen-flow.mermaid`.

## 5. Production approach — two tracks

**Track 1 — data layer (starts immediately, Viktor):** EpisodeOfCare, Encounter, Composition, MedicationRequest, ServiceRequest, Observation, Condition, Appointment, ChargeItem/Invoice plus `market_rules` configuration. Independent of the UI.
**Track 2 — UI (handed over after validation in the prototype):** K-16 SOAP chips + note defaulting to A → K-17 progress note v2 + completeness + chat→S → K-18 orders + pending → K-19 signature and render (validating flow A against flow B on the same data) → K-20 `ChargeItem` confirmation at signature → K-21 case layer (grouping the axis per episode, department as an attribute, handoff, aggregated bill) → M-17/M-18 mobile sheets. Mobile text exclusively through the M-17 type tokens (floor of 12 px).

## 6. Open points (they block production deployment, not the start of track 1)

1. Marek: sign-off of the unified dashboard (ISO 27001/27701, EHDS, HIPAA).
2. Cross-region identity — the highest-risk architectural point; close it before the other decisions.
3. Marek: confirmation of the A+P minimal-sign set for IN against the Telemedicine Practice Guidelines 2020 / ABDM.
4. Marek: the legal boundary between "a proposed claim" and "coding advice" per jurisdiction.
5. CPT licence (AMA) for the US — a go-to-market cost item.
6. The `doc_id` of this document per gsr-13.

---
doc_id: TBD (assign per gsr-13)
title: "Records and the simple examination entry — analysis (K-24/K-25)"
version: 0.9-analysis
date: 2026-07-20
authority: "proposed by: Patrik (CEO) · approved by: Roman (CBO) · applied by: Dominika/Viktor · checked by: Marek"
type: informative
ssot_for: "—"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: analysis — deferred, awaiting a go (Patrik); after the go, promote the relevant rules into cp-15 v1.2 as normative
related: [cp-15-tech-soap-case-billing-standard, cp-14-tech-soap-screen-flow]
language_note: "English is authoritative (D17). Translated from the Slovak original on 2026-07-24."
---

# Records and the simple examination entry — analysis

Status: an analytical record from 2026-07-20. Implementation (K-24/K-25) is DEFERRED
pending an explicit go. Nothing in this document is in the prototype yet.

## 1. The key principle

**Records is NOT the source of the progress note. Records and the progress note both
draw on the same stream of events.** A second parallel write channel would create a
duplicate truth.

Three layers:
1. **Events** — atomic, each with a SOAP slot; the single source of truth; the progress
   note is compiled from them (exists, v65–v74).
2. **Records** — the artefact library of a case: structured examinations, generated
   outputs (reports, slips), received documents (OCR, external), orders with results. An
   artefact is a wrapper — it references the events it generated or was rendered from.
3. **Progress note** — a compilation of the events of a day or an encounter (unchanged).

## 2. A form is an event generator

A structured form declares the SOAP mapping of its sections; filling it in emits a batch
of events into the same slots as the atomic actions from "+". The form itself is stored
as an artefact (FHIR `Composition` + `DocumentReference`) in Records.

Partial versus whole: the form is saved partially (draft); every completed section emits
its events immediately. The "whole case" is not created by writing but by compilation
(day = progress note, encounter = report, episode = case view K-21).

## 3. Reference mapping: red-flag review (neurologist, Lovable)

The red-flag review is a care plan microservice — IT DOES NOT CHANGE; it appears in
Records only as an artefact. The mapping serves as a reference pattern:

| Section | SOAP | Note |
|---|---|---|
| History: introduction, present complaint, personal, family | S | |
| Allergy history (chips) | S | + a dual write into Life ID (Allergies) |
| Medication history | S | medication history ≠ prescription — NEVER generates P |
| Subjective + symptom chips | S | coded symptoms (input for IQ) |
| Objective (status neurologicus) | O | |
| Vitals BP/pulse/height/weight/BMI | O | + a write into Vital data (Life ID) |
| EDSS (score) | O | a scored scale is an objective finding |
| Supplementary: episodes, comorbidities | S | comorbidities populate the problem list |

The form deliberately has neither A nor P — an intake or triage template emits S+O; the
conclusion (A) and the plan (P) are physician actions taken after the form. Completeness
after filling: `S● O● A○ P○`.

Patterns adopted: per-field templates (Standard + edit), chip codification instead of
free text, and Upload / Photograph / Insert from NIS inputs in the header.

## 4. Patrik's decision: a simple entry without a care plan

Instead of a full template, a **simple examination entry** is built:

**Two ways in:**
1. **Own entry** — empty sections History (S) · Subjective (S) · Objective + vitals (O),
   each with a visible SOAP badge.
2. **Photograph what the patient brought** — photo → OCR transcription into History
   (labelled "IQ transcription · to be verified", following the existing OCR card
   pattern); the physician continues with the subjective and objective findings.

**Saving and versioning:** Save = a draft artefact in Records + emission of events from
the completed (non-empty) sections into the progress note + a version line in the
progress note ("examination v1 — draft"). A further save = v2; only newly completed
sections are emitted — no duplicates. A and P are not part of the entry — they remain
actions (Record / Rx / Order).

## 5. Proposed Records tab (K-24)

Folders per case or episode (following K-21): **Examinations** · **Reports** (generated
from signatures) · **Received documents** (OCR, external) · **Orders and results**
(linked to pending loops). An artefact carries: name, date, author + department, state
(draft / signed / to be verified), and a link through to "show events". A new entry is
started both from Records and from the "+" menu — both paths lead to the same thing.

## 6. Rules to promote into cp-15 v1.2 (after the go)

- **SOAP-11** A structured form is an event generator; its sections declare a SOAP
  mapping; a partial save emits the events of the completed sections (a repeated save
  emits only the newly completed ones — no duplicates).
- **REC-01** An artefact always references its events (in both directions).
- **REC-02** Records is never a write channel outside events.
- **REC-03** Artefacts are organised per episode or encounter.
- **REC-04** Medication history NEVER generates P; a new prescription goes exclusively
  through the Rx flow.

## 7. Batch plan (after the go)

- **K-24** Records tab: folders, artefacts with state, the link to events; the report
  from K-19 and the entries land there automatically.
- **K-25** Simple examination entry: two paths (own / OCR from a photo), SOAP badges on
  the sections, Save = draft + emission + a version in the progress note.
- **cp-15 v1.2** SOAP-11 + REC-01..04.

---
doc_id: TBD (assign per gsr-13)
title: "Templates, IQ intake and progress note compilation — analysis and approach"
version: 1.0-draft
date: 2026-07-23
authority: "proposed by: Patrik (CEO) · approved by: Roman (CBO) · applied by: Dominika/Viktor · checked by: Marek"
type: informative
ssot_for: "—  (analysis; the normative consequences belong in cp-17 and cp-15)"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: draft — analysis before implementation
related: [cp-15-tech-soap-case-billing-standard, cp-16-tech-records-simple-note-analysis, cp-17-tech-report-conformance-standard, cp-18-tech-report-lifecycle]
language_note: "English is authoritative (D17). Translated from the Slovak original on 2026-07-24."
---

# Templates, IQ intake and progress note compilation

An analysis of the template layer from SM Care Plan+ (`@hilbi/summary-templates`) and
its transfer into the cockpit as a microservice. Goal: **capture any partial input, hold
a single FHIR structure in the background, and display it on the frontend according to
the provider's template.**

This document is **informative**. The normative consequences are listed in §7 and belong
in `cp-17`.

---

## 1. Why templates

Providers mostly follow SOAP but branch it — especially the subjective part — into
history scopes: **OA** (personal), **AA** (allergy), **FA** (pharmacological), **RA**
(family), **SA** (social), **PA** (occupational). Every practice has its own habit and
its own output structure.

A template solves three things at once:

1. **Display** — the physician sees the progress note in the structure they are used to.
2. **Compilation** — partial inputs (OCR, form, chat, measurement) are assembled into
   continuous text without the physician retyping them.
3. **Output into a foreign system** — the rendered **plain text** is pasted through the
   clipboard straight into the existing EHR, which usually accepts free text. The
   practice prints its own reports from there.

Point 3 is a direct fulfilment of the **overlay** role (`cp-17` REP-01, REP-02): we do
not need an integration with a foreign system in order to be useful. At the same time we
keep a structured record on our side.

## 2. What we take from SM Care Plan+

| Element | Role | Note on adoption |
|---|---|---|
| `slotKey` | document type (progress note, referral, consent, patient letter) | A generalisation of our `tpl`. One pipeline, N outputs. |
| `kind: system` / `user` | supplied versus provider-created templates | A direct answer to "every provider has their own". |
| **Coverage** `{total, filled, missing[]}` | how many fields are filled | We do not have it. Connect it to completeness (`SOAP-06`) and to the acknowledged gap (`TERM-08`). |
| **Split-save / quarantine** | `validated=false` never reaches the progress note | **Critical for IQ intake.** Without it, OCR injects unverified data. |
| Adapter store | Session → Supabase → REST → Core | Adopt the interface, not the implementation. |
| Immutable history | a new generation is a new version | Consistent with `AMD-01..03`. |
| Domain formatters | the single place where structure collapses into text | Keep as a rule. |
| Token / Mapping / Kb registries | token catalogue, canonical paths, guidance | Tokens are **generated** from the model, not written by hand. |
| Pure renderer with no I/O | testability | Keep. |

## 3. What we must decide differently

### 3.1 A template section is a view, not a source

History scopes look like textual subheadings, but they correspond to separate FHIR
resources:

| Scope | FHIR resource |
|---|---|
| AA — allergy | `AllergyIntolerance` |
| FA — pharmacological | `MedicationStatement` |
| OA — personal | `Condition` (past), `Procedure` |
| RA — family | `FamilyMemberHistory` |
| SA / PA — social, occupational | `Observation`, category social-history |

If the scopes are stored as textual template sections, the structure is lost and the
system degrades into a plain-text generator. Therefore: **a template section selects and
orders items; the items carry their own FHIR identity.** A template is never a place of
storage.

### 3.2 History and encounter have different lifecycles

- **Patient level** (OA, AA, FA, RA, SA, PA) — persists between visits, is **updated**,
  is not created anew. It belongs to Life ID.
- **Encounter level** (S, O, A, P of today's visit) — created anew at every meeting.

The progress note template **projects** the history, it does not own it. Otherwise it
would be rewritten at every visit.

This split mirrors IQ intake exactly: **OCR populates the patient level** (the past from
brought-in documentation), **the physician fills the encounter level** (today).

### 3.3 The market does not select the template — it constrains it

The current model (`MKT.tpl` determines the template) is not sustainable once providers
bring their own templates. The correct model is **three independent axes**:

| Axis | Determined by | Example |
|---|---|---|
| Document type | the context of the action | `slotKey: progress-note` / `referral` / `consent` |
| Template | the provider | `system` (supplied) or `user` (own) |
| Market rules | regulation | mandatory minimum, code systems, signature level |

The market does not say "use the Rx slip". The market says "you cannot sign without A
and P" and "the diagnosis must be coded". The template determines the **form**, the
market determines the **minimum**.

### 3.4 User templates need a conformance gate

A gap in the current design: if a provider saves a template that omits the diagnosis, a
non-conformant report is rendered. **A template must be validated against the mandatory
market minimum when saved** — exactly as a signature is validated. An invalid template
is not saved as active.

### 3.5 One template, two renderers

Our `RPT_TPL` is structural (a list of sections), `SummaryTemplate` is textual
(`{{tokens}}`). They are not competitors:

```
Template = sections + token bindings
   ├─► TEXT renderer        → plain text → clipboard → foreign EHR
   └─► STRUCTURE renderer   → HTML with sections and code chips (our UI)
```

The template decides whether codes also reach the textual output (for example `G35`
inline in the text) — dual coding therefore need not be lost through the clipboard.

## 4. IQ intake — the flow

The flow for the situation "the patient brings documentation".

```
1. The patient brings documentation (paper, extracts, findings)
2. The physician photographs it through IQ            → capture
3. OCR + AI extraction → CANDIDATES
      validated = false
      Provenance.agent = Hilbi IQ                     (PROV-03)
      labelled as a suggestion                        (DSI-01)
4. Automatic progress note compilation per the provider's template
      history scopes populated from candidates        (patient level)
5. The physician adds S, O, treatment, plan           (encounter level)
6. Coverage shows what is still missing
7. The physician validates the candidates             validated = true + audit
      ⚠ an unvalidated candidate NEVER reaches the signed progress note
8. Signature                                          status: final  (AMD-01)
9. Outputs from the same pipeline:
      (a) plain text  → clipboard → foreign EHR       [overlay]
      (b) structured FHIR                             [on our side]
      (c) reports, referrals, consents                [a different slotKey]
```

The safety core of the flow is **step 7**. The output of both OCR and AI extraction is a
suggestion, not a record. The transition from suggestion to record is a deliberate act of
the physician and is recorded.

## 5. The microservice boundary

| Layer | Content | Where it lives |
|---|---|---|
| **Engine (generic)** | renderer, formatters, registries, adapters, UI picker | `@hilbi/summary-templates` |
| **Domain** | tokens, mappings, domain formatters, bootstrap | a plug-in per domain |
| **Domain `core`** | SOAP + history scopes for general outpatient practice | **new, needs to be built** |

The cockpit is not SM. It needs its own `core` domain plug-in whose tokens are
**generated from our clinical model**, not written by hand — otherwise a second taxonomy
appears.

## 6. Risks

| Risk | Consequence | Mitigation |
|---|---|---|
| The template becomes a store | loss of FHIR structure, a return to plain text | §3.1 — a section is a view |
| History inside the progress note | rewritten at every visit | §3.2 — the patient level |
| Unverified OCR output in a signed record | clinical and legal exposure | §4 step 7 — quarantine |
| A non-conformant user template | invalid output | §3.4 — a gate on save |
| Hand-written tokens | a second taxonomy | §5 — generate from the model |
| Templates proliferating without governance | unmaintainable | template versioning and ownership |

## 7. Normative consequences — ADOPTED INTO `cp-17` v1.1

> **Status: approved and transferred.** The rules below are **normative** as of `cp-17`
> v1.1 (`cp-17` §9 Templates, §10 Intake through Hilbi IQ, §11 Module integration).
> The binding wording is in `cp-17`; here they remain only as the context of the analysis.

- **TPL-01** A template determines the form of the output and is NEVER a place where data
  is stored. A template section selects and orders items; the items carry their own FHIR
  identity.
- **TPL-02** On saving, a template MUST be validated against the mandatory market minimum.
  An invalid template MUST NOT become active.
- **TPL-03** The document type, the provider template and the market rules are three
  independent axes. The market NEVER selects the template; the market determines the
  minimum and the code systems.
- **TPL-04** History scopes belong at the patient level and the template projects them.
  They MUST NOT be stored as part of the encounter.
- **INT-01** The output of OCR and AI extraction is created as a **candidate**
  (`validated=false`), attributed to the agent Hilbi IQ and labelled as a suggestion.
- **INT-02** An unvalidated candidate MUST NOT reach a signed progress note. Validation is
  a deliberate act of the physician and is recorded (`Provenance`, `AuditEvent`).
- **INT-03** Coverage (filled versus missing fields) MUST be visible before signature.

## 8. Integration model — Dash and Care Plan

- **Dash is the system of record.** The Care Plan store is **derived** (a projection or
  cache), not an equal source. The invariant: **no clinical fact may exist only in the
  Care Plan.** Without it, the requirement "if the Care Plan goes away, everything remains
  in Dash" does not hold.
- **Communication exclusively through an API.** No direct access into a foreign database.
  Synchronisation rules are completed at integration time (following `core-12`).
- **The Care Plan is integrated through an iFrame** — it is a *replaceable surface*, not a
  dependency.

Consequences that must be designed, not assumed:

| Topic | Question |
|---|---|
| Authentication across the boundary | third-party cookie restrictions; both applications sit under `hilbi.com`, the mechanism needs designing |
| Who renders the template surface | if the Care Plan sits inside an iFrame it needs our components and tokens **as a package** — this depends on `tokens.json` (DTCG) |
| Provenance across the boundary | an action in the iFrame MUST create a `Provenance` in Dash; the API carries the agent, the role and the purpose-of-use |
| Contract versioning | the surface and the API evolve independently — a contract version is required |

## 9. IQ entry points

IQ enters the progress note in three ways. All are subject to `INT-01` and `INT-02` — the
output is a **candidate**, not a record.

| Entry | Description |
|---|---|
| **Pre-population from a repeat visit** | carrying content over from the previous encounter |
| **Completion through speech-to-note** | transcription of speech into slots |
| **Creation from a recording** | an entire progress note assembled from audio |

### 9.1 Risk: cloned documentation

Carrying content over from a previous visit is the well-known problem of cloned
documentation — a finding appears in the record that nobody performed that day. In the US
it is an audit red flag; through the E/M level it leads to overstated claims. Because the
claim is **derived from clinical data** (`cp-15`, BILL), carried-over content would inflate
the level artificially.

Mitigation:

- **INT-04** An item carried over from a previous encounter MUST be visibly marked as
  carried over, MUST be confirmed **item by item** (never in bulk), and its `Provenance`
  MUST carry the source encounter — not today's observation.
- **INT-05** A carried-over and unconfirmed item MUST NOT count towards the derivation of
  the claim.

### 9.2 Risk: a recording is personal data

- **INT-06** Recording a consultation requires the patient's consent; the scope and form
  of consent are governed by the market.
- **INT-07** It MUST be decided whether audio is **retained or discarded** after
  transcription, and whether the recording forms part of the medical record. Until that
  decision, audio is not retained.

## 10. The provider's template set

One template does not produce both a progress note and a referral — those have different
`slotKey` values. The physician uploads a **set of templates** with a shared style and
section naming (`provider profile`). The progress note and its exports are the same
template through two renderers (§3.5).

## 11. Open points

- The scope of the `core` domain — which history scopes are in the base set and which are
  optional.
- The import format of a provider template (pasting text versus a wizard).
- Ownership and versioning of templates at organisation versus physician level.
- Whether codes are inserted into the textual output by default, or per template.
- Persistence of candidates before validation and their retention if the physician does
  not validate.
- Synchronisation rules between Dash and the Care Plan, and conflict resolution.
- The authentication mechanism across the iFrame boundary.
- Consent to recording and audio retention (`INT-06`, `INT-07`) — decided by compliance.
- Packaging of the template surface and tokens for consumption in the Care Plan.

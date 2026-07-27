---
doc_id: TBD (assign per gsr-13)
title: "Report conformance — shell, terminology, signature, provenance, AI transparency"
version: 2.1-draft
date: 2026-07-23
authority: "proposed by: Patrik (CEO) · approved by: Roman (CBO) · applied by: Dominika/Viktor · checked by: Marek"
type: normative
ssot_for: "system role (overlay/core), report shell, terminology binding, signature and amendment, provenance and audit, consent on sharing, transparency of AI suggestions"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: draft — awaiting approval (Roman) and compliance review (Marek)
related: [cp-15-tech-soap-case-billing-standard, cp-16-tech-records-simple-note-analysis, cp-18-tech-report-lifecycle, cp-19-tech-templates-intake-analysis, core-01-tech-clinical-core-standard]
language_note: "English is authoritative (D17). Translated from the Slovak original on 2026-07-24 with no semantic change; verified by check_translation.py — rule set, order, modality, cross-references and code identifiers unchanged. Section 16 was additionally reviewed by hand, as it describes implementation status rather than a rule."
---

# Report conformance

Purpose: to lock down the rules that make the cockpit's output acceptable to healthcare
providers in the US, the EU and India. `cp-15` defines the **record model** (SOAP, case,
billing derivation). This document defines **what may happen to that record** — how it
is coded, signed, versioned, audited and shared, and how the contribution of AI is
declared.

Scope: the clinical report and its lifecycle. Out of scope: the Records library
(deferred per `cp-16`), MDR classification (decided by Marek).

---

## 1. System role — overlay versus core

> **Continuity.** This position is not new. The Care Plans Standard locked it in **A1
> "Position: orchestrator, not an EHR"** — Hilbi is not a system of record; the EHR/NIS
> is the master of the clinical record. The rules below elaborate it for the report layer.

- **REP-01** Hilbi is **by default in the overlay role** (an orchestrator over the
  provider's existing system). The `core` role is an **opt-in configuration**, NOT the
  default.
- **REP-02** In `overlay` mode the authoritative signed record lives in the host system
  (the system of record). Hilbi compiles, presents for confirmation and writes back.
  In this mode Hilbi MUST NOT claim the role of system of record.
- **REP-03** In `core` mode the authoritative artefact is the Hilbi `Composition`.
  Switching to `core` MUST be accompanied by connecting the certification layer required
  by the market's regulation (EU: the EHDS CE regime for EHR systems · US: certified
  Health IT · IN: ABDM).
- **REP-04** The transition `overlay → core` MUST be a change of configuration and a
  connection of services, NEVER a rewrite of the data model. Every rule in this document
  applies identically in both modes; only the location of the authoritative signature
  differs.
- **REP-05** The current mode MUST be declared on the render (visibly, not hidden in
  configuration).

## 2. Report shell

- **REP-06** A report HAS a single shell: header (identity) · body (slots) · footer
  (signature, profile, mode, status). The chrome is defined **once**; report types
  differ by the selection and format of slots, NEVER by duplicating the header or footer.
- **REP-07** Identity is read **from context**, NEVER hard-coded. It carries the
  identifiers of the market: IN `ABHA` (patient), `HPR` (physician), `HFR` (facility) ·
  US `MRN`, `NPI` · EU the national identifier.
- **REP-08** The render MUST declare the target **document profile** of the market
  (IN: ABDM Prescription / OPConsultation · EU: EEHRxF · US: US Core / C-CDA).
- **REP-09** `SOAP-08` applies: one data object, several templates, no branching on
  content. A template is a format, not different content.

## 3. Terminology

- **TERM-01** Clinical content intended for machine processing MUST be coded. A code
  field MUST NEVER contain free text.
- **TERM-02** **Dual coding.** The record is coded with a reference terminology
  (**SNOMED CT**), the claim with a statistical classification (**MKCH-10 / ICD-10 /
  ICD-10-CM** depending on the market). These are two layers, NOT alternatives.
- **TERM-03** The narrative is NEVER lost. The binding is the FHIR `CodeableConcept` =
  `coding[]` **+** `text`; the physician's wording remains in `text`. A signed document
  MUST carry a human-readable narrative (`Composition.text`).
- **TERM-04** Binding by SOAP slot:
  - **A** — `SNOMED CT` (record) **+** the market classification (claim), mandatory
  - **O** — `LOINC`
  - **P** — `SNOMED CT` + the market's medication system (`ATC` for EU/IN, `RxNorm` for US)
  - **S** — predominantly narrative; it MUST NOT be forced into a code
- **TERM-05** The code is created **at capture**. Deriving a code from free text at
  render time is NOT acceptable as a production mechanism.
- **TERM-06** Code selection is a **search over a ValueSet** bound to the field, the
  speciality and the market (`$expand` / `$validate-code`). Selecting from an entire
  code list through a `select` is NOT acceptable.
- **TERM-07** ValueSets, maps and the medication system differ per market through
  `market_rules` — configuration, not a code branch (an extension of `SOAP-09`).
- **TERM-08** An uncoded item MUST be visually acknowledged. Silently skipping an
  uncoded item is NOT acceptable.
- **TERM-09** The use of SNOMED CT MUST be registered with the national release centre
  (SK: NCZI). In member countries use carries no licence fee; for non-member territories
  the affiliate regime applies.

## 4. Signature

- **SIG-01** The signature level is a property of the market in `market_rules`
  (EU: eIDAS advanced/qualified · US: e-signature per HIPAA and state law ·
  IN: IT Act / ABDM).
- **SIG-02** The signature validates the minimum set of slots per `SOAP-06`.
- **SIG-04** Signature authentication calls a **regional verification function chosen by
  market**. The implementation is on the backend; the frontend holds only the seam and
  the result.
- **SIG-05** If a market has no specific requirement, the internal mechanism is used:
  verified patient registration, 2FA at login and a **time-stamped PIN**.
- **SIG-06** A time-stamped PIN is evidence of **authentication and audit**, NOT a
  qualified electronic signature. Markets requiring AdES/QES MUST have the regional
  function connected (`SIG-01`); without it a document MUST NOT be presented as legally
  signed.
- **SIG-07** The mechanism used, its result and the time are recorded in `Provenance`
  and `AuditEvent` — this is the evidence for ISO and other certifications.
- **SIG-03** In `overlay` mode Hilbi **presents and records** the signature; the legally
  valid signature is performed by the host system. Hilbi MUST NOT present its own UI
  state as a legally valid signature.
- **SIG-08** An uploaded **stamp or signature image is a visual artefact, not a
  signature**. It satisfies none of the mechanisms in `SIG-01` (eIDAS QES, IT Act e-sign,
  HIPAA e-sign). Therefore: the image MUST be drawn **above the signature rule and never
  instead of it**; the rule MUST remain; and the interface MUST state that the mark is
  not an electronic signature. A stamp is issued to the physician — the system MUST NOT
  generate one.
- **SIG-09** A stamp or signature image is **personal data** and, for a signature,
  biometric-adjacent. It is frozen into the snapshot (`AMD-06`), enters the content
  fingerprint, and travels with every share and export. Retention and the lawful basis
  follow the document, not the account: removing the mark from the facility settings
  MUST NOT alter documents already signed.

## 5. Amendment

- **AMD-01** `Composition.status` moves through `preliminary` → `final` (first
  signature) → `amended` (every subsequent version).
- **AMD-02** A signed record is **immutable**. Correction is performed by **addendum**,
  NEVER by silent editing.
- **AMD-03** The original MUST be preserved and traceable at every revision.
- **AMD-04** Every revision MUST carry a reason for correction and its own `Provenance`
  record.
- **AMD-05** A signature **freezes the content**. From that moment a signed document is
  read exclusively from the snapshot and is NEVER assembled from live data.
- **AMD-06** The snapshot freezes three layers: **versioned references to clinical data**
  (`Observation/123/_history/2`), the **rendered narrative** (`Composition.text` — what
  the physician read and attested) and the **context** (the template and its version, the
  organisation header, identity, document language, market, code systems, `overlay`/`core`
  mode).
- **AMD-07** Narrative and structure are **both** frozen. Structure alone is not enough —
  re-rendering with a newer renderer may produce output different from what was signed.
  The **narrative** is authoritative for what was attested.
- **AMD-08** The snapshot carries a **content fingerprint** (SHA-256 in production),
  recorded in `Provenance` and in `DocumentReference.content.attachment.hash`. It is
  evidence of the integrity of the document.
- **AMD-09** In `overlay` mode a snapshot is created as well — it is evidence of **what
  the system presented and what the physician confirmed** before writing to the host
  system; it is labelled with the mode. The authoritative signature nevertheless remains
  in the host system (`REP-02`).

## 6. Provenance and audit

- **PROV-01** Every creation or change of clinical content MUST generate a
  `Provenance`: agent, role, time, activity, target.
- **PROV-02** Roles: `author` (write) · `attester` (signature, addendum) ·
  `verifier` (confirmation of the claim).
- **PROV-03** Content proposed by AI MUST be attributed to the agent **Hilbi IQ**, never
  implicitly to the physician. Confirmation by the physician is recorded as a separate
  act.
- **AUD-01** Every access, export or share MUST generate an `AuditEvent` with a
  **purpose-of-use**.
- **AUD-02** The audit log MUST be persistent, immutable and tamper-evident. A log held
  only in session memory does NOT conform to this standard.
- **AUD-03** Audit retention is governed by the market and determined by compliance
  (US: HIPAA · EU: EHDS + GDPR · IN: DPDP; India additionally requires a security audit
  by a CERT-In empanelled auditor for ABDM certification).

## 7. Consent and sharing

- **CNS-01** Sharing outside the treatment context MUST carry a consent context. A
  button without a consent context is NOT acceptable.
- **CNS-02** **IN** — sharing is bound to the ABDM Consent Manager: explicit,
  time-limited and revocable patient consent. A federated model: the record stays with
  its originator.
- **CNS-03** **EU** — purpose-of-use per EHDS, including the patient's right to restrict
  access.
- **CNS-04** **US** — info-blocking rules and an access-restriction function.
- **CNS-05** Only a **signed version** may be shared, never a draft.

## 8. AI transparency (DSI)

- **DSI-01** Every AI output MUST be labelled as a **suggestion**.
- **DSI-02** A suggestion MUST declare: the type of mechanism (rule versus model), the
  version, the inputs and the logic.
- **DSI-03** AI NEVER writes silently. A write is created exclusively by the physician's
  confirmation (consistent with `SOAP-10`, `BILL-02`).
- **DSI-04** An AI output MUST NOT be presented as a diagnostic decision. The boundary
  between suggestion and decision is also the boundary against MDR — compliance assesses it.
- **DSI-05** A change to the version of the suggestion logic MUST be recorded and visible.

## 9. Templates

- **TPL-01** A template determines the **form** of the output and is NEVER the place
  where data is stored. A template section selects and orders items; the items carry
  their own FHIR identity.
- **TPL-02** On saving, a template MUST be validated against the mandatory minimum of
  the market. An invalid template MUST NOT become active.
- **TPL-03** The document type (`slotKey`), the provider template and the market rules
  are **three independent axes**. The market NEVER selects the template — the market
  determines the minimum and the code systems.
- **TPL-04** History scopes (personal, allergy, family, social, pharmacological and
  occupational history) belong at the **patient level**; the template projects them into
  the document. They MUST NOT be stored as part of the encounter.
- **TPL-05** The template surface is **domain-neutral**. It MUST NOT contain
  domain-specific sections hard-coded; it renders what the registry and the domain
  plug-in supply.
- **TPL-07** A document has three layers with different lifecycles: **header and footer**
  (the organisation), **body** (the template), **consent** (the registry). A template
  NEVER carries the header hard-coded — a change to facility data must appear in every
  document at once.
- **TPL-08** Extracting a template from an uploaded sample obtains **structure only**.
  Values (patient data) and the source image MUST NOT be stored. The sample is
  processed and discarded.
- **TPL-09** Recognised labels are mapped to canonical sources through an **alias map**.
  The mapping is a SUGGESTION confirmed by the physician (`DSI-01`); it is NEVER applied
  silently.
- **TPL-10** A template obtained by extraction passes through the same gate as one
  created by hand (`TPL-02`).
- **TPL-11** History scopes are labelled with the established abbreviations of clinical
  practice (RA, OA, AA, FA, SA, PA, GA). Each scope corresponds to a separate FHIR
  resource and belongs at the patient level (`TPL-04`); the label in the template is only
  a form.
- **TPL-16** Templates have **three ownership scopes**: `system` (supplied, read-only),
  `provider` (the healthcare facility) and `my` (the physician). The scope determines who
  may change the template. A system template cannot be overwritten — a copy is made
  from it.
- **TPL-12** The wording of informed consent is a **legal artefact** and belongs to the
  consent registry, NOT to the template. The registry keeps the **version and effective
  date** of every wording.
- **TPL-13** Consent MUST be issuable in both forms from a single source: as a
  **standalone document** and as a **section at the end of the report** (common practice
  and a requirement of older systems). The template determines only the placement.
- **TPL-14** The document MUST carry **which version of the wording** was presented to
  the patient. A signed consent without identification of the wording version is NOT
  evidential.
- **TPL-15** The mandatory market minimum (`TPL-02`) applies to the **clinical document**.
  Consent has its own rules and does not count towards clinical completeness (`INT-03`).
- **TPL-17** A section source may be a **subset of a SOAP slot**, distinguished by
  category or code (for example `exam-neuro`, `labs` and `dx-coded` are all content of
  the `O`/`A` slots). Real reports separate these layers and the physician perceives them
  as distinct sections. Two sections bound to the **same** source MUST NOT display the
  same content twice — if the document separates them, a separate source must exist.
- **TPL-18** The prose assessment (`A`) and the **coded list of diagnoses** (`dx-coded`)
  are distinct sources. The coded list carries the market classification (`TERM-02`); the
  prose does not.
- **TPL-19** The signature block has three layers: the **identity of the signatories**
  (name, role, code) belongs to the **organisation**, the **selection of signatories for a
  given document** belongs to the **template**, and the **signature itself** is a runtime
  act (`SIG-*`). A template NEVER carries a signatory's name hard-coded — a change of
  staff would otherwise require rewriting every template.
- **TPL-06** A template defines sections and bindings; **renderers are interchangeable**
  (structured and textual). The textual output serves transfer into a foreign system and
  MAY carry codes depending on the template's configuration.

## 10. Intake through Hilbi IQ

- **INT-01** The output of OCR and AI extraction is created as a **candidate**
  (`validated=false`), attributed to the agent Hilbi IQ and labelled as a suggestion.
- **INT-02** An unvalidated candidate MUST NOT reach a signed document. Validation is a
  deliberate act of the physician and is recorded (`Provenance`, `AuditEvent`).
- **INT-03** Coverage — which sections are filled and which are missing — MUST be visible
  before signature.
- **INT-04** An item carried over from a previous encounter MUST be visibly marked as
  carried over, MUST be confirmed **item by item** (never in bulk), and its `Provenance`
  MUST carry the source encounter — not today's observation.
- **INT-05** A carried-over and unconfirmed item MUST NOT count towards the derivation of
  the claim.
- **INT-06** Recording a consultation requires the patient's consent; the scope and form
  are governed by the market.
- **INT-07** It MUST be decided whether audio is retained or discarded after
  transcription, and whether it forms part of the medical record. Until that decision,
  audio is NOT retained.

## 11. Module integration

- **SYS-01** Dash is the **system of record**. The store of an integrated module (for
  example Care Plan) is **derived** — a projection, not an equal source.
- **SYS-02** A clinical fact MUST NOT exist only in an integrated module.
- **SYS-03** Communication between Dash and an integrated module happens **exclusively
  through an API**. Direct access into a foreign database is NOT acceptable.
- **SYS-04** An action performed in an integrated surface MUST create a `Provenance` in
  Dash. The API therefore carries the agent, the role and the purpose-of-use — the audit
  MUST NOT end at the module boundary.

## 12. Store

- **STO-01** The store sits **behind an interface**. Calling code MUST NOT write directly
  into the data structure; writes happen exclusively through the store interface.
- **STO-02** The adapter is interchangeable without changing the calling code
  (memory → REST → Core).
- **STO-03** Collections with a natural key (documents by `masterIdentifier`, templates
  by `id`) are written by **upsert**; the audit is **append-only** and NEVER overwrites an
  existing record.
- **STO-04** **Browser storage is not used** for clinical data or for the audit. Dash is
  the system of record (`SYS-01`) and the audit must be persistent, immutable and
  tamper-evident (`AUD-02`); client storage satisfies neither.
- **STO-05** The adapter in use and the state of the collections MUST be **visible** in
  the prototype, so that what production has to replace is evident.

## 13. Document identity

- **DOC-01** A clinical document MUST have a **`masterIdentifier`** (URN UUID) that is
  **stable across every version and addendum**. This is the identity of the *document*,
  not of a version.
- **DOC-02** Identity is created **when the document is started**, that is already for a
  draft — so that it can be referenced before signature.
- **DOC-03** Every version has its own `Composition.id` and shares the
  `masterIdentifier` with the other versions of the same document.
- **DOC-04** The **human-readable number** (for example `FNT-2026-000123`) serves the
  printed document and reference outside the system. It is assigned only at the **first
  signature** and does NOT change thereafter — an addendum carries the same number. A
  discarded draft never receives a number.
- **DOC-05** Identity is **frozen into the snapshot** (`AMD-06`) and written into
  `Provenance` and `AuditEvent`. An audit without the document identity is not traceable.
- **DOC-06** The timeline and Records display **the same document** through its
  `masterIdentifier`. A copy of the document for the second view is NOT acceptable.
- **DOC-07** The identity of a clinical document is a **different layer** from the
  `doc_id` of the knowledge base per `gsr-13` (the documentation identifier).
  They MUST NOT share a scheme or a number series.

## 14. Language and localisation

- **I18N-01** The language-neutral layer is the **code**, not a translation. No natural
  language is the SSOT; English has no special standing.
- **I18N-02** The **interface language**, the **document language** and the **patient
  language** are three independent axes. The interface language NEVER determines the
  document language.
- **I18N-03** The document language follows from the **provider's jurisdiction**, is
  confirmed in the facility settings and is **stamped onto the document when it is
  created**. It is not looked up at display time — a later change of settings MUST NOT
  rewrite the language of older documents.
- **I18N-04** System templates are localised. Provider and personal templates are **not
  translated** — their labels go onto the printed document.
- **I18N-05** **Metadata and taxonomy** (document type, category, navigation labels,
  states, tags) are localised **through the display term of the code** in the target
  language, NOT by machine-translating a string.
- **I18N-06** The same section label has two uses: in the **document** it is rendered in
  the document language, in **navigation** in the interface language. Internal keys are
  therefore language-neutral and the abbreviations (`OA`, `AA`, `RA`) are only their
  display form.
- **I18N-07** The **body of the report** stays in the language in which it was created. A
  translation is available **on request** in the document detail (language selection) and
  is shown with a notice.
- **I18N-08** A translation on request is a **reading aid**: it is not stored as a
  document, does not replace the original, **does not inherit the signature** and is not
  exported without a label. The original remains authoritative.
- **I18N-09** Clinical content is NEVER machine-translated without a request.
- **I18N-10** A foreign document taken onto the timeline MUST NOT be altered. A
  translation may be added alongside it, never in its place.
- **I18N-11** The consent registry is keyed by **`(id, ver, lang)`**. Every
  language version is a separately approved wording, NOT a translation. Consent is NEVER
  machine-translated; if an approved wording does not exist in the patient's language, it
  must not be used.
- **I18N-12** Where a translation is missing, the **original is shown with a note**.
  Never an empty value and never a silent machine translation.
- **I18N-13** Printing and export always happen **in the document language**, regardless
  of the interface language.
- **I18N-14** Formatting of numbers, dates and units follows the **locale**, not the
  language. It is clinically sensitive (the decimal separator in dosing, the order of
  date components).
- **I18N-15** A request for translation is recorded in an `AuditEvent`, including the
  tool and the time.

## 15. Market matrix

| Layer | EU | US | IN |
|---|---|---|---|
| Document profile | EEHRxF | US Core / C-CDA | ABDM Prescription / OPConsultation |
| Record (reference) | SNOMED CT | SNOMED CT | SNOMED CT |
| Claim (classification) | MKCH-10 (SK) / ICD-10 | ICD-10-CM | ICD-10 |
| Laboratory | LOINC | LOINC | LOINC |
| Medication | ATC | RxNorm | ATC |
| Signature | eIDAS AdES/QES | HIPAA e-signature | IT Act / ABDM |
| Identity | national identifier | MRN, NPI | ABHA, HPR, HFR |
| Consent | EHDS purpose-of-use | info-blocking | ABDM Consent Manager |
| Certification (`core` mode) | EHDS CE regime | certified Health IT | ABDM + CERT-In audit |

## 16. State of the prototype against this standard

The prototype (`index.html`, v129) implements **structure**; the following points are
deliberate placeholders and do NOT conform to the standard:

| Rule | State |
|---|---|
| TERM-05, TERM-06 | ✗ the code is derived by regex at render time; the capture-side picker is missing |
| TERM-01..04, TERM-08 | ✓ dual coding structure, narrative preserved |
| AUD-02 | ✗ the audit log lives only in session memory |
| SIG-01, SIG-03 | ~ the level is declared, signature integration is missing |
| AMD-01..03 | ✓ · AMD-04 ✗ (the reason for correction is not collected) |
| PROV-01..02 | ✓ · PROV-03 ~ (AI attribution is not consistent) |
| CNS-01..05 | ~ the consent context is declared, the dialogue is missing |
| DSI-01..04 | ✓ · DSI-05 ✗ |
| REP-01..08 | ✓ |
| REP-07 | ✓ v164 — Provider and Practice are separate levels; the practice is resolved from context through `practiceOf()`, not held in a flat field |
| REP-09 | ✓ |
| TPL-01, TPL-03, TPL-05, TPL-06 | ✓ domain-neutral registry, three axes, two renderers |
| TPL-02 | ✗ validation of a template against the market minimum is missing |
| TPL-04, TPL-11 | ✓ RA/OA/AA/FA/SA/PA/GA at the patient level, mapped to FHIR resources |
| TPL-07 | ✓ header and footer in the organisation settings |
| TPL-08..10 | ✓ extraction from a sample: structure only, mapping as a suggestion, the TPL-02 gate |
| TPL-16 | ✓ three ownership scopes, system templates read-only · preview in two surfaces, a side column and an A4 sheet at true format (v168), both from one body function so they cannot diverge |
| TPL-17, TPL-18 | ✓ `exam-neuro`, `labs`, `dx-coded` as subsets of slots |
| TPL-19 | ✓ v164 — signatory identity sits on the **Practice** (`PRACTICES[].signatories`), with Provider-level roles added by `sigList()`; `tpl.signers` still selects. Before v164 a practice-level role appeared on every practice's documents · **the block itself was rendered only in the live draft until v169** — neither the template preview nor the frozen snapshot carried it, so a signed document had no signature block at all |
| TPL-12, TPL-13, TPL-15 | ✓ consent registry, both forms from one source, type-sensitive validation |
| TPL-14 | ~ the wording version is displayed; the binding to a signed `Consent` is missing |
| INT-03 | ✓ coverage |
| INT-01, INT-02, INT-04..07 | ✗ the intake layer is not built yet |
| SYS-01..04 | ✗ the integration is not built yet |
| SIG-04..07 | ✗ the seam for regional verification does not exist yet |
| SIG-08, SIG-09 | ✓ stamp and signature upload per signatory (v169); marks render above the rule, which stays; the interface states they are not electronic signatures; frozen into the snapshot and into the fingerprint, so replacing a mark leaves signed documents untouched · the upload sits in the document footer on the template page (v170), listing only the signatories the template selects |
| I18N-01, I18N-02, I18N-06 | ✓ v166 — **English is the source language**; `I18N` maps an English key to each translation. A round trip is lossless over two cycles. Keys are still display strings rather than neutral identifiers; that remains open |
| I18N-09 | ✓ v166 — demo and clinical content (consent wording, patient instructions, sample findings) is never a translation key and is never machine-translated |
| I18N-03 | ✓ document language from the organisation settings, stamped into the snapshot |
| I18N-07, I18N-08, I18N-09 | ✓ translation on request as a reading aid with a notice |
| I18N-11 | ✓ consent registry keyed by `(id, ver, lang)`; a missing wording is acknowledged |
| I18N-12, I18N-15 | ✓ a missing translation shows the original · the request is logged |
| I18N-04, I18N-05 | ~ system templates only partly localised; the taxonomy does not yet draw on the code display term |
| I18N-10, I18N-13, I18N-14 | ✗ foreign documents, print language and locale formatting are not addressed yet |
| STO-01..05 | ✓ Store with five collections, in-memory adapter, writes exclusively through the seam |
| DOC-01..07 | ✓ masterIdentifier, versions, human-readable number at signature, `DOC_REG`, display on the timeline and in Records from one registry · **recorded as met from v158, in fact broken until v167**: a duplicate `doc:` key in `rptSnapshot()` overwrote the identity with the market document profile, so `DOC_REG` held `master: undefined` and `DOC-06` did not hold in either view |
| AMD-05..09 | ✓ snapshot at signature, render exclusively from the snapshot, content fingerprint · versioned references are values in the prototype |

## 17. Open points

- **Marek** — the MDR boundary for Hilbi IQ (`DSI-04`); the scope of the EHDS CE regime
  and the Cyber Resilience Act when moving to `core` mode; the signature level per market
  (`SIG-01`); audit retention (`AUD-03`); India CERT-In.
- **Registering the use of SNOMED CT** with NCZI (`TERM-09`).
- **Selecting a terminology server** for `$expand` / `$validate-code` (`TERM-06`).
- **Audit persistence** — designing an immutable, tamper-evident store (`AUD-02`).
- **`doc_id`** assignment per `gsr-13`.

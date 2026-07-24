# Dev Summary — cockpit and report layer

> **Authority: INFORMATIVE.** Quick orientation for the dev team. Non-binding — the
> binding sources are `docs/cp-17-tech-report-conformance-standard.md` (report
> conformance) and `docs/cp-15-tech-soap-case-billing-standard.md` (record model).

## 1. What we are building (one sentence)

**An orchestrator, not an EHR.** The cockpit consolidates the course of care and
connects the clinical side with the patient; by default it runs as an **overlay** on
the provider's system, which remains the master of the clinical record. The `core`
role (Hilbi as the system of record) is opt-in and carries a per-market certification
layer.

## 2. Compilation chain

```
Events  →  Progress note  →  Report  →  Records
```

- **Events** — atomic physician actions, each with one SOAP slot. **The single source
  of truth.**
- **Progress note** — continuous compilation of events into a FHIR `Composition`
  (sections S/O/A/P), running in the background. It is not a form.
- **Report** — a *render* of that `Composition` → `DocumentReference`. One data object,
  several templates (Rx slip / full report), **no branching on content**.
- **Records** — a library of artefacts, a wrapper referencing events. Not a second
  write channel. Implementation deferred (`cp-16`).

## 3. Per-market configuration

`market_rules` (the `MKT` object in the prototype) is **configuration, not a code
branch**. It carries: the minimum signature set, the render template, the document
profile, the signature level, the identity label, and the code systems (record /
claim / medication / laboratory).

| | EU | US | IN |
|---|---|---|---|
| Profile | EEHRxF | US Core / C-CDA | ABDM Prescription / OPConsultation |
| Record | SNOMED CT | SNOMED CT | SNOMED CT |
| Claim | MKCH-10 / ICD-10 | ICD-10-CM | ICD-10 |
| Medication | ATC | RxNorm | ATC |
| Signature | eIDAS AdES/QES | HIPAA e-signature | IT Act / ABDM |
| Identity | national identifier | MRN, NPI | ABHA, HPR, HFR |

**If an `if (market === …)` appears in logic, that is a defect** — it belongs in
configuration.

## 4. Map: rule → where in the code (`index.html`)

| Area | Normative ID | Symbol in the code |
|---|---|---|
| System role | `REP-01`, `REP-02`, `REP-05` | `RPT_MODE`, `rptModeNote()` |
| Report shell | `REP-06` | `reportShell()` |
| Identity | `REP-07` | `RPT_ID`, `rptIdLine()` |
| Provider and Practice | `REP-07`, `TPL-19` | `ORG` (Provider) · `PRACTICES` · `practiceOf()`, `practiceName()`, `sigList()` |
| Document profile | `REP-08` | `MKT[…].doc` |
| Template registry | `REP-09`, `TPL-05` | `TPL_REG` (domain-neutral), `rptSource()`, `rptSec()` |
| Template selection | `TPL-03` | `tplCur()`, `tplPick()` — the market supplies a default and a minimum, it does not choose |
| Coverage | `INT-03` | `tplCoverage()` |
| Two renderers | `TPL-06` | `rptSec()` (structure) · `rptPlain()` (clipboard text) |
| Item shape | `TERM-03`, `TERM-05` | `rptItem()` → `{slot, text, coding}` |
| Slot code binding | `TERM-04` | `TERM_BIND` |
| Dual coding | `TERM-02`, `TERM-03` | `codeChipsOf()`, `codeOf()` |
| ValueSet (demo) | `TERM-06` | `CODEMAP` |
| Acknowledged gap | `TERM-08` | the `.cd.none` class |
| Signature level | `SIG-01` | `MKT[…].sig` |
| Versions and addendum | `AMD-01..03` | `RPT_VERS`, `rptStatus()`, `rptSaveVersion()` |
| Provenance | `PROV-01`, `PROV-02` | `logProv()` |
| Audit | `AUD-01` | `logAudit()` |
| Consent on sharing | `CNS-01..05` | `rptShare()` |
| AI transparency | `DSI-01..04` | `DSI`, `dsiHTML()` |
| Freeze at signature | `AMD-05..09` | `rptSnapshot()`, `snapShellHTML()`, `rptHash()` |
| Neutral source keys | `I18N-01`, `I18N-06` | `TPL_SRC` (`hist-past`, `allergies`…), `SRC_DISP` |
| Two language axes | `I18N-02` | `srcAbbr()` = document language · `srcName()` = interface language |
| Document language | `I18N-03` | `ORG.lang`, `docLang()`, stamped into the snapshot |
| Translation on demand | `I18N-07`, `I18N-08` | `TR_LANG`, `trSet()`, `trBarHTML()` |
| Consent per language | `I18N-11` | `CNS_REG` `(id, ver, lang)`, `cnsPick()` |
| Sources as slot subsets | `TPL-17`, `TPL-18` | `ENC_SRC` — `exam-neuro`, `labs`, `dx-coded` |
| Store | `STO-01..05` | `Store`, `STORE_COLL`, `STORE_KEY`, `storeBadgeHTML()` |
| Document identity | `DOC-01..07` | `docNew()`, `docAssignHuman()`, `DOC_REG` |
| One document, two views | `DOC-06` | `renderDocViews()`, `docOpen(master)` |
| Signature block | `TPL-19` | `ORG.signatories` (identity) · `tpl.signers` (selection) · `sigBlockHTML()` |

## 5. What production must replace

The prototype implements **structure**. These are deliberate placeholders — the full
list and status is in `cp-17` §10:

| Prototype | Production |
|---|---|
| `CODEMAP` — regex rules | a terminology server, `$expand` / `$validate-code` over a ValueSet |
| the code is derived at render time | **the code is created at capture** (capture-side picker) — `TERM-05`, `TERM-06` |
| the `AUDIT` array in memory | a persistent, immutable, tamper-evident log — `AUD-02` |
| the snapshot holds values | versioned references `Observation/123/_history/2` — `AMD-06` |
| `rptHash()` (djb2) | SHA-256 in `DocumentReference…hash` — `AMD-08` |
| the `TR_DEMO` dictionary | a translation service with an `AuditEvent` record — `I18N-15` |
| the in-memory `Store` adapter | a REST or Core adapter — `STO-02`; calling code does not change |
| signature as a UI state | per-market signature integration — `SIG-01` |
| the footer declares FHIR objects | real emission of `Composition` / `DocumentReference` / `Provenance` |
| sharing as a notice | a consent dialogue with purpose-of-use — `CNS-01` |

**The most important of these is capture-side coding.** Deriving a code from free text
at render time is architecturally backwards; the code belongs in the event, because
events are the SSOT. Adding interoperability to a system that was not designed for it
is a rebuild, not a patch.

## 5b. Section sources

A source is not the same thing as a SOAP slot — it is a **subset of a slot
distinguished by category**. This follows from real reports, which routinely separate
these layers.

| Source | Belongs to slot | FHIR | Coding |
|---|---|---|---|
| `S`, `O`, `A`, `P` | its own slot | `Composition.section` | per `TERM-04` |
| `exam-neuro` | `O` | `Observation` (examination category) | — |
| `labs` | `O` | `Observation` (laboratory, CSF) | LOINC |
| `dx-coded` | `A` | `Condition` | SNOMED + the market classification |
| `rx` | `P` | `MedicationRequest` | ATC / RxNorm |
| `fu` | `P` | `Appointment` | — |
| `hist-*`, `allergies`, `meds` | patient level | own sources (`TPL-04`) | per scope |

Adding a source means completing **all six** registers: `TPL_SRC`, `SRC_COVERS`,
`TERM_BIND`, `SRC_STYLE`, `SRC_DISP` and the resolver in `rptSource()`. The key
consistency gate verifies this.

## 6. Invariants

- Every write has a `Provenance`; every access and export has an `AuditEvent` with
  purpose-of-use.
- A signed record is immutable — correction exclusively by addendum, the original
  remains.
- The narrative is never lost: `CodeableConcept` = `coding[]` **+** `text`.
- AI never writes silently; a write is created by the physician's confirmation.
- Only a signed version is shared, and only with a consent context.
- The core never calls GitHub directly — GitHub is authoring, not runtime.
- From a provider sample only the **structure** is taken; clinical values, patient
  identity and third-party legal wording are never copied (`TPL-08`).

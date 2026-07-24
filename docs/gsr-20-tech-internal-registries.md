---
id: GSR-TECH-INTERNAL-REGISTRIES
title: Internal registries and code lists — owner, schema, versioning
collection: gsr
area: tech
type: reference
owner: patrik
status: draft
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [registries, code-lists, governance, backend, fhir]
related: [CARE-PLANS-STANDARD, cp-17, cp-15, core-01, GSR-TECH-KB, GSR-TECH-BE-PREP]
classification: Confidential — internal
---

# Internal registries and code lists

> **Authority: INFORMATIVE.** This document collects what is already binding elsewhere
> and adds the operational layer — owner, schema, versioning, change control. The
> normative source for each rule is named in the table. In a conflict the norm wins.

**Why this exists.** External terminologies are downloaded; the registries below must be
**designed, populated, versioned and governed by us**. They are the part of the platform
that no vendor supplies, they are currently spread across five normative documents and
the prototype, and none of them has a written owner.

**How to read the tables.** *Norm* is the rule that makes the registry binding.
*In code* is the symbol in the prototype today, or `—` where nothing exists yet.

---

## 1. Rules that apply to every registry

1. **One source of truth.** Before adding a map or constant, check whether one exists.
   Duplicated taxonomy is a recurring source of conflict (`CLAUDE.md` §2).
2. **Every registry is versioned.** An entry is never edited in place once referenced by
   a signed document; it is superseded. What a document referenced at signature must stay
   resolvable (`AMD-06`).
3. **Every registry has one named owner** who approves changes. Ownership is a person,
   not a team.
4. **A market is configuration, never a branch in logic** (`I32`). If a registry needs to
   differ per market, it gains a market dimension — it does not gain an `if`.
5. **Adding an entry updates every register that shares its key space in the same
   commit.** The section-source key space has six registers; completing five creates a
   silent gap (`CLAUDE.md` §3).
6. **Registries that feed the interface hold English keys.** Translations live in the
   translation layer, never in the registry (`D17`, v166).
7. **Change control:** a registry backing a normative rule follows K35 — proposed by
   Patrik, approved by Roman, checked by Marek. Others follow the owner's judgement.

---

## 2. Configuration and jurisdiction

| Registry | Norm | In code | Content | Owner |
|---|---|---|---|---|
| **Market profile** | `I32`, `I33` | `MKT` | Regulatory regime, data residency, default code systems, national identifiers, consent model, signature level, document profile, minimum signature set | Marek (rules) · Juraj (shape) |
| **Signature level per market** | `SIG-01` | `MKT[…].sig` | Which signature level a document type requires in a market | Marek |
| **Practices** | `REP-07`, `TPL-19` | `PRACTICES`, `practiceOf()` | A Provider may have several Practices; signatory identity belongs to the Practice | Patrik |

**Open:** the practice is resolved from a module-level `CUR_PRACTICE`. It must come from
the encounter once the case layer lands (`cp-15` CASE-04, where every event already
carries a department).

---

## 3. Clinical core

| Registry | Norm | In code | Content | Owner |
|---|---|---|---|---|
| **Obligation scale** | `B8` | — | `mandatory / recommended / optional` plus a `ConceptMap` to source scales (ERAS GRADE, ACC/AHA COR-LOE). Bidirectional `$translate`; **the source value is preserved** | clinical owner |
| **Evidence grade scale** | `B7` | — | Step attribute and its binding to the source | clinical owner |
| **Primitives** | `B10` | — | States `delivered, viewed, acknowledged, started, completed, met, recorded, skipped, declined, overdue, cancelled`; events `escalated, status_transition, verified`; metadata: planned and actual time, actor, role, source, attempt count | Viktor |
| **Phase catalogue** | `D15` | — | Phases of a care pathway | clinical owner |
| **Bound function catalogue** | `B7` | — | `bf:calculation`, `bf:order`, … | Viktor |
| **Card catalogue** | `D16` | — | 14 patient-surface card types; **a new type requires a new version of the standard** | Patrik |
| **Role catalogue** | `F21` | `ORG.signatories`, `PRACTICES[].signatories` | author / prescriber-activator / controller plus clinical roles | Patrik |
| **Outcome and variance definitions** | `F26` | — | `Measure` / `MeasureReport`, configurable | clinical owner |

**The largest gap in this document.** Everything in this section except roles exists only
as a normative rule; the prototype implements none of it. It is the prerequisite for
Care Plans and the Patient Guide.

---

## 4. Documents and report

| Registry | Norm | In code | Content | Owner |
|---|---|---|---|---|
| **Template registry** | `TPL-03`, `TPL-16` | `TPL_REG` | Templates in three ownership scopes: System (read-only), Facility, Personal | Patrik |
| **Section sources — six registers** | `TPL-17`, `I18N-01` | `TPL_SRC`, `SRC_COVERS`, `TERM_BIND`, `SRC_STYLE`, `SRC_DISP`, `rptSource()` | Offer · slot coverage · code binding · hierarchy · display per language · resolver | Viktor |
| **Document types** | `TPL-03` | `SLOTS` | `slotKey`: what is being created and from what it is filled | Patrik |
| **Document identity** | `DOC-01..07` | `DOC_REG`, `docNew()` | `masterIdentifier` (urn:uuid), version, human-readable number at first signature | Viktor |
| **Snapshots** | `AMD-05..09` | `rptSnapshot()` | Frozen content plus fingerprint; a signed version is never assembled from live data | Viktor |
| **Consent registry** | `CNS-01..05`, `I18N-11` | `CNS_REG` | Key `(id, ver, lang)`. Each language version is a separately approved wording, **never a translation** | Marek |
| **DSI registry** | `DSI-01..05` | `DSI`, `dsiHTML()` | Declared logic of every AI suggestion, with its version | Marek (boundary) · Viktor |
| **Storage collections** | `STO-01..05` | `Store`, `STORE_COLL` | `templates`, `documents`, `snapshots`, `audit`, `consents`; every write through the seam | Juraj |

**Note on the six source registers.** This is the registry that has already caused a
silent gap: `rx`, `fu` and `narr` were absent from `TERM_BIND` and `consent` from
`SRC_STYLE` until v166. `rx` mattered — `TERM-04` binds the P slot to SNOMED CT plus the
market medication system, so a prescription source with no binding was a conformance gap.

---

## 5. Content and language

| Registry | Norm | In code | Content | Owner |
|---|---|---|---|---|
| **Translation layer** | `D17`, `I18N-01` | `I18N`, `TR_SK`, `TR_EN` | English key → translation. Since v166 English is the source language; a round trip is lossless | Dominika |
| **Language axes** | `I18N-02`, `I18N-03` | `ORG.lang`, `docLang()`, `TR_LANG` | Interface, document and patient language are three independent axes | Dominika |
| **Questionnaire registry** | `C14` | — | Each scale a versioned `Questionnaire` with a LOINC code **and a mandatory licence field** — EQ-5D, SF-36, MMSE, MoCA and SDMT are commercially licensed | clinical owner · Marek |
| **Medication instruction library** | new | — | Patient advice bound to the active substance and the ATC class, with class → substance → product inheritance. Red flags are curated only | clinical owner |
| **Specialisation registry** | — | `SPECBY`, `specOf()` | The single source for physician titles and specialities everywhere in the interface | Patrik |
| **Knowledge base records** | `C11`, `C12` | — | Source, source version and **licence with runtime enforcement**: `verbatim` / `paraphrase` / `cite_only` / `internal_only` | Juraj |
| **Demo and clinical content** | `D17`, `GLOSSARY` §3 | consent bodies, sample findings, `ORG.addr` | Stays Slovak by decision; **never a translation key**, never machine-translated | Patrik |

---

## 6. Commerce and operations

| Registry | Norm | In code | Content | Owner |
|---|---|---|---|---|
| **Plan pricing** | `H31` | — | Net price excluding VAT, VAT separately, third-party discount, patient co-payment; per jurisdiction | Roman |
| **Usage logbook** | `F23` | — | Usage measurement, **separate from the clinical audit**, different retention and access | Juraj |
| **Clinical audit** | `AUD-01..03` | `AUDIT`, `logAudit()` | Append-only, immutable, tamper-evident, with purpose-of-use | Marek (retention) · Juraj |

---

## 7. What has no owner yet

Everything in §3 except the role catalogue, plus the questionnaire registry, the
medication instruction library and plan pricing. **Assigning owners is cheaper than
discovering later that a registry drifted because nobody was responsible for it.**

## 8. Open decisions

| Question | Owner |
|---|---|
| Owners for the registries listed in §7 | Roman |
| Does the practice come from the encounter, and when | Patrik + Viktor |
| Which PRO instruments we use and which we pay for | clinical owner + Marek |
| Retention of the usage logbook versus the clinical audit | Marek |
| Whether the obligation scale ships with ERAS GRADE mapped at launch | clinical owner |

---

*Owner: Hilbi Health Group (R&D). Markdown is the SSOT.*

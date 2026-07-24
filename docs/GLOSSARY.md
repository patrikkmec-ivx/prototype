---
id: GSR-OPS-GLOSSARY
title: Glossary — one English term per concept
collection: gsr
area: ops
type: reference
owner: patrik
status: active
version: 1.0
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [glossary, terminology, i18n, english]
related: [README.md, CLAUDE.md, GSR-OPS-NAMING]
classification: Confidential — internal
---

# Glossary

> **Authority: NORMATIVE for wording.** Every document, code comment, identifier and
> commit message in this repository uses the English term in the right-hand column.
> One concept, one word. Where this glossary and a habit disagree, the glossary wins.

**Why this file exists.** Eleven documents translated independently produce three
English words for one concept, and a reader who does not speak Slovak reads them as
three different things. Fixing the term once is cheaper than reconciling it later.

---

## 1. Language rule

| Layer | Language |
|---|---|
| Everything written down — documents, specifications, schemas, code, code comments, registers, changelogs, commit messages | **English** |
| Spoken and chat discussion | Slovak is fine |
| Clinical content authored by a physician | the physician's own language, reaching other languages through the translate area (`D17`) |
| Demo content listed in §3 | **Slovak by decision** |

This follows `D17` of the Care Plans Standard: the specification layer is
authoritative in English; any other language is a derived translation.

---

## 2. Terms

### Documents and records

| Slovak | English | Note |
|---|---|---|
| dekurz | progress note | keep the word `dekurz` only where it names the UI surface itself |
| správa | report | never "message" — a message is `Communication` |
| záznam | record | |
| záznamový model | record model | |
| zápis | write (verb) / record (noun) | disambiguate by context; never "entry" |
| dokument | document | |
| hlavička | header | a document header; a section title is a "heading" |
| pätka | footer | |
| snímka | snapshot | the frozen content at signature |
| zmrazenie obsahu | content freeze | |
| ľudské číslo | human-readable number | document numbering, assigned at first signature |
| dodatok | addendum | the only permitted correction mechanism |
| šablóna | template | |
| okruh vlastníctva | ownership scope | System / Facility / Personal |
| zdroj sekcie | section source | the `TPL_SRC` key space |
| podstránka | subpage | not "sub-site" |

### Clinical and plan model

| Slovak | English | Note |
|---|---|---|
| plocha | surface | clinician surface / patient surface |
| kokpit | cockpit | the product name — not "dashboard" |
| krok | step | a care step |
| fáza | phase | |
| cesta starostlivosti | care pathway | |
| poskytovateľ | provider | a healthcare provider |
| lekár | physician | "doctor" only in patient-facing copy |
| pacient | patient | |
| súhlas | consent | always the FHIR sense |
| podpis | signature | |
| podpisová úroveň | signature level | per market |
| účinná látka | active substance | |
| príbalový leták | patient leaflet | the EU PIL |
| súhrn charakteristických vlastností lieku | summary of product characteristics | SPC |

### System and process

| Slovak | English | Note |
|---|---|---|
| pravidlo | rule | a normative rule; carries an ID |
| norma | standard | the normative document |
| brána | gate | "sanity gate" |
| dlh | debt | "known debt" |
| stav | state | "status" only when it is a FHIR `status` |
| úroveň | level | |
| zdroj | source | |
| výstup | output | |
| vstup | input | |
| návrh | proposal / draft | in the `DSI` sense always **suggestion** |
| trh | market | a configuration value, never a branch in logic |
| prekryv | override | a market override |
| číselník | code list | internal and curated |
| terminologický server | terminology server | external code systems |
| úložisko | store | the persistence seam |
| perzistenčný seam | persistence seam | |
| jazyk dokumentu | document language | an axis independent of the interface language |
| jazyk rozhrania | interface language | |
| jazyk pacienta | patient language | a third, separate axis |
| prekladová vrstva | translate area | |
| relácia | session | a working session, not a FHIR `Encounter` |
| odovzdanie | handover | to another team |

---

## 3. Demo content — stays Slovak

Fenced in `index.html` by `/* DEMO-CONTENT-START */` … `/* DEMO-CONTENT-END */`
so that it is unmistakably deliberate. Gate 10 permits Slovak here and nowhere else
outside the translation table.

- the sample facility header of **Fakultná nemocnica Trnava**
- **consent wording** used in demo documents
- the **sample progress note** and the demo clinical content it contains

Everything else in the prototype — labels, comments, changelog, keys — is English.

---

## 4. Naming shape

- Files: ASCII, lower case, kebab-case, no diacritics — `GSR-OPS-NAMING`.
- Identifiers in code: English, `camelCase` for functions, `UPPER_SNAKE` for registers.
- Translation keys: neutral and dotted — `action.save`, `facility.clinic`.
  A key is never a display string in any language.
- Commit messages: English, stating what changed and the normative ID it serves.

---

*Owner: Hilbi Health Group (R&D). Markdown is the SSOT.*

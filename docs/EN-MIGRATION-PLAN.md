---
id: GSR-OPS-EN-MIGRATION
title: English-only migration — plan of record
collection: gsr
area: ops
type: plan
owner: patrik
status: active
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-09-24
tags: [i18n, migration, documentation, handover, international-team]
related: [CLAUDE.md, README.md, cp-17, cp-15, GSR-OPS-NAMING, D17]
classification: Confidential — internal
---

# English-only migration — plan of record

## 0. Decision and scope

**Decision.** Every written artefact is English. Spoken and chat discussion may remain
Slovak; anything that is written down, committed, or handed to a developer is English.
The driver is an international team that cannot read Slovak — this is an access
problem, not a style preference.

**This matches `D17` of the Care Plans Standard**, which already states that the
specification layer is authoritative in English and any other language is a derived
translation. The repository has been drifting from its own rule; this plan closes it.

**In scope**

| Group | Files | State today |
|---|---|---|
| Root docs | `README.md`, `CLAUDE.md` | Slovak |
| Handoff and orientation | `docs/HANDOFF.md`, `docs/HANDOFF-START.md`, `docs/DEV-SUMMARY.md` | Slovak |
| Analyses | `docs/cp-16`, `docs/cp-19`, `docs/core-10-executive-summary.md` | Slovak |
| Diagrams | `docs/cp-14.mermaid`, `docs/cp-18.mermaid` | Slovak |
| **Normative** | `docs/cp-17`, `docs/cp-15` | Slovak — **needs K35 sign-off** |
| Generated | `tokens.json` (2 strings, fix the generator) | Slovak |
| Prototype | `index.html` | Slovak source + SK→EN pair table |
| Already English | `docs/core-01…09, 11, 12`, `core-02.mermaid` | ✅ only the `classification` header line |

**Out of scope — stays Slovak by decision**

- Demo patient and facility content inside `index.html`, fenced by an explicit
  `DEMO-CONTENT` boundary so it is obvious to any reader that it is deliberate.
- Chat and verbal working discussion.
- Clinical content authored by a physician in their own language, which reaches other
  languages through the translate area (`D17`, delivered-content layer).

---

## 1. Why not a straight flip of the pair table

`docs/HANDOFF.md` §4d records a deliberate decision:

> EN→SK is not one-to-one — two Slovak words can share one English translation
> (`Pracovisko` and `Ambulancia` → `Clinic`). SK→EN is unambiguous and guarded by a
> gate; the reverse direction is inherently ambiguous.

Swapping the two columns does not remove that ambiguity, it moves it to the source
side. Measured on v163 there are **9 collisions** where two distinct Slovak strings map
to one English string. After a flip they become one English key with two competing
Slovak values, and `new Map(I18N)` keeps only the last — which is exactly what
**gate 8** exists to prevent. A flip would therefore fail the project's own gate by
construction.

**The migration uses neutral keys instead.** This is not a new pattern: `I18N-01` and
`I18N-06` already mandate neutral keys for section sources (`TPL_SRC` + `SRC_DISP`,
"the abbreviation is a display form, not a key"). Stage 3 extends the same rule to UI
strings.

```
before   tt('Uložiť')                → pair table ['Uložiť', 'Save']
after    tt('action.save')           → { en: 'Save', sk: 'Uložiť' }
```

Neither direction is ambiguous, the source file contains no Slovak, and the nine
collisions resolve naturally: `facility.clinic` and `facility.workplace` are simply
different keys.

---

## 2. Stages

Each stage is an independent commit set and can be reverted on its own.
**No stage lands without all nine gates plus gate 10 passing.**

### Stage 0 — Pre-flight (no content change)

| Step | Detail |
|---|---|
| 0.1 | Tag current `main` as `v163-sk-final` — the last fully Slovak state, so the reverse lookup stays available |
| 0.2 | Add **gate 10 — Slovak-leak detector**: Slovak is legal only in the SK column of the translation table and inside `DEMO-CONTENT`; everywhere else it fails the build |
| 0.3 | Amend `CLAUDE.md` §4: read files **pinned to a commit SHA**, not from a mutable ref. `raw.githubusercontent.com/<owner>/<repo>/main/<file>` is CDN-cached and served a two-version-old file during the 2026-07-24 session |
| 0.4 | Commit `docs/GLOSSARY.md` (§3) **before any translation starts** |

### Stage 1 — Glossary

The single highest-value artefact and the reason it comes first: eleven documents
translated independently will produce three English words for one Slovak concept, and
the international team will read them as three different things. The glossary fixes
the term once. See §3 for the seed list.

### Stage 2 — Documentation, non-normative (11 files)

Zero runtime risk. Order chosen so the first things an incoming developer reads are
converted first.

1. `README.md` — the index and authority table
2. `CLAUDE.md` — behavioural contract, plus the 0.2 and 0.3 amendments
3. `docs/HANDOFF-START.md` — session start
4. `docs/HANDOFF.md`
5. `docs/DEV-SUMMARY.md`
6. `docs/cp-16`, `docs/cp-19`, `docs/core-10-executive-summary.md`
7. `docs/cp-14.mermaid`, `docs/cp-18.mermaid`
8. `classification: Dôverné — interné` → `Confidential — internal` in the ten
   English `core-*` headers **and in the `gsr-13` document template** — otherwise
   every new document reintroduces it
9. `tokens.json` — fix the two strings in the **generator**, then regenerate

### Stage 3 — Documentation, normative (`cp-17`, `cp-15`)

These carry 93 and n rules respectively and are the documents the international team
most needs, so they cannot be skipped — but they are normative and fall under **K35
change control (Roman + Marek)**.

**Proposed fast path:** a translation that changes no rule is not a change of the
norm. Submit it as *translation, no semantic change*, evidenced mechanically:

- the set of normative IDs is byte-identical before and after (v163 states 173 IDs
  across the corpus with no dangling reference)
- the rule count per section is unchanged
- every cross-reference still resolves

If Marek accepts that evidence, sign-off is a review of the diff, not a re-approval of
the standard. **Do not replace the Slovak file until sign-off exists.**

### Stage 4 — `index.html`, four independent commits

| Commit | Content | Hits | User-visible |
|---|---|---|---|
| 4.1 | Changelog, JS and CSS comments, `<html lang="en">` | 1 117 | no |
| 4.2 | Neutral-key infrastructure + migrate the 154 `tt()` call sites; rewrite gates 7 and 8 for the new shape | 403 | no, if correct |
| 4.3 | The 213 static HTML labels move to neutral keys | 213 | **yes** |
| 4.4 | `DEMO-CONTENT` fence around demo patient and facility data | — | no |

**Commit 4.3 is the risky one** — it touches every visible label. It must not land
without opening the prototype in a browser. `HANDOFF.md` §5 records that most UI since
v126 has never been viewed, and that two defects (v133, v147) passed every gate.

### Stage 5 — Session artefacts

`gsr-14` (knowledge base and licensing), `gsr-15` (backend preparation),
`kb-source-register.csv`, `ingest_labels.py`, `med-instruction.schema.json` and its
example. Produced in Slovak on 2026-07-24, before the rule was set.

---

## 3. Glossary seed

Extracted from actual frequency in the repository, not invented. The right-hand column
is the **only** permitted English term for that concept.

| Slovak | English | Note |
|---|---|---|
| dekurz | progress note | keep `dekurz` only where it names the UI surface |
| šablóna | template | |
| okruh vlastníctva | ownership scope | System / Facility / Personal |
| zdroj sekcie | section source | `TPL_SRC` key space |
| plocha | surface | clinician surface / patient surface |
| kokpit | cockpit | product name, not "dashboard" |
| podstránka | subpage | not "sub-site" |
| brána (sanity) | gate | "sanity gate" |
| dlh | debt | "known debt" |
| zápis | write / record | disambiguate per context — never "entry" |
| záznam | record | |
| záznamový model | record model | |
| správa | report | not "message" — `Communication` is a message |
| podpis | signature | |
| podpisová úroveň | signature level | |
| súhlas | consent | always the FHIR sense |
| úroveň | level | |
| hlavička | header | document header, not "heading" |
| zdroj | source | |
| návrh | proposal / draft | `DSI` sense = **suggestion** |
| pravidlo | rule | normative rule, carries an ID |
| stav | state | not "status" unless it is a FHIR `status` |
| výstup | output | |
| poskytovateľ | provider | healthcare provider |
| zmrazenie obsahu | content freeze | at signature |
| snímka | snapshot | |
| ľudské číslo | human-readable number | document numbering |
| trh | market | market configuration, never a code branch |
| jazyk dokumentu | document language | independent axis from UI language |
| jazyk rozhrania | interface language | |
| prekryv | override | market override |
| číselník | code list | internal, curated |
| terminologický server | terminology server | external codes |

---

## 4. Verification

Before each commit:

1. nine existing gates
2. **gate 10** — no Slovak outside the two permitted zones
3. for documentation: every normative ID referenced still exists; the `README` index
   still covers all files in the repository
4. for `index.html`: a browser check for anything in stage 4.3

After the last commit of stage 4, gate 10 must report **PASS** on `index.html`, and a
repository-wide scan must show Slovak only in the translation column and inside
`DEMO-CONTENT`.

---

## 5. Effort and risk

| Stage | Size | Risk |
|---|---|---|
| 0 — pre-flight | small | none |
| 1 — glossary | small | none, but everything downstream depends on it |
| 2 — 11 documents | ~90 kB of prose | none at runtime |
| 3 — two normative documents | ~33 kB | **process risk** — blocked on K35 sign-off |
| 4 — `index.html` | 2 229 hits, 4 commits | **highest** — 4.3 changes every visible label |
| 5 — session artefacts | ~70 kB | none |

---

## 6. Open decisions

| Question | Owner | Blocks |
|---|---|---|
| Does a faithful translation count as a change of the norm under K35? | Marek, Roman | Stage 3 |
| Is the prototype opened in a browser before commit 4.3? | Patrik | Stage 4.3 |
| Does `dekurz` stay as a product term in English text, or become "progress note" throughout? | Patrik | Glossary, then everything |
| Is the handover to the independent team paused until stage 4 completes, or do they receive v163 with Slovak UI? | Patrik | Sequencing of stage 4 |

---

*Owner: Hilbi Health Group (R&D). Markdown is the SSOT.
This plan is INFORMATIVE; where it touches a normative document, the norm wins.*

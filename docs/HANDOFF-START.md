# HANDOFF-START — read this first in a new chat

You are continuing work on the Hilbi Health Group clinical cockpit. This file gets a new
chat to a correct start in a few minutes. The detailed state is in `docs/HANDOFF.md`; the
data layer is in `docs/gsr-22-tech-data-master.md`.

---

## 1. The one-paragraph picture

Hilbi is an AI-first digital health platform for six markets (SK, CZ, DE, IN, US, AE).
The active build is the clinical cockpit — a single-file prototype `index.html` in the
repo `patrikkmec-ivx/prototype`, deployed at
https://patrikkmec-ivx.github.io/prototype/. Hilbi is an **orchestrator/overlay**, not an
EHR (`A1`, `REP-01`). The clinical source of truth is FHIR R4.

**Current version: v184.** `main` HEAD when this was written: `d7406693`.

---

## 2. Language rule — no exceptions

Discussion and chat are in **Slovak**. Every written artefact — documents, specs, code,
comments, CSV registers, changelogs, commit messages — is in **English** (`D17`). The
only exception is delivered clinical/demo content the author-physician writes in their own
language: consent wording, sample findings, the demo facility header. Since v166 English
is the **source language** of the prototype; the language round trip is lossless.

---

## 3. How to work with the repo

- GitHub is reached through `/home/claude/gh.py` — a urllib wrapper over the Contents API
  with `get_file()`, `put_file()`, `head_sha()`; it reads the token from `.tok`.
- **Always fetch the current SHA before a PUT.** The environment can restart and silently
  revert the local file.
- **Read files pinned to a commit SHA**, never through `raw.githubusercontent.com/main`
  (CDN-cached; it served a two-version-old file in a past session).
- The token is a fine-grained PAT needing `Contents: Read and write`. **Revoke and
  regenerate it after each session** — remind the user.

---

## 4. The gates — run before every prototype commit

`tools/gates.py` runs ten sanity gates; `tools/smoke.js` is a jsdom load-time smoke test
(gate 3b). Both are committed — recreate them locally only if missing.

Baselines that surprise people: **brace balance is −1, not 0.** Gate 10 (Slovak leak)
currently reports 433 hits — these are code comments and unfenced demo content, not a
functional defect; the user sees English. The other nine gates pass.

**The load-time smoke test exists because a purely static gate missed a fatal defect:**
v163 removed four functions passed as callbacks (`G.map(vGauge)`), which static analysis
cannot see; executing the script does. Never trust a static check alone for "is this
function still referenced".

**Edit on disk with `str_replace` / a single-count Python replace; never paste full code
into chat.** Assert the anchor count is exactly 1 before replacing.

---

## 5. State of the prototype against the standard

`cp-17` §16 is the live map of what conforms and what is a placeholder. Recently closed:
Provider→Practice model (v164), the fatal render regression and English default (v165),
English as the source language (v166), the `TERM_BIND`/`SRC_STYLE` register gaps, and
**document identity (v167)** — `DOC-01..07` had been recorded as met since v158 while a
duplicate `doc:` key in `rptSnapshot()` discarded it, so no signed document could be
opened from the timeline or Records (`HANDOFF` §5f).

**Open, non-blocking:** gate-10 code comments and demo content (needs `DEMO-CONTENT`
markers so the gate can see it); neutral i18n keys as the target state
(`EN-MIGRATION-PLAN`); the practice resolved from `CUR_PRACTICE` rather than the encounter
(waits on the case layer, `cp-15` CASE-04).

---

## 6. NEXT TASK — the dekurz (document creation, then intake)

This is where the new chat starts working.

### 6a. Document creation — the six-step flow (`HANDOFF` §5)

Prerequisites `DOC-*` and `STO-*` are closed. The flow:

1. **Entry** — create a document from the cockpit or the timeline
2. **Type and template** — `slotKey` + a template from a scope (`TPL-03`, `TPL-16`)
3. **Population from sources** — encounter level + patient level (`TPL-04`, `TPL-17`)
4. **Preview and coverage** — what is missing before signature (`INT-03`)
5. **Signature** — snapshot, human-readable number, write to the registry (`AMD-05`,
   `DOC-04`)
6. **Output** — structure, plain text to the clipboard, **print in the document
   language** (`I18N-13`)

**Print output does not exist yet** — no print template, no `@media print`. It belongs to
this step.

### 6b. Then the intake layer (`INT-01..07`)

IQ intake for "the patient brings documentation": OCR/AI extraction produces **candidates**
(`validated=false`, attributed to Hilbi IQ, labelled as a suggestion). An unvalidated
candidate never reaches a signed document (`INT-02`). Carried-over items from a previous
encounter are marked, confirmed **item by item**, and their `Provenance` carries the
source encounter — the cloned-documentation risk (`INT-04`, `INT-05`). Recording needs
consent and an audio-retention decision (`INT-06`, `INT-07`). Full analysis: `cp-19`.

### 6c. Design and modal discipline before touching UI

Unified central focus overlay (M 520px / L 920px for Dekurz), no stacked modals, Esc
navigates back through steps. Reuse existing tokens by value; only a genuinely new
semantic gets a new `:root` token, reported as "NEW TOKEN". Severity uses dual coding
(colour + shape + text) per IEC 60601-1-8. Selection states: cyan-soft + teal border +
teal text; navy solid is reserved for navigation and the "Current" status only.

**Structural changes require explicit approval before they are made** — a rule the user
set after a tab was removed without asking.

### 6d. Auto-documentation — same PR, not a later step

Any change to the prototype updates the documentation in the same commit: `cp-17` §16 for
conformance, the `DEV-SUMMARY` rule→code map, `HANDOFF` for state, the changelog in the
file header. "What is not documented does not exist."

---

## 7. Key anchors to have in mind

`cp-15` = the record model (SOAP, case, billing). `cp-17` = report conformance
(REP/TERM/SIG/AMD/PROV/AUD/CNS/DSI/TPL/INT/SYS/STO/DOC/I18N). `cp-19` = the dekurz/intake
analysis. `core-01` = the clinical core standard. The Care Plans Standard holds the
lettered rules (A1, B5-B10, D15-D17, F21-F26, K35 change control = Roman + Marek).
Data layer: `gsr-22` is the entry point, detail in `gsr-16` to `gsr-21`.

---

## 8. Decisions that are waiting (not your work — flag, do not resolve)

Terminology server (Roman + Juraj) · own interaction checking (Marek + Roman) · thirteen
unowned registries (Roman, `gsr-20` §7) · SNOMED CT registration with NCZI (Patrik +
Marek) · which PRO instruments are paid (clinical owner + Marek) · NICE-for-AI (Marek).

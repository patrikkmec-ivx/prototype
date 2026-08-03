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

**Current version: v184.** `main` HEAD when this was written: `5ad903cf`.

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

`tools/gates.py` runs eleven sanity gates; `tools/smoke.js` is a jsdom load-time smoke test
(gate 3b). Both are committed — recreate them locally only if missing.

Baselines that surprise people: **brace balance is −1, not 0.** Gate 10 (Slovak leak)
currently reports 434 hits — these are code comments and unfenced demo content, not a
functional defect; the user sees English. The other ten gates pass.

**Gate 11 (component duplication) is new and worth understanding.** It fails when a new
class restates geometry a cockpit class already owns. Gates 5 and 6 check *tokens*; they
cannot see a component rebuilt correctly out of correct tokens, which is exactly how v180
shipped a parallel chip and input. If you add UI, apply the existing class and add only
state.

**Two gates have passed while the thing they exist to prevent was happening** — gate 10
masked the wrong file region until v169, gate 6 compared hex as strings and missed 62
literal `#fff` until v182. A gate that has never fired is a reason to test it, not to
trust it.

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

## 6. NEXT TASK — verify the SM bridge, then replicate

The Care Plan UI Bridge (`cp-20`) is built on both sides and **awaiting first real
verification**. That verification is the next task; do not start new work before it.

### What exists

A care plan runs in an iframe and cannot paint outside it, so its dialogs are trapped —
unusable on a phone. The bridge inverts this: **the plan describes a surface, the cockpit
renders it.** Ten field primitives carrying constraints, never clinical meaning, which is
why a new plan needs no cockpit change.

- `docs/cp-20-tech-ui-bridge-protocol.md` — normative, **v0.9 draft-for-approval**.
  Roman (architecture) and Marek (compliance) have not signed off.
- `docs/hilbi-sdk.ts` — client, distributed **by copy**, not npm.
- `docs/HILBI-SDK-README.md`, `docs/STEP1-MODALS-ON-DASH.md` — for the plan teams.
- Cockpit side: `brgOpenSurface()`, `brgFieldHTML()`, `brgVal()`, `brgSet()`,
  `brgValidate()`. Demos in the Care plans dropdown: *UI bridge demo* and
  *Step 1 — Vstupné vyšetrenie*.

### What was done in the SM plan (Lovable, project `4e58bb01-888d-49c7-b19c-c84ebe65b239`)

Intake only. Commit `d8a1bb84`, typecheck passed, deployed to `sm-careplans.lovable.app`.
Files: `src/lib/hilbi-sdk.ts`, `src/lib/hilbi/bootstrapHilbi.ts`, `bridge/intakeSurface.ts`,
`bridge/useHilbiIntakeSurface.ts`, `SmDemoVisitModal.tsx`, `main.tsx`.

**This was never confirmed working in a browser.** Confirm it first:

1. Care plans → SM Care Plan → Stanovenie diagnózy → Vstupné vyšetrenie. The dialog must
   cover the **patient header and tabs**, with the cockpit scrim. If it stops at the frame
   edge, the bridge is not engaging — check `origin` in the console first.
2. Type into TO, then press *Nahrať*. The typed text must survive. This is the whole point
   of `ui.update`.
3. Open `sm-careplans.lovable.app` standalone. The **old inline modal** must appear,
   unchanged. If it does not, degradation is broken and that is worse than the bridge
   failing.

Only when all three hold, replicate to the remaining five step-1 modals — MRI, CSF, lab,
differential, diagnosis — per `docs/STEP1-MODALS-ON-DASH.md`. One at a time.

### Known unfinished

- Structured sub-objects in differential (`ena`, `anca`, `borreliaStructured`, `thyroid`)
  do not map to a flat surface. Flatten per analyte or keep in-frame. **Do not force them
  into a `group`.**
- `scale` and `result` exist in code but have **no DS '26 Figma atom**. Every plan will use
  them. Dominika's, not the code's.
- 21 of 188 `tt()`/`rxT()` calls still pass a Slovak key, nearly all in the prescription
  modal — `rxT` is a `tt` alias over Slovak keys, so that screen renders Slovak in both
  languages. Contained, mechanical, deserves its own commit. Most visible remaining
  language defect.
- Print output for a signed document (`I18N-13`, `@media print`) — still step 6 of document
  creation, still missing. `.a4` is a standalone class so print can share its geometry.

## 6b. How defects actually get found here

Every defect since v167 was found by **a person opening the page**, not by a gate:

| | |
|---|---|
| v167 | duplicate `doc:` key — a signed document could not be opened from either view |
| v169 | `sigBlockHTML()` rendered in one surface out of three — signed documents had no signature block |
| v170 | the stamp upload was behind a modal nobody could reach |
| v175 | a scroll container clipped two dropdowns out of existence |
| v176 | closing on scroll made Care plans untappable on a phone |
| v180 | correct tokens, rebuilt components |

The gates verify structure. **None of them can see whether a thing is reachable, visible,
or in the right place.** Anything that renders a document should be checked in all three
surfaces — live draft, preview, snapshot. `cp-17` §16 marking a rule ✓ means it was
verified where it was introduced and, historically, nowhere else.

Two testing traps that cost time in the last session:
- jsdom with `runScripts:'outside-only'` **does not evaluate inline `onclick`**. Call
  handlers directly or the test lies about a working feature.
- Reading `.textContent` of a stale element reference after a surface re-renders reports
  the previous state.

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

Added by the bridge work:

- **`cp-20` sign-off** — Roman (architecture) and Marek (compliance). It is a contract five
  plan teams will implement; it should not reach v1.0 by accretion.
- **`cp-20` SE-06, for Marek** — an embedded plan is a distinct data-flow boundary.
  Processor or separate controller? Is a plan hosted outside the EU environment acceptable
  under the regional isolation the platform claims? The protocol makes the flow easy, and
  the flow is the risk. Production also needs a CSP `frame-src` allowlist at the gateway.
- **`SIG-08` / `SIG-09`, for Marek** — an uploaded stamp is an image, not an electronic
  signature, and is personal data frozen into every snapshot. Does SK/CZ practice expect a
  physician's stamp on an electronically transmitted report at all?
- **`scale` and `result` as DS '26 atoms** — Dominika. Invented in code, used by every plan.

One deliberate debt, not blocking: `RPT_VERS` and `RPT_VIEW_VER` are still module-level
globals, so all versions belong to whichever document is current. Invisible while one
document exists per encounter; real the moment document creation can produce a second.
Move them onto `DOC` at that point, not before.

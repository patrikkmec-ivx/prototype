# HAND-OFF — where we are and what comes next

> **Authority: INFORMATIVE.** The state of work in progress. `cp-17` and `cp-15` are
> binding; `CLAUDE.md` governs how to behave in the repository; `README.md` says what
> is what. **Updated at the end of every session.**

Updated: 2026-07-27 · Prototype version: **v172**

---

## 1. Starting a new session

1. Read `README.md` → `CLAUDE.md` → `docs/GLOSSARY.md` → `docs/cp-17-…` →
   `docs/DEV-SUMMARY.md`.
2. **Fetch `index.html` from `main` pinned to a commit SHA.** The repository is
   authoritative, not GitHub Pages — and not a mutable ref either; the CDN behind
   `raw.githubusercontent.com/…/main/…` has served a file two versions old.
3. Writing requires a **fresh fine-grained token** — Patrik supplies it at the start of
   the session. Scope: repository `prototype`, permission **Contents: Read and write**.
   **Revoke it after the session.** A token never belongs in the repository.
4. Sanity before every commit: all ten gates (`CLAUDE.md` §4).

## 2. Language

Everything written down is English (`docs/GLOSSARY.md`). Migration status and the
remaining stages: `docs/EN-MIGRATION-PLAN.md`.

## 3. What closed most recently (v126–v129)

The conformance cycle for the report layer — seven areas from the regional review
(US / EU / India). The decisions are recorded normatively in `cp-17`, the
implementation is in `index.html`, and the rule → code map is in `docs/DEV-SUMMARY.md`
§4.

| Area | State |
|---|---|
| Document profiles per market | done |
| Terminology (dual coding) | structure done, **capture-side missing** |
| Signature level per market | declared, integration missing |
| Amendment / addendum | done (without a reason for correction) |
| Provenance + AuditEvent | done (log in memory only) |
| Consent on sharing | declared, dialogue missing |
| AI transparency (DSI) | done (without logic versioning) |

Plus: the system role **overlay** (default) versus **core** (opt-in) is recorded
normatively — consistent with A1 of the Care Plans Standard.

The exact list of deviations from the standard is **`cp-17` §10**. That is the source
of truth for what is done and what is a placeholder — not this file.

## 4. Phase plan

| Phase | Content | State |
|---|---|---|
| 1 | SSOT documentation — `cp-17`, `cp-18`, `README`, `CLAUDE.md`, `DEV-SUMMARY` | **done** |
| 2 | Traceability matrix: normative ID → screen/component | rough version in `DEV-SUMMARY` §4; the full one is missing |
| 3a | Template surface — picker, coverage, two renderers (v131) | **done** |
| 3b | Template management interface — list, section editor, `TPL-02` validation (v132); entry from the profile menu (v134) | **done** |
| 3b+ | Templates: registry, editor, preview, extraction from a sample, organisation header, history, consent, ownership scopes (v136–v139) | **done** |
| 3c1 | Templates as a subpage, design system (buttons, fields, tabs, spacing) — v140–v147 | **done** |
| 3c2 | Content freeze at signature — snapshot + fingerprint (AMD-05..09), v148 | **done** |
| 3c3 | Language layer — neutral keys, document language, consent per language, translation on demand (I18N-01..15), v149 | **done** |
| 3c4 | The **FNTT SM** template from a real outpatient report + sources as slot subsets (TPL-17, TPL-18), v152 | **done** |
| 3d | **Progress note interface** — intake, IQ candidates, per-item validation (INT-01..05) | **next in line** |
| 3d | Patient-level history scopes (TPL-04) | waiting |
| 4 | Signature UX, amendment with a reason, consent dialogue | waiting |
| 5 | Audit and versions as a system surface (not only inside the report) | waiting |
| 6 | Cockpit target layout — Life ID panel, tabs, progress note modal, IQ widget | waiting |
| 7 | i18n, tokens, mobile pass | waiting |

**Phase 3 is architecturally the most important.** Today the code is derived by regex
only at render time (`codeOf` is called only from `renderOut`). That is backwards — the
code belongs in the event, because events are the SSOT. Phase 3 changes the event data
model (`coding[]` is added), therefore it touches `cp-16` and must be reflected in
`cp-17` §10 in the same commit.

## 4b. What is still missing from the language layer

- System templates are only partly localised (`I18N-04`).
- Taxonomy is not yet translated through the **code display term** (`I18N-05`) — today
  it goes through `SRC_DISP`; in production it should come from a terminology server.
- Foreign documents on the timeline (`I18N-10`), print language (`I18N-13`) and locale
  formatting of numbers and dates (`I18N-14`) are not addressed yet.
- Patient language as a separate axis (it governs consents and patient letters).

## 4c. Provider templates

The first real template is **FNTT SM** (scope `provider`), adapted from an outpatient
report of the Neurology Clinic — MS Centre. Sections: TO · Obj. · UL/LL · Laboratory and
CSF examinations · Conclusion · Recommendations · Prescriptions · Diagnoses · Patient
statement.

When adapting, only the **structure** is taken (`TPL-08`) — clinical values, patient
identity and third-party legal wording are never copied; demo data and consent wording
are our own.

Further provider templates are added the same way: recognise the sections → map them to
sources (adding a new source per `TPL-17` where needed) → verify the market minimum →
ensure consent wording in the document language → **select the signatories** (`TPL-19`).

The header, footer and signatories are edited in the **facility settings**, not in the
template; the template editor links there.

## 5. Next step — document creation

All three prerequisites are closed (`DOC-*`, `STO-*`). Document creation means:

1. **Entry** — creating a document from the cockpit or from the timeline
2. **Type and template selection** — `slotKey` + a template from a scope (`TPL-03`, `TPL-16`)
3. **Population from sources** — encounter + patient level (`TPL-04`, `TPL-17`)
4. **Preview and coverage** — what is still missing before signature (`INT-03`)
5. **Signature** — snapshot, human-readable number, write into the registry (`AMD-05`, `DOC-04`)
6. **Output** — structure, plain text to the clipboard, **print in the document
   language** (`I18N-13`)

Print output **does not exist yet** — there is neither a print template nor
`@media print`. It belongs to this step.

Then follows the **progress note interface** (`INT-01..05`): IQ intake, OCR candidates
as `validated=false`, per-item validation, marking of items carried over from the
previous visit (`INT-04`, cloned documentation).

## 5b. Prerequisites of document creation

Three things had to close **before** document creation — they were not add-ons:

1. ~~Document identity~~ — **done in v158** (`DOC-01..07`): `masterIdentifier`,
   versions, a human-readable number at signature, `DOC_REG` as the single registry.
2. ~~Display in both views~~ — **done in v159**: the timeline and Records both read
   from `DOC_REG`, no copy is created, an addendum updates the existing record.
3. ~~Persistence seam~~ — **done in v160** (`STO-01..05`): `Store` with five
   collections, an in-memory adapter, every write through the seam.

**All three prerequisites are closed — document creation can begin.**

Print output (`I18N-13`) belongs to document creation and is done alongside it.

## 5c. Provider and Practice (v164)

A Provider may have several Practices. Until v164 the model was flat — one `ORG.fac`
string — which could not satisfy `REP-07` (identity resolved from context) and placed
signatory identity at the wrong level: the head of the Neurology Clinic sat on the
Provider and would have appeared on a general-practice document.

`PRACTICES` is now a registry, `practiceOf()` resolves the active practice, and
`sigList()` assembles Practice-level signatories first, adding only the Provider-level
roles that apply everywhere (treating clinician, patient signature).

FHIR: Provider → `Organization`; Practice → `Organization.partOf`; signatory →
`PractitionerRole.organization` → Practice.

**Still open:** the practice is currently resolved from a module-level `CUR_PRACTICE`.
It has to come from the encounter once the case layer lands (`cp-15` CASE-01/CASE-04,
where every event already carries a department).

## 5d. Finding — four sources missing from their registers

A stricter reading of gate 9 (source-key consistency across the six registers) shows
four encounter-scoped sources absent where `CLAUDE.md` §3 requires them:

| Register | Missing |
|---|---|
| `TERM_BIND` | `rx`, `fu`, `narr` |
| `SRC_STYLE` | `consent` |

`fu` and `narr` plausibly carry no coding by design, but the convention elsewhere is to
record that explicitly (`S` is present as `{rec:null,rep:null}`). **`rx` is the one that
matters:** `TERM-04` binds the P slot to SNOMED CT plus the market's medication system,
so a prescription source with no entry in `TERM_BIND` is a possible conformance gap
against `TERM-04`, not a cosmetic one.

Not fixed here — fixing it inside a structural change would have mixed two unrelated
things in one revertable commit. Needs a decision on whether the absences are intended.

## 5e. v165 and v166 — what a browser check found

**v165 — a fatal regression that every gate passed.** v163 removed `vGauge`, `vRange`,
`phrGauge` and `irSignDo` as dead code. They were not dead: `renderVitals()` runs at load
and calls them, so the page threw a `ReferenceError` during start-up and every statement
after it was skipped — including the `setLang('en')` that was already there. The vitals
panel never rendered at all. The handler gate only inspects `onclick`/`onchange`/
`oninput`; a reference passed as a callback (`G.map(vGauge)`) is invisible to it, and a
static reimplementation of that check also reported OK. It is now a **load-time smoke
test** (`tools/smoke.js`, gate 3b) that executes the script.

**v166 — English is the source language.** UI strings, `tt()` arguments and the registers
that feed `tt()` (`ORG_F`, `SLOTS`, `TPL_REG`, `TPL_SRC`) are English; `I18N` maps an
English key to each translation. A round trip is lossless: EN → SK → EN over two cycles
changes zero nodes, verified in jsdom with panels open.

**A whole-file substitution was attempted first and discarded.** It corrupted Slovak
clinical content — `podpisom` became `signatureom`, `lekársku` became `physiciansku`, and
the Slovak branch of a ternary was overwritten with English. Among the damage was the
**informed-consent wording, a legal artefact under `TPL-12`**. The replacement now runs
only where a string is genuinely a translation key.

**Still open on the language layer:** keys are English display strings, not neutral
identifiers (`action.save`). Neutral keys remain the target — `EN-MIGRATION-PLAN.md`.
Gate 10 still reports Slovak in code comments and in unfenced demo content; the demo
content stays Slovak by decision and needs `DEMO-CONTENT` markers so the gate can see it.

## 5f. v167 — document identity was broken, not done

`DOC-01..07` and `DOC-06` were recorded as closed in v158. They were not. `rptSnapshot()`
declared `doc:` twice in one object literal — the identity `{master, humanId, created}`
first, the market document profile `doc:m.doc` twelve lines later. The later key wins, so
every snapshot carried the string `EEHRxF / OpConsult` where its identity belonged.

What that meant in practice, for nine versions: `sn.doc.humanId = DOC.humanId` set a
property on a primitive and failed silently; `docRegister()` wrote `master: undefined`;
both the timeline and Records emitted `docOpen('undefined')`, so **a signed document could
not be opened from either view**; and because `Store.put('documents')` keys on `master`, a
second document would have overwritten the first.

Fixed by renaming the market profile to `docProfile:`. **No change to the state model.**
Verified in jsdom rather than by reading: one register row per document across both views
with the same `master`, `docOpen` resolves, the profile still renders in the frozen footer,
and an addendum updates the existing row to v2 / `amended` instead of creating a second.

**Two things follow from this.** First, a claim of conformance in `cp-17` §16 is only worth
what the test behind it is worth — this one had none. Second, a duplicate key in an object
literal is legal JavaScript: `node --check` accepts it and no gate sees it. A gate would
need an AST parse (acorn); it was **not added here** — it is a deliberate deferral, not an
oversight, and it is the cheapest remaining protection for this class of defect.

**Deferred, not blocking:** `RPT_VERS` and `RPT_VIEW_VER` are still module-level globals,
so all versions belong to whichever document is current. This is invisible while one
document exists per encounter, and becomes real the moment step 1 of document creation can
produce a second one. Move them onto `DOC` at that point, not before.

## 5g. v168 — A4 template preview

The template editor's side preview is a narrow column and says nothing about how the
document sits on a page. The Preview heading now carries an eye button that opens the
template on a **true A4 sheet** — 210x297 mm, 794x1123 px at 96 dpi, inside an L overlay
(920 px), margins 76 px. The page holds a fixed width and scrolls in its frame; fitting
the sheet to the viewport would stop it being A4.

Both previews draw their body from **one function**, `tplPrevBodyHTML()`. Assembling the
content twice would let the sheet and the column drift, and a clinician checking a
template would read a different document in each. Verified in jsdom as character-identical.

**Not print.** This is an on-screen A4 preview of a *template*. Print output for a signed
*document* (`I18N-13`, `@media print`) is still missing and still belongs to step 6 of
document creation. The two should share the page geometry when print lands — that is the
reason `.a4` is a standalone class rather than something local to this modal.

**Desktop only.** Below roughly 900 px the sheet scrolls horizontally. Mobile full-screen
sheets are `M-06` and were not pulled forward.

## 5h. v169 — stamp and signature

Marks per signatory, bottom-right: stamp left, signature right, both **above the rule**,
name and role below. Uploaded in facility settings, keyed by signatory so a mark follows
the person rather than the current practice. A sample stamp ships in the shape of a real
Slovak one, with English demo text.

**`SIG-08` is the rule that matters.** An uploaded mark is an image. It satisfies none of
eIDAS QES, IT Act e-sign or HIPAA e-sign — the mechanisms `MKT` already declares per
market. The mark therefore never replaces the rule, the rule stays, and the upload panel
says plainly that this is not an electronic signature. A stamp is issued to the physician;
the system must not generate one. `SIG-09` records that a mark is personal data which
freezes into the snapshot and travels with every share.

**Third instance of the same defect shape.** `sigBlockHTML()` was called from exactly one
place — `reportShell()`, the live draft. Neither the template preview nor `snapShellHTML()`
carried it, so **a signed document had no signature block at all**, while `cp-17` recorded
`TPL-19` as met. After `DOC-06` in v167 and this, the pattern is clear: a rule marked ✓ in
§16 has usually been verified at its point of introduction and nowhere else. Anything that
renders a document should be checked in all three surfaces — live draft, preview, snapshot.

The snapshot now renders its **own frozen signatories**, not live `ORG`. Otherwise
replacing a stamp would silently reprint every document ever signed (`AMD-05`). Verified:
clearing a stamp after signature leaves the signed document byte-identical.

**Geometry was checked arithmetically before the browser** — at the first attempt the
stamp was clipped by its own `max-width` and the two marks collided by 14 px. Deriving the
widths from the marks' aspect ratios caught it without a render. Worth repeating wherever
absolutely-positioned images share a box.

**Gate 10 was broken.** I18N offsets are relative to the script block but were applied to
the whole file, so the mask blanked an arbitrary stretch of HTML and counted every Slovak
translation as a leak. It reported **849 where the real figure is 433**. Fixed in
`tools/gates.py`; the baseline in `HANDOFF-START` §4 is restated. Any earlier reading of
this gate, including in `EN-MIGRATION-PLAN`, should be treated as unreliable.

**For Marek:** whether a scanned stamp on an exported document creates any exposure under
EHDS or HIPAA beyond ordinary personal data, and whether SK or CZ practice expects the
physician's stamp on an electronically transmitted report at all.

## 5i. v170 — where the upload belongs, and a missed register

Two defects, both found by **opening the prototype**, not by a gate.

**The upload was invisible.** It had been placed in the facility-settings modal, behind
the Edit button on the header card, so nothing about it was visible on the templates page.
It now sits at the **bottom of the template editor** as a footer card — the counterpart of
the header card at the top. The header is the first thing on a document and comes first in
the editor; the stamp and signature are the last and come last. The card lists only the
signatories the template actually selects (`TPL-19`), so it shows who will really appear.
Ownership is unchanged and still stated on the card: the marks belong to the facility and
apply to every template, the template only decides who signs (`TPL-07`).

**`TPL_SCOPES` was still Slovak.** The scope tabs read Systémové / Zariadenia / Moje
šablóny while the rest of the interface was English. v166 converted `ORG_F`, `SLOTS`,
`TPL_REG` and `TPL_SRC` but missed this register.

**Measured while fixing it: 21 of 188 `tt()`/`rxT()` calls still pass a Slovak key**,
almost all in the prescription modal (`rxT` is a `tt` alias over Slovak keys, so that
screen renders Slovak in both languages). Not fixed here — it is a contained, mechanical
piece of the v166 migration and deserves its own commit. It is the most visible remaining
language defect a user can reach.

**Pattern worth naming.** v167, v169 and v170 were all found by looking, never by a gate:
a duplicate object key, a block rendered in one surface out of three, an upload nobody
could see, a register left untranslated. The gates verify structure; none of them can see
whether a thing is reachable, visible or in the right place. `§10` already says most of
the UI is visually unverified since v126 — these three are the evidence.

## 5j. v171 — care plans as embedded applications

The Care plans dropdown showed a toast and did nothing. Each entry now resolves through
`CP_APPS` to a URL and opens in a pane in the centre column, reusing the `body[data-tab]`
mechanism the communication pane already uses.

**`CP_APPS` is the seam.** The cockpit embeds a plan, it does not reimplement one. Today
the register points at published Lovable prototypes; in production it points at the Care
Plans microservice and nothing else changes. Three plans are published — Care Plan Studio,
SM Care Plan, Fabry. Dementia and Colorectal are not, and show a placeholder that says so
instead of an empty frame.

**An unverifiable dependency made visible.** Whether these URLs permit embedding could not
be checked from the build environment — the network blocks `lovable.app`, so the
`X-Frame-Options` and CSP `frame-ancestors` headers are unknown. If a service refuses
embedding the frame simply stays blank, and cross-origin that is not reliably detectable
from script. Every frame therefore carries a visible *open in a new window* link and a
line explaining what a blank frame means. The dependency is still unverified; it is just
no longer a dead end.

**Patient context is deliberately not passed.** In production the identifier **must not
travel in the URL**: a query string reaches gateway logs, the `Referer` header of every
outbound request the embedded app makes, and browser history. This is the most common way
PHI escapes an otherwise correct integration. Hand the context over with an origin-checked
`postMessage` after the service signals readiness, or with a short-lived token exchanged
server-side. The prototypes carry demo data only, so nothing is exposed today.

**For Marek, when this stops being a prototype:** an embedded third-party surface inside a
clinical cockpit is a data-flow boundary. It needs a CSP `frame-src` allowlist at the
gateway, a decision on whether the plan service is a processor or a separate controller,
and a view on whether embedding a service hosted outside the EU environment is acceptable
at all under the regional isolation the platform claims.

### v172 — how much room the plan actually gets

The frame header carries a width switcher (Column / Wide / Full) and a live px readout.
Computed from the grid — `--navw` 208, `--phrw` 280, gap 14, padding 16 — the centre
column hands an embedded plan:

| viewport | both rails open | PHR collapsed | both collapsed |
|---|---|---|---|
| 1280 | **732 px** | 876 | 1110 |
| 1440 | **892 px** | 1036 | 1270 |
| 1680 | 1132 | 1276 | 1510 |
| 1920 | 1372 | 1516 | 1750 |

`.center` has a floor of `minmax(640px,1fr)` and the body sets `min-width:1100px` above
744 px, so below roughly 1100 px the whole page scrolls horizontally rather than reflowing.

A plan built in a builder is a full-width page; **Column is the case that will hurt** and
the one the plan should be designed against. `cpClose()` restores any rail the switcher
collapsed, so closing a plan cannot leave the cockpit in a state nobody chose.

## 6. Open points outside the code

- **Marek (compliance):** the boundary between suggestion and decision in Hilbi IQ
  (MDR) · signature level per market · audit retention · the scope of the EHDS CE
  regime when moving to `core` mode · India CERT-In · **whether a faithful translation
  of `cp-17` and `cp-15` counts as a change of the standard under K35**.
- **Registering SNOMED CT usage** with NCZI. Slovakia is a member of SNOMED
  International (NCZI is the national release centre); use within a member country
  carries no licence fee.
- **Selecting a terminology server** for `$expand` / `$validate-code` — this blocks
  Phase 3 in production form (a demo ValueSet is enough in the prototype, but the UI
  pattern must be right).
- **Designing a persistent, tamper-evident audit log** (`AUD-02`).
- **`doc_id` assignment** for `cp-17` and `cp-18` per `gsr-13`.

## 7. Lessons from two incidents

**v148 silently overwrote v145–v147.** The environment restarted, the local
`index.html` rolled back to an older state and was not re-fetched from `main`. Three
subsequent commits were applied to the old file and removed the templates subpage.
Restored in **v151**.

**2026-07-24 — the same failure mode, different cause.** A session started by reading
files from `raw.githubusercontent.com/…/main/…`, which is CDN-cached and returned v161
while `main` was already at v163. Nothing was committed before the mismatch was found,
so no damage occurred.

Therefore: **read pinned to a commit SHA, and verify the local file matches `main`**
before editing, repeating the check after any hint of a restart (for example when
`/tmp` has been emptied). The rule is in `CLAUDE.md` §4.

## 8. State at the close of the 2026-07-23 session

**Everything is on GitHub.** Nine gates pass (a tenth, the Slovak-leak gate, was added
on 2026-07-24 and does not yet pass on `index.html` — see `EN-MIGRATION-PLAN.md`).

**Figures measured at v163** (always re-measure, never quote old ones):
4 725 lines · 220 functions · **98 tokens in `:root`** (106 including definitions
outside `:root`, for example `--navw` on `body`) · 699 `I18N` entries (699 unique keys,
0 duplicates, 0 conflicts) · 154 unique strings in `tt()` · 89 handlers.

**Dead code: zero.** Five unused functions were removed in v163.

**Code health:** the longest function is `tplMgrRender` (64 lines). **No refactor is
needed** — a single file is still fine at this size and splitting it would break both
the commit workflow and GitHub Pages. Revisit above roughly 700 kB.

**Design tokens:** **zero drift, no undefined `var()`** — no hex colour outside `:root`
that already has a token. The generated `tokens.json` (DTCG, 18 groups, 16 aliases) is
the code-first SSOT.

**Figma:** the next step is `tokens.json` → Style Dictionary → Figma Variables into the
Design System '26 file (`ombR6X345rSPGaJPfnye7e`). Components in Figma are **not
updated from the code** — the direction is the opposite: Figma is the source for
components, the code is the source for tokens. Where the prototype diverged from the
design system (for example button sizes before v143), the code was corrected, not Figma.

## 9. Known debt (for the independent team)

Deliberate and reasoned — **do not change without a visual check**:

- **~64 orphaned CSS classes** (`.alrg`, `.attn`, `.cbox`, `.confirm`, `.code`…) —
  remnants of earlier iterations. Removal is safe only after a visual check, because
  some names may be assembled dynamically.
- **Off-scale spacing** in the original components (`13px` 28×, `15/17/30/39px`) —
  optical tuning, not drift. The 8/16/24/32 scale applies to new work.
- **The prototype is in memory** — `Store` has an in-memory adapter (`STO-01..05`);
  everything is lost on reload. That is intentional, not a defect.
- **Translation between languages is not one-to-one** — two Slovak words can share one
  English translation (`Pracovisko` and `Ambulancia` → `Clinic`). This is the reason the
  migration moves to neutral keys rather than swapping the columns of the pair table:
  with a key per meaning, neither direction is ambiguous. Nine such collisions exist at
  v163 and are resolved as part of stage 4.

## 10. Verified, unverified

- Verified statically: the sanity gates (see §8) plus targeted tests — immutability of
  a snapshot when live data changes, the document identity lifecycle, one document in
  two views without a duplicate, the store interface.
- **Unverified visually:** most of the UI since v126. Gates do not catch visual
  defects — two have slipped through already (an unreachable button in v133, a broken
  preview in v147). It is worth opening the prototype before the next iteration, and it
  is required before stage 4.3 of the migration, which moves every visible label.

## 11. Older, outside the report layer

- Figma token sync v81 → v129+: a code-first token SSOT (`tokens.json` DTCG + Style
  Dictionary) → Figma Variables; a new "Hilbi Design System" file. Keys: DS '26
  `ombR6X345rSPGaJPfnye7e`, Marketplace `QWv1xbC62cOhiy0MYlgVts`.
- Open token debt: the pill `#6AD5E5` → `--brand-cyan`, `#06343E` → a new
  `--brand-cyan-ink`, organisation gradients into tokens.
- Physician sub-specialities: once there is data to distinguish several physicians in
  the same department, add it to `SPECBY` — it propagates everywhere at once (dropdown,
  pill, tooltip).

# CLAUDE.md — operating contract for AI tools

> **Authority: BEHAVIORAL.** This file governs *how* an AI tool behaves in this
> repository. It does not define substance — on every question of substance it yields
> to `cp-17`, `cp-15` and `core-01`. Reading order and precedence are set by `README.md`.

---

## 1. What this repository is

The prototype of the Hilbi clinical cockpit (`index.html`, a single file: HTML +
`<style>` + `<script>`, no dependencies, demo data) and the clinical specifications in
`docs/`.

**Hilbi is an orchestrator, not a system of record.** The default role is `overlay` on
top of the provider's existing system. This is not a detail — it determines what the
system may claim about its own output.

## 2. Hard rules

- **The prototype never defines the standard.** If the code diverges from the
  specification, fix the code. If the specification is wrong, fix it **as a separate
  change** and say so out loud — never resolve it by quietly editing the code.
- **Never commit a token, a key or real patient data.** Demo data is always invented.
- **Never present a prototype state as a fulfilled standard.** Call a placeholder a
  placeholder. The list of known deviations is `cp-17` §10 — **update it in the same
  commit** when it changes.
- **English only.** Everything written down is English: documents, specifications,
  schemas, code, code comments, changelogs and commit messages. The single exception is
  the demo content fenced by `DEMO-CONTENT` and listed in `docs/GLOSSARY.md` §3.
  Use the English term from the glossary — one concept, one word.
- **Auto-documentation.** A change that alters normative behaviour may not be committed
  without the corresponding documentation being updated **in the same step**. What is
  not documented does not exist.

  After every significant step the **whole set** is updated, so that one SSOT exists:

  | Document | What changes in it |
  |---|---|
  | `docs/cp-17-…` | the new or changed normative rule **and** §14, the prototype state |
  | `docs/DEV-SUMMARY.md` | §4 the rule → code map, §5 what production must replace |
  | `docs/HANDOFF.md` | prototype version, phase status, open points |
  | `README.md` | version, file index, conformance in one sentence |
  | `CLAUDE.md` | a new interface pattern, a new sanity gate, a new "must not regress" |
  | `index.html` | a `vNN` changelog entry referencing the normative ID |

  A contradiction between any two of them is a defect, not a detail.
- **One source of truth in the code.** Before adding a new map or constant, check
  whether one already exists. Established single sources: `SPECBY` + `specOf`
  (physician specialities), `MKT` (market rules), `reportShell` (report chrome),
  `TERM_BIND` + `CODEMAP` (coding), `I18N` (translations). Duplicated taxonomy is a
  recurring source of conflict.

## 3. What must not regress

The following is an implementation of the standard, not cosmetics. It must survive any
refactor:

| Rule | Implementation |
|---|---|
| `REP-06` single shell | `reportShell()` — header/body/footer **once**, no duplicated chrome |
| `REP-07` identity from context | `RPT_ID`, `rptIdLine()` — never a hard-coded name or ID |
| `REP-01`, `REP-05` system role | `RPT_MODE`, `rptModeNote()` — the mode must be visible |
| `TERM-02`, `TERM-03` dual coding | `codeChips()` — the code sits **beside** the narrative, never instead of it |
| `TERM-07` per-market configuration | `MKT` — never an `if (market === …)` branch in logic |
| `TERM-08` acknowledged gap | the `.cd.none` chip — an uncoded item is never skipped silently |
| `AMD-01..03` amendment | `RPT_VERS`, `rptStatus()` — the original is preserved |
| `PROV-*`, `AUD-*` | `logProv()`, `logAudit()` — hooks on every action |
| `DSI-01..04` | `DSI`, `dsiHTML()` — every AI suggestion declares its logic |
| `CNS-05` | `rptShare()` — sharing only after signature |
| `AMD-05..09` freeze | `rptSnapshot()` — a signed version is **never** assembled from live data |
| `I18N-01`, `I18N-06` | `TPL_SRC` neutral keys + `SRC_DISP` — an abbreviation is a display form, not a key |
| `I18N-02` | `srcAbbr()` vs `srcName()` — document language and interface language **must not** be merged |
| `I18N-08` | `trBarHTML()` — a translation is a reading aid with a notice, never a silent substitution |
| `I18N-11` | `cnsPick()` — missing consent wording is acknowledged, not replaced by a translation |
| `TPL-17` | `ENC_SRC` — two sections on the same source must not duplicate content |

### Adding a section source

A new source must be added to **six** registers at once, otherwise silent gaps appear:
`TPL_SRC` (the offer), `SRC_COVERS` (minimum validation), `TERM_BIND` (coding),
`SRC_STYLE` (hierarchy), `SRC_DISP` (display per language) and the resolver in
`rptSource()`. The key-consistency gate verifies this.

### Known debt (do not change without a visual check)

Existing cockpit components (`.vch`, `.vcb`, `.vcf`, `.vrange`, `.medrow`, `.billbox`,
`.pinbox`, `.navsub`) use spacings outside the scale — chiefly `13px` (28×), `15px`,
`17px`, `30px`, `39px`. This is **optical tuning, not drift**; a bulk change would
shift the layout. The 8/16/24/32 scale applies to **new work**.

## 4. Commit workflow

1. **Fetch the current file from `main` pinned to a commit SHA.** The authoritative
   content is the repository, not GitHub Pages — and **not a mutable ref either**.
   `raw.githubusercontent.com/<owner>/<repo>/main/<file>` is CDN-cached and can serve
   stale content: on 2026-07-24 it returned a file two prototype versions old, which
   would have silently reverted two commits. Resolve `main` to a SHA first
   (`GET /repos/{owner}/{repo}/commits/main`), then read every file at that SHA.
   **Verify the local file matches** — by size and by checking a marker from the last
   change. The environment can restart and roll the local file back; editing such a
   file **silently reverts earlier commits**. Anything that has disappeared from
   `/tmp` or `/home/claude` is a restart signal. Repeat the check **after every hint
   of a restart**, not only at the start of a session.
2. Edit locally.
3. **Before introducing a new CSS class, check the name does not already exist.** The
   prototype is a single file with one shared namespace; a new class reusing an
   existing name silently overwrites an unrelated part of the interface (this happened
   with `.card`).
4. **Sanity gates — all ten must pass:**
   - brace balance: `t.count('{') - t.count('}')` — the **baseline is `-1`**, not `0`
   - extract `<script>` into `_js.js` and run `node --check _js.js`
   - **handler check**: collect every `onclick` / `onchange` / `oninput` from the HTML
     and from template strings in JS, and verify each has a definition. A syntax check
     will NOT catch this — a button calling a non-existent function is valid
     JavaScript. It equally will not catch an element unreachable in the DOM.
   - **token check** has **two parts**:
     *a)* no hex colour outside `:root` that already has a token (drift);
     *b)* **every `var(--x)` must have a definition** — including those with a
     fallback. `var(--x, #hex)` with an undefined `--x` silently uses the hard-coded
     value and the drift check **will not catch it**, because that colour has no token.
     `var(--x)` with neither a fallback nor a definition is an invalid declaration —
     the property does not apply at all. Look for definitions **anywhere**, not only in
     `:root` (for example `--navw` sits on `body`).
   - **conflicting translations**: no key may have two different translations in
     `I18N`. `new Map(I18N)` keeps the **last** entry; new pairs are added at the
     front, so a newer translation silently loses and a round trip through both
     languages corrupts the text.
   - **translation completeness**: every string in `tt('…')` **and every static label
     in the HTML** must have an entry in `I18N`. `tt()` without an entry returns the
     key itself, so an untranslated string leaks into the other language. A syntax
     check will not catch this.
   - **CSS order check**: for every rule inside `@media`, verify the same selector does
     not have a base rule **after** it — otherwise the base rule wins and the media
     query never applies. Compare **whole selectors** (`.a .b` is not `.b`) and parse
     media blocks by brace matching, not by a regex up to the first `}`.
   - **source keys**: consistent across the six registers (see §3).
   - **gate 10 — Slovak leak**: Slovak is permitted in exactly two places — the
     translation table and the `DEMO-CONTENT` block. Anywhere else it fails the build.
     See `docs/GLOSSARY.md`.
5. **Every `str_replace` and text substitution must be guarded by an assert.** A
   substitution that fails to find its anchor runs **silently and without error**. A
   script that modifies a file must **write only at the end** — an assert in the middle
   then prevents a partial change. Take the anchor from the **file you just read**, not
   from memory: a single space (`--phrw:280px}` vs `--phrw:280px }`) is enough to make
   it fail silently.
6. Commit through the GitHub Contents API (GET sha → PUT base64 + sha).
7. A `vNN` entry in the changelog; the commit message describes the change in substance
   and references the normative ID.

Validate Mermaid diagrams with a parser (`mermaid.parse` with jsdom) — `mmdc` needs
Chrome, which may not exist in the environment.

## 5. Design token discipline

1. Reuse an existing token by matching its value.
2. If there is no match, derive from an existing scale (radius {4,8,12,16,20,24}, space
   {4,8,12,16,24,32,48,64}, type 12/13/15/17/22, brand/accent/semantic colours).
3. Only for genuinely new semantics → **one** token in `:root` (never inline), a
   canonical name, and **report it explicitly**.

Key tokens: `--text-heading` `#333D6C` · `--text-body` `#46506B` · `--text-muted`
`#687087` · `--brand-accent` `#FF4496` · `--brand-cyan` `#6AD5E5` · `--brand-cyan-soft`
`#E1F5F9` · `--brand-teal-text` `#0E7D92`.

## 6. Interface patterns

Established patterns are **reused, not reinvented**. A new variant is a change to the
design system and must be reported.

**A responsive rule always sits immediately after the base rule for the same
selector.** With equal specificity, order within the single file decides.

### Tabs — the only permitted pattern

A flat button with no border and no background, **icon + label**. Inactive
`--text-muted`; active `--text-heading`, weight 700, with a **3px underline**
(`border-radius:2px`) in `--text-heading`. Spacing 22–26 px.

**Pills, segments, outlined switches and coloured backgrounds are NOT used as tabs.**

Implementations: `.tabs` (the main cockpit bar) · `.dtabs` (progress note) · `.tabbar`
(the general class for new tab bars — use this one). An optional count in `.cnt`.

Exception: a two-state view switch inside a panel (for example Structure / Text) is not
navigation and therefore remains a segment.

### Buttons

The design system scale; **size is chosen by context**:

| Size | When |
|---|---|
| **48 · L** (`.btn.lg`) | primary CTA, full width on mobile, empty states, landing |
| **40 · M** (`.btn`) | **default** — most of the UI: forms, panels, toolbars, cards |
| **32 · S** (`.btn.sm`) | compact and inline — table rows, dense filters |

Icon buttons `.btn.icob` (32×32), quiet `.btn.ghost`.
Labels: L 16/24, M 14/20, S 12/16, Mulish SemiBold.

Types by emphasis: **Primary › Secondary › Ghost**; contextual ones are Destructive,
IQ, Inverse, Glass. Secondary always has a **neutral** border — a cyan border on a
Secondary means a selected chip, not a button. Custom colours outside the types are not
used.

Primary is `--brand-cyan` with `--brand-cyan-ink` text (`#06343E`), **never white
text**. **At most one primary button may appear on a screen** — the main action.
Supporting actions are secondary (white with a border), quiet ones are ghost.

Custom button dimensions are **not defined**. If a size is missing, that is a change to
the design system and must be reported — not overridden locally.

### Placement of panel actions

Actions that apply to the whole panel (save, discard, confirm) belong in the **top
bar**, right-aligned in the row with the tabs — **never below the content**. If the
content scrolls, the user never sees buttons underneath it and does not know they exist.

They are enabled and disabled by panel state (`disabled` when the action makes no
sense), not hidden — hiding changes the layout and the user loses orientation.

### Form fields

Per the design system handoff: **no border at rest**, `surface/1` fill, value in
`--text-heading`, label in `--text-muted`, placeholder in `--text-subtle`. Focus = white
background + a **2px ring** in `--brand-cyan`. Hover `surface/2`.

Sizes: **S 40 px** (radius 8) · **M 48 px** (radius 12, default) · **L 56 px**
(radius 16). **Never below 40 px** and never a border as the resting state. A
placeholder is not used instead of a label; the label is always visible.

### Subpages

Composition: **breadcrumbs** (12/16, `--text-muted`) → **header** (24/32 bold title +
action on the right) → a `.pgcard` card (white, 1px border, radius 14, padding 24). A
subpage replaces the cockpit; **no PHR panel is reserved** — that belongs only in the
patient detail.

Spacing keeps to the **8 / 16 / 24 / 32** scale. Intermediate values (14, 18, 20, 22)
are not used.

### Modals

`sheetwrap` → `sheet` (`sheet wide` for wide content) → `sh-h` header, `sh-b` body,
`sh-f` footer with buttons on the right. Closed through `mClose(id)` and by clicking
the scrim.

**Height is determined by content.** A modal has no forced height and no `min-height`
on inner panels; the only constraint is a responsive ceiling (`max-height:86vh`) with
scrolling in `sh-b`. Empty space below short content is a defect.

## 7. Translations

Keys are **neutral and language-independent** — `action.save`, not a display string in
any language. `I18N` maps a key to each language. **Every new key must receive an entry
for every supported language in the same step**; otherwise the key itself leaks into
the interface.

`swapText` translates text nodes as well as `title` / `placeholder` / `aria-label` /
`data-tip`. Because substitution is sequential, entries are ordered **longest first** —
a shorter string would otherwise overwrite part of a longer one.

Slovak survives in exactly two places: the translation table and the `DEMO-CONTENT`
block (`docs/GLOSSARY.md` §3). Gate 10 enforces this.

## 8. Communication

Direct, plain language. Written artefacts are English without exception; spoken and
chat discussion may be held in any language the participants share. Common
abbreviations (API, ISO, FHIR, GitHub) are fine; invented compounds are not. Explain a
specialist term on first use. Report blockers and conflicts **at the start**, not at
the end. A short confirmation beats elaboration.

## 9. What to escalate rather than decide alone

- The boundary between suggestion and decision in Hilbi IQ (`DSI-04`) — it touches MDR.
  Compliance decides.
- Signature level per market (`SIG-01`), audit retention (`AUD-03`).
- The scope of the EHDS CE regime when moving to `core` mode (`REP-03`).
- Anything that would turn the prototype into a tool handling real patient data.

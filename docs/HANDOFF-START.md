# Hilbi Cockpit — session start

> Paste this text into the first message of a new chat. **It is deliberately short** —
> all the depth lives in the repository. Duplicating content here would create a second
> source of truth.

**Repo:** `patrikkmec-ivx/prototype` · **Live:** https://patrikkmec-ivx.github.io/prototype/
**Version:** v163 · **State:** audited, prepared for handover · 2026-07-23

---

## 1. First three steps

1. **Read in this order:**
   `README.md` → `CLAUDE.md` → `docs/GLOSSARY.md` → `docs/HANDOFF.md` →
   `docs/cp-17-…` → `docs/DEV-SUMMARY.md`
2. **Fetch `index.html` from `main` pinned to a commit SHA** and verify it matches your
   local copy. Resolve `main` to a SHA first (`GET /repos/{owner}/{repo}/commits/main`),
   then read files at that SHA. **`raw.githubusercontent.com/…/main/…` is CDN-cached
   and has served a file two versions old** — never read from a mutable ref.
   Without a token the GitHub API is rate-limited (403), so a token is needed even for
   reading reliably.
3. **Writing requires a fresh fine-grained token** (Patrik supplies it): repository
   `prototype`, permission **Contents: Read and write**. Revoke it after the session.

## 2. Language

**Everything written down is English** — documents, specifications, schemas, code, code
comments, changelogs, commit messages. Use the term from `docs/GLOSSARY.md`; one
concept, one word. Working discussion may be held in any language.

The only Slovak that survives is the demo content fenced by `DEMO-CONTENT`
(`GLOSSARY.md` §3) and the translation table. Gate 10 enforces this.

Migration status: `docs/EN-MIGRATION-PLAN.md`.

## 3. What is binding

| File | Authority | Content |
|---|---|---|
| `docs/cp-17-…` | **NORMATIVE** | 93 rules: report, terminology, signature, provenance, templates, consent, language, store, document identity |
| `docs/cp-15-…`, `core-01`, `core-11`, `core-12` | **NORMATIVE** | record model, clinical core, mapping, synchronisation |
| `docs/GLOSSARY.md` | **NORMATIVE for wording** | one English term per concept |
| `CLAUDE.md` | **BEHAVIORAL** | how to work in this repo — gates, interface patterns, commit workflow |
| `index.html` | — | the implementation, **never the standard** |

In a conflict `cp-17` wins. **What is done and what is a placeholder: `cp-17` §16.**

## 4. Sanity gates — all ten before every commit

1. brace balance — the **baseline is `-1`**, not `0`
2. `node --check` on the extracted `<script>`
3. **handlers** — every `onclick`/`onchange`/`oninput` has a definition
4. **CSS order** — a media query must not be overridden by a later base rule
5. **undefined tokens** — every `var(--x)` has a definition, including those with a fallback
6. **token drift** — no hex colour outside `:root` that already has a token
7. **translation completeness** — every string in `tt()` and every static label has an entry
8. **conflicting translations** — no key has two different values in one language
9. **source keys** — consistent across the six registers
10. **Slovak leak** — Slovak only in the translation table and in `DEMO-CONTENT`

The scripts do not survive in the environment — rewrite them from `CLAUDE.md` §4.

## 5. Five things that are not obvious and have already hurt

- **Read pinned to a commit SHA, and verify the local file matches after any hint of a
  restart.** If `/tmp` has been emptied, `index.html` may have rolled back too. Editing
  a stale file **silently reverts earlier commits** — this happened at v148 and was
  only repaired at v151. It nearly happened again on 2026-07-24 through a stale CDN read.
- **Every text substitution needs an assert, and the script writes only at the end.** A
  substitution that misses its anchor runs silently and without error. Take the anchor
  from the file you just read — one space is enough (`--phrw:280px}` vs `--phrw:280px }`).
- **Before adding a CSS class, check the name does not exist.** One namespace; a
  collision silently overwrites an unrelated part of the interface (this happened with
  `.card`).
- **`new Map(I18N)` keeps the last entry**, and new pairs are added at the front. A
  duplicate key therefore loses silently and a round trip between languages corrupts the
  text. Gate 8 guards this.
- **Gates do not catch visual defects.** An unreachable button (v133) and a broken
  preview (v147) passed all of them. **Most of the UI since v126 has never been opened
  in a browser.**

## 6. Verified state at handover (v163)

Gates pass · **dead code zero** · 4 730 lines · 220 functions · 98 tokens in `:root`
(zero drift, no undefined `var()`) · 699 `I18N` entries (0 duplicates, 0 conflicts) ·
89 handlers · no field without a label.

**Documentation integrity verified:** 173 normative IDs with no dangling reference ·
all 52 symbols from the `DEV-SUMMARY` §4 map exist in the code · no invalid file
reference · the `README` index covers every file in the repository.

**Known and reasoned debt:** `docs/HANDOFF.md` §4d — orphaned CSS classes, off-scale
spacing in the original components, in-memory store. **None of it is a defect to fix
blind.**

## 7. Where we are

Done: report shell · dual coding (SNOMED for the record, market classification for the
claim) · provenance and audit · AI transparency · templates as a subpage (three
ownership scopes, editor with live preview, extraction from a sample, facility header
and signatories, consent per language) · content freeze at signature · language layer ·
document identity · one document in two views · persistence seam.

**Next step: document creation** — the six-point breakdown is in `docs/HANDOFF.md` §3e.
Recommended split into three commits: *type and template selection* → *population and
coverage* → *signature and output including the print layer* (`I18N-13`, does not exist yet).

Then the **progress note interface** (`INT-01..05`): IQ intake, OCR candidates as
`validated=false`, per-item validation, marking of items carried over from the previous
visit (cloned documentation).

## 8. Open decisions

- **Entry point for document creation** — the dock, the patient detail header, or both?
  A structural change; decide before implementing.
- **Visual check of the prototype** — see §5, last bullet.
- **`cp-17` and `cp-15` in English** — translation pending K35 sign-off (Roman + Marek).

## 9. Outside the code

- **Marek (compliance):** the MDR boundary for IQ · signature level per market · audit
  retention · the EHDS CE regime when moving to `core` mode · India CERT-In · when
  machine translation is sufficient and when human verification is required
- **Registering SNOMED CT usage** with NCZI (Slovakia is a member; usage is registered)
- **Figma:** `tokens.json` → Style Dictionary → Figma Variables (DS '26
  `ombR6X345rSPGaJPfnye7e`). The direction is **code → tokens → Figma**; components go
  the other way — Figma is their source and the code is corrected to match.

---

*Communication: direct, plain language. Blockers at the start, not at the end. A short
confirmation beats elaboration. Structural changes do not approve themselves — ask
before, not after.*

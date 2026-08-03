# Re: request for a Figma link — read the prototype instead

Short answer: **there is no Figma node to send, and you do not need one.** The
authoritative source for DASh tokens, timeline geometry and component rules is the running
cockpit itself, which is public:

```
https://raw.githubusercontent.com/patrikkmec-ivx/prototype/main/index.html
```

Single file, ~625 kB, no credentials. `:root` is near the top of the `<style>` block.
Rendered version: `https://patrikkmec-ivx.github.io/prototype/`

---

## Why the prototype and not Figma

Three reasons, in order of how much they would have cost you:

**1. The Figma DS '26 file carries colours only.** No radius variables, no spacing
variables, no type scale as variables. If you had waited for a Foundations link you would
have received about a third of what you asked for, and would still have had to guess
`--radius-12` and `--space-16`.

**2. Timeline geometry does not exist in Figma at all.** The 24 px rail, the `24px 1fr`
grid, the 2 px connector, the dashed hollow node for planned events, the `inset:-10px`
hit-area extension — these were designed in code. There is no node to inspect.

**3. Some components exist only in code.** The slider (`scale`) and the four-state result
control were built for the UI bridge and have no Figma atom yet. That is a known gap on
our side, not something you should wait on.

Figma and the prototype agree on **naming** — `border/strong` in Figma is
`--border-strong` in code, one to one — which is exactly why reading the code loses you
nothing.

---

## The values in `CARE-PLAN-UI-ALIGNMENT.md` are already the real ones

They were extracted from `index.html` programmatically and checked back against it,
including through the alias chain (`--a1` → `--accent-1-strong` → `#1C93AC`). Zero
mismatches. **Copy that block as-is; do not re-derive it.**

If you would rather verify than trust, this reproduces it:

```bash
curl -s https://raw.githubusercontent.com/patrikkmec-ivx/prototype/main/index.html \
  | sed -n '/:root{/,/^}/p'
```

If a value ever disagrees with the document, the prototype wins and please tell us.

---

## One correction to the framing

> *"prepíšem `:root` v `index.css`, čím sa zmena prejaví okamžite vo všetkých komponentoch"*

Rewriting `:root` is right and is the first step, but it will not by itself make the plan
match — **only if the components actually reference the variables.** A component with
`bg-white`, `rounded-lg` or a literal `#f3f4f6` will not move when the token changes, and
those are Tailwind defaults, so a fresh project is full of them.

We hit exactly this on our side last week: the bridge UI used correct tokens for every
colour and still looked wrong, because it had rebuilt a chip and an input rather than
reusing the existing ones. Correct tokens, wrong components. We added a build check for it.

So the order that works:

1. Rewrite `:root` with the token block.
2. **Map the tokens into the Tailwind theme** so utilities resolve to them, rather than
   leaving Tailwind's palette alongside yours.
3. Grep the codebase for hex literals and for Tailwind colour/radius/spacing utilities
   that bypass the theme. That list is the actual work.
4. Only then compare visually.

Step 3 is where the time goes. Steps 1 and 2 are an hour.

A useful check, worth wiring into the build: **fail if any hex literal appears outside the
token block.** Normalise shorthand first — `#fff` and `#FFFFFF` are the same colour, and a
naive string compare misses it. Ours did, and hid 62 literals for weeks.

---

## Priorities, if the facelift has to be staged

1. **Tokens and Tailwind theme mapping** — colour, radius, spacing, Mulish. Largest
   visible change for the least work.
2. **Fields.** No border at rest, `--surface-1` fill, 40 px minimum, cyan focus ring. A
   bordered input is the single most obvious tell that a screen is not Hilbi.
3. **Timeline.** 24 px rail plus content grid, one card per event, no nested cards.
4. **Buttons.** One cyan per view, size S for dismissals.
5. **Modals → the bridge.** Also fixes the mobile problem where an in-frame dialog has
   nowhere to go. Delete the plan's own modal component once the bridge covers its uses.

Stopping after 1 and 2 already gets most of the way there.

---

## Do not change

Clinical content, field logic, calculations, ordering rules, copy. This is presentation
only. If any instruction in the alignment document conflicts with a clinical requirement,
**the clinical requirement wins** — flag it and we will amend the document rather than
have you work around it.

Also: no plan-level header, no outer card or border around the whole app. The cockpit
supplies the patient header, the tabs and an edge-to-edge workspace. A second header is
the most common way an embed goes wrong, and it costs vertical space the plan needs on a
phone.

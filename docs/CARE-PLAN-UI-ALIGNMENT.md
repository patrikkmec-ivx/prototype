# Care Plan UI — alignment with the Hilbi DASh cockpit

For: care plan applications embedded in the cockpit (SM, Fabry, Dementia, Colorectal)
Scope: **presentation only.** Do not change clinical content, field logic, calculations,
data model or copy. This is a facelift.
Related: `cp-20` (UI bridge protocol), `HILBI-SDK-README.md`

---

## 1. Why

A plan is embedded in the cockpit and read by a clinician who is looking at the patient
header and the cockpit's own timeline at the same time. When the plan uses different
radii, shadows, greys and card shapes, the two read as two products stitched together,
and the eye spends effort on the seam instead of the content.

The goal is not that the plan looks *identical* to the cockpit. It is that a clinician
moving between them notices nothing.

### What NOT to do

- Do not add a header, breadcrumb or title bar. The cockpit already shows the patient
  and the tab. A second header is the most common way an embed goes wrong.
- Do not add an outer card, border or shadow around the whole plan. The cockpit gives
  the plan an edge-to-edge workspace; wrapping it produces a card inside a card.
- Do not add your own modal chrome for anything the bridge can render — see §5.
- Do not restate values. Every colour, radius and spacing below must go through a CSS
  variable. **If you type a hex code anywhere outside the token block, that is the
  defect this document exists to prevent.**

---

## 2. Tokens — copy this block verbatim

These are the cockpit's actual values. Put them in `:root` (or map them into the Tailwind
theme) and reference them everywhere.

```css
:root{
  /* surfaces */
  --surface-white:#FFFFFF; --surface-0:#F7F9FC; --surface-1:#F4F7FB; --surface-2:#EEF1F6;

  /* text — five levels, use them for hierarchy instead of font-size alone */
  --text-heading:#333D6C;   /* titles, values that matter */
  --text-body:#46506B;      /* default reading text */
  --text-muted:#687087;     /* labels, secondary */
  --text-subtle:#8A93A6;    /* timestamps, hints */
  --text-disabled:#BCC4D2;  /* unavailable controls only */

  /* borders — note how light these are; the cockpit separates by space, not by lines */
  --border-default:#E7ECF3; --border-strong:#E1E7EF;

  /* brand */
  --brand-teal:#1C93AC; --brand-teal-text:#0E7D92;
  --brand-cyan:#6AD5E5; --brand-cyan-soft:#E1F5F9; --brand-cyan-ink:#06343E;

  /* status */
  --success:#2BB673; --success-soft:#E4F5EC;
  --warning:#E0883A; --warning-soft:#FCF0DC;
  --danger:#E5484D;  --danger-soft:#FBE7E8;
  --ok:#2E7D5B;      --ok-soft:#E7F5EE;

  /* categorical accents — for grouping, NOT for severity (see §7) */
  --a1:#1C93AC; --a1s:#E1F5F9;   --a2:#3A6FC4; --a2s:#E7EEFA;
  --a3:#5A5BD0; --a3s:#EAEAFA;   --a4:#8B57BE; --a4s:#F1E9F7;
  --a5:#C64A94; --a5s:#F9E8F1;   --a6:#E0568E; --a6s:#FCE7F0;
  --a7:#C0862F; --a7s:#F9F0DD;   --a8:#3E9A6E; --a8s:#E5F4EC;

  /* radius — only these six exist */
  --radius-4:4px; --radius-8:8px; --radius-12:12px;
  --radius-16:16px; --radius-20:20px; --radius-24:24px;

  /* spacing — only these eight exist */
  --space-4:4px; --space-8:8px; --space-12:12px; --space-16:16px;
  --space-24:24px; --space-32:32px; --space-48:48px; --space-64:64px;

  /* type — font first, weight and line-height come with it */
  --font-family:'Mulish',sans-serif;
  --type-h3:700 24px/32px var(--font-family);
  --type-h4:700 20px/28px var(--font-family);
  --type-body-m:400 16px/24px var(--font-family);
  --type-body-s:500 14px/20px var(--font-family);
  --type-label-m:600 14px/20px var(--font-family);
  --type-label-s:600 12px/16px var(--font-family);
  --type-caption:500 12px/16px var(--font-family);
  --type-eyebrow:700 12px/16px var(--font-family);
}
```

Mulish is loaded from Google Fonts, weights 400–800.

**The scales are closed.** Six radii, eight spacings. If a value you want is not in the
list, use the nearest one — do not add `--radius-10`. That constraint is what keeps two
codebases visually identical without anyone policing it.

---

## 3. Timeline

The cockpit timeline is a **two-column grid: a 24 px rail and the content**. The rail
carries a round node and a connecting line; the content carries a card.

```css
.tl-row{ display:grid; grid-template-columns:24px 1fr; gap:13px; }

.tl-rail{ display:flex; flex-direction:column; align-items:center; }
.tl-node{
  width:24px; height:24px; border-radius:50%; flex:none;
  display:flex; align-items:center; justify-content:center;
  background:var(--text-subtle); color:var(--surface-white);
  border:none; padding:0; cursor:pointer; position:relative; z-index:1;
}
.tl-node.is-current{ background:var(--brand-teal); }
.tl-node.is-warning{ background:var(--warning); }
.tl-node.is-urgent { background:var(--danger); }
/* planned is hollow — a future event must not look like it happened */
.tl-node.is-planned{
  background:var(--surface-white); color:var(--text-muted);
  border:1.5px dashed var(--border-strong);
}
.tl-node:hover{ box-shadow:0 0 0 3px var(--brand-cyan-soft); }
/* the 24px node is below the 44px touch minimum, so extend the hit area
   without changing the visual size */
.tl-node::before{ content:''; position:absolute; inset:-10px; }

.tl-line{ width:2px; flex:1; background:var(--border-default); margin-top:4px; }

.tl-card{
  border:1px solid var(--border-default); border-radius:var(--radius-12);
  background:var(--surface-white); overflow:hidden;
  padding:var(--space-12) var(--space-16);
}
```

Card contents, in order: **title** (`--type-label-m`, `--text-heading`), **one line of
context** (`--type-body-s`, `--text-muted`), then a row of small chips for status and
tags. Timestamp goes top-right in `--type-caption` / `--text-subtle`.

Day separators are a centred label in `--type-eyebrow`, `--text-subtle`, uppercase, with
a hairline on both sides.

**One card, one event.** Do not nest cards. If a step has sub-steps, they are rows inside
the card, not cards inside the card.

---

## 4. Can the timeline be flipped?

Yes — three different things could be meant, so decide which:

**a) Newest first (reverse chronological).** Purely an ordering change; the layout is
unaffected. The cockpit puts *planned* items at the top, then today, then history
downward — a clinician opens the record to see what is next, not what happened first.
**If your plan currently runs oldest-first, flipping it to match is worth doing.**

**b) Horizontal instead of vertical.** Technically easy — `grid-auto-flow:column`, rail
becomes a horizontal line. **I would advise against it for the plan.** The plan sits in
the cockpit's centre column, which is roughly 890 px wide on a 1440 laptop and narrower
with both rails open. A horizontal timeline in 890 px shows about four steps before it
scrolls sideways, and horizontal scroll hides content in a way vertical does not — you
cannot see that it exists. Vertical also matches the cockpit timeline directly above it.

**Exception:** a *phase* strip — four to six named phases with a current marker — works
well horizontally, because it is a fixed small number and it is a progress indicator
rather than a list. If the plan already has that (SM has phases with a curve banner),
keep it horizontal and keep the event list vertical. The two are different objects.

**c) Rail on the right instead of the left.** Do not. Left-to-right reading puts the
status marker before the content; on the right it is found after the fact.

---

## 5. Modals — use the bridge, do not build your own

**This is the most important part of this document.**

A modal rendered inside the plan cannot leave the iframe. On a phone the frame is nearly
the whole viewport, so an in-frame dialog has nowhere to go and ends up squeezed between
two header bars.

Anything that is a form, a confirmation or a toast should go through the bridge SDK
(`HILBI-SDK-README.md`). You describe the fields, the cockpit renders the dialog at full
viewport height, in the cockpit's own components, with mobile behaviour handled.

```ts
const r = await hilbi.open({
  surface: 'sheet',
  title: 'Record EDSS',
  fields: [ /* … */ ],
  actions: [{ key:'save', label:'Save', tone:'primary' }],
});
```

**Delete the plan's own modal component once the bridge covers its uses.** Keeping both is
how the two drift apart.

If you must keep an in-frame dialog — you are outside the cockpit, or the bridge does not
cover the case — match this:

```css
.dialog{
  width:520px; max-width:calc(100vw - 32px); max-height:86vh;
  background:var(--surface-white); border-radius:var(--radius-16);
  box-shadow:0 24px 60px rgba(27,35,64,.30);
  display:flex; flex-direction:column; overflow:hidden;
}
.dialog-head{ display:flex; gap:var(--space-12); align-items:center; padding:18px 24px 14px; }
.dialog-body{ flex:1; min-height:0; overflow-y:auto; padding:14px 24px; }
.dialog-foot{ display:flex; gap:var(--space-8); justify-content:flex-end;
              padding:var(--space-12) 24px; border-top:1px solid var(--border-default); }
@media (max-width:744px){
  .dialog{ width:100vw; max-width:100vw; height:100vh; max-height:100vh; border-radius:0; }
}
```

Scrim: `rgba(27,35,64,.30)`. Esc closes. Body scroll locked while open.

---

## 6. Controls

### Buttons — three sizes, and size carries meaning

```css
.btn{
  border-radius:999px; min-height:40px; padding:10px 18px;
  font:var(--type-label-m); cursor:pointer;
  border:2px solid var(--border-default);
  background:var(--surface-white); color:var(--text-heading);
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  white-space:nowrap;
}
.btn--lg{ min-height:48px; padding:12px 22px; font:var(--type-label-l); }
.btn--sm{ min-height:32px; padding:6px 13px; font:var(--type-label-s); border-width:1px; }

.btn--primary{ border:none; background:var(--brand-cyan); color:var(--brand-cyan-ink); }
.btn--ghost  { border-color:transparent; background:none; }
.btn--ghost:hover{ background:var(--surface-1); }
```

- **Cyan fill = commits something.** One per dialog at most.
- **White with border = secondary.**
- **Size S for dismissal** (Close, Cancel). Weight should track consequence, not position.

Do not make a Close button cyan. It teaches the eye that cyan means *press this*, which
is wrong the day it sits next to a destructive action.

### Fields — no border at rest

```css
.field{
  font:var(--type-body-s); padding:10px 14px; min-height:40px;
  border:none; border-radius:var(--radius-8);
  background:var(--surface-1); color:var(--text-heading); width:100%;
}
.field:hover{ background:var(--surface-2); }
.field:focus{ outline:none; background:var(--surface-white); box-shadow:0 0 0 2px var(--brand-cyan); }
.field::placeholder{ color:var(--text-subtle); }
.field:disabled{ background:var(--surface-1); color:var(--text-disabled); }
```

Label above, `--type-label-s`, `--text-muted`, 6 px gap. Sizes: **S 40 px at radius 8**,
**M 48 px at radius 12**. Never below 40 px, and **never a border at rest** — this is the
rule that most visibly separates a Hilbi field from a default one.

### Chips

```css
.chip{
  font:var(--type-label-s); padding:3px 10px; border-radius:999px;
  display:inline-flex; align-items:center; gap:5px; white-space:nowrap;
}
```

Fill `--aNs`, text `--aN`, no border. For status use the semantic pairs
(`--success` on `--success-soft`, and so on).

---

## 7. Two rules that are not aesthetic

**Never encode meaning in colour alone.** Every severity or status must also carry a shape
or a word — an icon, a dashed outline, a label. Roughly one in twelve men has a colour
vision deficiency, and a clinician may be reading on a bad screen in bad light. In the
timeline above, *planned* is hollow **and** dashed **and** labelled, not merely grey.

**Do not use the categorical accents for severity.** `--a1`…`--a8` are for grouping
unrelated things — departments, categories, plan types. Severity uses
success/warning/danger. Mixing them means a purple chip and a red chip look equally
weighted when one is a category and the other is a warning.

---

## 8. Responsive

The plan gets the cockpit's centre column, **not the viewport**:

| Viewport | Plan gets (both cockpit rails open) |
|---|---|
| 1280 | ~732 px |
| 1440 | ~892 px |
| 1920 | ~1372 px |

Design against **890 px**, not 1440. Below 744 px assume phone: single column, full-width
cards, horizontal scroll only for short chip rows, and hit targets at 44 px.

Test inside the cockpit, not standalone — a layout that works at 1440 in its own tab can
still be broken at 890 in the frame.

---

## 9. Definition of done

- [ ] No hex colour, radius or spacing value outside the token block
- [ ] No plan-level header, outer card, border or shadow around the whole app
- [ ] Timeline is a 24 px rail plus content, one card per event, no nested cards
- [ ] Planned/completed/warning differ by **shape or text**, not only colour
- [ ] Dialogs go through the bridge; the plan's own modal component is deleted where
      the bridge covers it
- [ ] Fields have no border at rest and are at least 40 px tall
- [ ] Exactly one cyan button per dialog; dismissals are size S
- [ ] Verified at 890 px **inside the cockpit**, and on a phone
- [ ] Clinical content, calculations and copy are byte-for-byte unchanged

---

## 10. Questions to raise rather than guess

If something here conflicts with a clinical requirement, **the clinical requirement wins**
— tell us and we will change this document. Specifically worth flagging:

1. Anything where the plan needs a control that has no equivalent above.
2. Anywhere the 890 px width forces a compromise you are not comfortable with.
3. Any place where matching the cockpit would make a clinical distinction *less* visible.
   Consistency is not worth a safety regression.

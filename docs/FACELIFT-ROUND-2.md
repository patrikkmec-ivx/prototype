# Facelift — round 2, structure only

The tokens are done. I read `src/index.css`: all 99 variables are present, hex appears only
in the token block, the shadcn layer is mapped to cockpit values, Mulish is loaded and
applied, and you added `--tl-*` timeline tokens we had not asked for. That part is right.

**What did not change is the structure**, and that is what makes the screen still read as a
different product. Three defects, in order of how much they cost.

That the brief did not make this clear enough is on us — it described what good looks like
instead of naming what to delete. This one names it.

---

## 1. Two parallel rails — the largest single problem

Right now each row has **a small dot on a vertical dashed line, and then a separate rounded
icon box**, with a `—` underneath. That is two vertical structures doing one job, and about
100 px of horizontal space spent before any content starts.

The cockpit has **one** rail: a 24 px circle that *is* the icon, on a 2 px line.

**Delete** the dot rail. **Delete** the `—`. **Move the icon inside the node.**

```css
.tl-row  { display:grid; grid-template-columns:24px 1fr; gap:13px; }
.tl-rail { display:flex; flex-direction:column; align-items:center; }

.tl-node{
  width:24px; height:24px; border-radius:50%; flex:none;
  display:flex; align-items:center; justify-content:center;
  background:var(--text-subtle); color:var(--surface-white);
  border:none; padding:0; position:relative; z-index:1;
}
.tl-node svg{ width:14px; height:14px; stroke:currentColor; }

.tl-node.is-current{ background:var(--brand-teal); }
.tl-node.is-warning{ background:var(--warning); }
.tl-node.is-urgent { background:var(--danger); }
.tl-node.is-planned{                       /* hollow: a future step must not look done */
  background:var(--surface-white); color:var(--text-muted);
  border:1.5px dashed var(--border-strong);
}
.tl-node::before{ content:''; position:absolute; inset:-10px; }  /* 44px hit area */

.tl-line{ width:2px; flex:1; background:var(--border-default); margin-top:4px; }
```

The rail is **solid**, not dashed. Dashed is reserved for the *planned* node outline — if
the whole line is dashed, that distinction is gone.

---

## 2. Card inside a card

There is an outer bordered container and, inside it, four bordered cards. Two borders and
two radii nested is the thing that most reliably says "different product".

**But your hierarchy is real** — `Stanovenie diagnózy 0/5` is a phase, and the four rows
are steps inside it. The cockpit has no phase level, so the brief did not cover this, and
"no nested cards" was the wrong instruction for your case. Correction:

**A phase is a heading, not a box.**

```css
.phase{ margin-bottom:var(--space-24); }            /* no border, no background, no radius */
.phase-head{
  display:flex; align-items:baseline; gap:var(--space-8);
  padding:0 0 var(--space-12) 0;
}
.phase-head h3   { font:var(--type-label-m); color:var(--text-heading); }
.phase-head .sub { font:var(--type-caption);  color:var(--text-subtle); }
.phase-head .count{                                  /* 0/5 */
  font:var(--type-label-s); color:var(--text-muted);
  background:var(--surface-1); border-radius:999px; padding:2px 8px;
}
```

Steps keep exactly one border, and it is the only border in the block:

```css
.tl-card{
  border:1px solid var(--border-default); border-radius:var(--radius-12);
  background:var(--surface-white);
  padding:var(--space-12) var(--space-16);
}
.tl-card.is-current{ border-color:var(--brand-cyan); }   /* selection = border, not a shadow */
```

Separate phases by **space** (`--space-24`), not by a container. If a phase must be
collapsible, put the chevron in the heading row — that still needs no box.

---

## 3. Four status chips per row

`Čaká · 0/5 polí · Návšteva · Povinné` is four pills before the reader reaches the title.
Chrome is outweighing content.

- **`Čaká`** — already carried by the node state. Drop it.
- **`0/5 polí`** — plain text at the right end of the title row, `--type-caption`,
  `--text-subtle`. Not a pill.
- **`Návšteva` / `Vyšetrenie`** — this is the one real chip. Keep it, use a categorical
  accent (`--a2` on `--a2s`).
- **`Povinné`** — keep, `--danger` on `--danger-soft`. It is the only one that changes
  what the clinician must do.

Drop the leading `•` from chips — cockpit chips have no bullet:

```css
.chip{
  font:var(--type-label-s); padding:3px 10px; border-radius:999px;
  display:inline-flex; align-items:center; gap:5px; white-space:nowrap;
  border:none;
}
```

The `Zaznamenané údaje:` chips are fine as a group — they are content, not status. Consider
`--surface-1` fill with `--text-muted` so they sit quieter than the status chip above.

---

## Result

Per row: **one** rail, **one** node carrying the icon, **one** card, **two** status chips.
Phases separated by space. Roughly 80 px of horizontal space returned to content, which
matters at the ~890 px the plan gets inside the cockpit.

---

## Check before sending back

- [ ] Only one vertical line per timeline; the icon is inside the node, no separate box
- [ ] No `—` under nodes
- [ ] Rail solid; dashed only on the planned node's outline
- [ ] Exactly one border between the phase heading and the step content
- [ ] Phases separated by space, not by a container
- [ ] At most two status chips per row; field counts are text
- [ ] No bullet inside chips
- [ ] Checked at 890 px, not full width

Nothing here touches clinical content, field logic, calculations or copy. If any of it
would make a clinical distinction less visible, say so and we will change the instruction
rather than have you work around it.

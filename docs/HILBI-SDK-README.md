# Hilbi UI Bridge — plan integration guide

For care plan applications embedded in the Hilbi DASh cockpit.
Protocol: `cp-20` v1. Normative spec: `docs/cp-20-tech-ui-bridge-protocol.md`.

---

## The problem this solves

A plan runs in an `<iframe>`. Nothing rendered inside it can paint outside that
rectangle — `z-index` does not help, and `position: fixed` resolves against the
iframe's own viewport, not the page. **A modal you open inside the plan stays
trapped inside the plan.**

On desktop that is merely awkward. On a phone the frame is nearly the whole
screen, so a dialog has nowhere to go and the plan's own header sits above the
cockpit's — two stacked chrome bars and a squeezed dialog between them.

So: **you describe the dialog, the cockpit renders it.** You get correct mobile
geometry, DS '26 styling and accessibility without implementing any of it.

## Install

Copy `hilbi-sdk.ts` into the project, e.g. `src/lib/hilbi-sdk.ts`. No npm
package, no dependencies — see §10 of the spec for why.

## Connect once, at start-up

```ts
import hilbi from '@/lib/hilbi-sdk';

const inCockpit = await hilbi.connect('sm');   // your plan id in CP_APPS
```

`connect()` resolves **false** when there is no cockpit — the plan is being
served standalone at its own URL. That is a supported mode and must keep
working. Treat the bridge as an enhancement, never a requirement:

```ts
if (hilbi.available()) {
  const r = await hilbi.open({ … });
} else {
  openMyOwnDialog();      // existing inline path, unchanged
}
```

## Open a surface

```ts
const r = await hilbi.open({
  surface: 'sheet',
  title: 'EDSS assessment',
  subtitle: 'Visit 2026-07-14',
  sections: [
    { key: 'fs', title: 'Functional systems', fields: [
      { key: 'pyramidal',  type: 'scale', label: 'Pyramidal',  min: 0, max: 6, required: true },
      { key: 'cerebellar', type: 'scale', label: 'Cerebellar', min: 0, max: 6 },
    ]},
  ],
  fields: [
    { key: 'ambulation', type: 'number', label: 'Ambulation', unit: 'm', min: 0, max: 500 },
    { key: 'calculated', type: 'display', label: 'Calculated EDSS', value: computeEdss(fs) },
  ],
  actions: [{ key: 'save', label: 'Save', tone: 'primary' }],
});

if (r.action === 'save') await persist(r.values);
```

`r.values` is keyed by your field keys. `display` fields are never returned.
A cancel action is added for you if you do not supply one.

## Surfaces

| surface | use for |
|---|---|
| `modal` | forms with more than two fields |
| `sheet` | long forms and questionnaires (full-height on mobile) |
| `confirm` | destructive or irreversible steps |
| `toast` | acknowledgement; resolves immediately, no actions |
| `passthrough` | content you must render yourself — see below |

Shortcuts: `hilbi.confirm(title, opts)` returns a boolean; `hilbi.toast(title)`
never throws, so it cannot break a flow.

## Field types

Ten primitives. They carry **constraints, not clinical meaning** — that is what
lets any plan use the same set without a cockpit change.

| type | value you get back |
|---|---|
| `text`, `textarea` | `string \| null` |
| `number` | `number \| null` — supports `unit`, `refRange`, `min`, `max`, `step` |
| `date` | ISO date string |
| `select` | `string \| null` |
| `multiselect` | `string[]` |
| `checkbox` | `boolean` |
| `scale` | `number \| null` — see the warning below |
| `result` | `'pos' \| 'neg' \| 'pending' \| 'na' \| null` |
| `display` | read-only; not returned |
| `group` | `object[]` — repeatable rows |

### `result` — use it instead of a select

Tri-state clinical results are the most repeated shape across plans: OCB, AQP4,
MOG, ANA, ANCA, HIV, syphilis, JCV, TBC, HBV, VZV. As a first-class type they
render consistently and — importantly — **`neg` and `na` stay distinct**.
"Negative" and "not tested" are not the same clinical statement, and rolling
both into an empty string loses that.

### `scale` starts unset, and that is deliberate

A scale with no `default` renders as `—`, and returns `null` until the clinician
moves it. It does **not** sit at its minimum.

On a clinical scale the minimum is a real reading — EDSS 0 means *normal* — so
parking the slider there would have the cockpit assert a finding nobody made,
and would make `required` impossible to fail. Set `default` explicitly only when
a starting value is clinically correct.

### `number` with unit and reference range

```ts
{ key: 'vitaminD', type: 'number', label: 'Vitamin D',
  unit: 'nmol/L', refRange: { low: 75, high: 250 } }
```

The cockpit shows the unit and marks out-of-range values — **it does not block
them**, because out-of-range is often exactly what is being recorded. Ranges
vary by laboratory and market, so they belong to you.

### Computed values are `display`

`calculatedEdss`, `bmi`, `fsSummary` — you compute them, you send the result.
**The cockpit never calculates.** A BMI formula in the cockpit would be a
clinical rule in the wrong layer.

### Conditional fields

```ts
{ key: 'allergiesOther', type: 'textarea', label: 'Describe',
  dependsOn: { key: 'allergies', op: 'includes', value: 'other' } }
```

Ops: `eq`, `ne`, `includes`, `gt`, `lt`, `truthy`. Siblings only. A hidden field
is not validated and comes back `null`.

### Repeatable groups

```ts
{ key: 'customTests', type: 'group', label: 'Additional tests',
  repeatable: { max: 20, addLabel: 'Add test' },
  fields: [ { key: 'name', type: 'text', label: 'Test' },
            { key: 'value', type: 'text', label: 'Result' } ] }
```

One level only. A group cannot contain a group — if you need deeper nesting,
that is the signal to use `passthrough`.

## Validation — where the line is

The cockpit checks **structure**: required present, number within `min`/`max`,
date parses, selection among `options`.

The cockpit does **not** check clinical rules. That an EDSS of 6.5 contradicts
the recorded ambulation distance is your judgement, not the cockpit's. Re-open
the surface with your own message, or refuse on your side.

This is not fussiness: a cockpit that ruled on clinical values would take on
medical-device regulatory weight that the orchestrator posture is designed to
avoid.

## Patient context

```ts
const { granted, context } = await hilbi.context(['patient.demographics']);
if (granted.includes('patient.demographics')) use(context.patient);
```

You may be granted a **subset** — always handle that. Every grant is audited by
the cockpit, because it is a disclosure of patient data to a separate
application.

**Context never arrives in your URL.** A query string reaches gateway logs, the
`Referer` header of every outbound request your app makes, and browser history.
That is the most common way patient data escapes an otherwise correct
integration. Ask for it; do not read it off the address bar.

## `passthrough` — the escape hatch

Some things cannot be described declaratively: an interactive chart, a canvas,
an image annotator. Rather than bend the field schema until it collapses:

```ts
await hilbi.open({ surface: 'passthrough', title: 'Lesion map',
                   url: '/embed/lesion-map' });   // MUST be same-origin
```

You get a correctly sized surface and render into it yourself. You lose the
cockpit's visual consistency and keep the mobile geometry.

**If more than roughly one dialog in ten needs this, the field schema is wrong
and should be extended.** Tell us instead of working around it.

## Version drift is expected

Each plan holds its own copy of the SDK, so copies will drift. The handshake is
what makes that safe: `connect()` learns what the cockpit supports, an
unsupported surface falls back to `modal`, an unsupported field type falls back
to `text`. **A plan may be published before the cockpit catches up.**

Never hard-code an assumption about cockpit capabilities. Ask
`hilbi.capabilities()`.

## Checklist before you ship a plan

- [ ] The plan still works standalone at its own URL with the bridge absent
- [ ] `connect()` failure renders the inline path, not an error
- [ ] No patient identifier is read from the URL
- [ ] Clinical validation lives in the plan, not in field constraints alone
- [ ] `scale` fields have no `default` unless a starting value is clinically right
- [ ] `passthrough` used sparingly, and always same-origin

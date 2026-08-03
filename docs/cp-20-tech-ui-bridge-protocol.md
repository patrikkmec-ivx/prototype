# cp-20 — Care Plan UI Bridge Protocol

Status: **v0.9 draft-for-approval** · Owner: Patrik Kmec · Approvers: Roman Kucera (architecture), Marek (compliance)
Applies to: Hilbi DASh cockpit ↔ embedded Care Plan applications
Language: English (D17). Clinical content authored by a physician is exempt and is translated separately.

---

## 1. Why this exists

A care plan runs inside an `<iframe>` in the cockpit. Browser framing rules mean **no content inside
that frame can paint outside its rectangle** — not with `z-index`, not with `position:fixed`, which
resolves against the iframe's own viewport. A modal opened by the plan is therefore confined to the
plan's box.

On a phone that is unusable: the frame is already most of the viewport, so a dialog inside it has
nowhere to go. The alternative — rebuilding each plan's dialogs in the cockpit — duplicates UI, and
every new plan would require a cockpit release.

This protocol is the third way. **The plan describes what it needs; the cockpit renders it.** The
plan never ships dialog chrome; the cockpit never learns clinical domain.

### 1.1 What this is not

- Not a rendering channel. A plan MUST NOT send HTML, CSS or executable code. See §8.
- Not a validation authority. The cockpit checks structure only; clinical validity belongs to the
  plan (§6.4). This matters for regulatory scope: a cockpit that judged clinical values would take
  on medical-device weight the orchestrator posture (`cp-17` REP-01) is designed to avoid.
- Not a data store. The cockpit does not persist payloads. The plan owns its data.

---

## 2. Normative rules

- **BR-01** The transport is `window.postMessage` between the cockpit window and the plan's iframe.
- **BR-02** Every message carries `v` (protocol major version, integer). A receiver that does not
  support `v` MUST reply `ui.error` with `code: "unsupported_version"` and MUST NOT guess.
- **BR-03** Every message carries `id`, a correlation identifier unique within the session. A
  response MUST echo the `id` of the request it answers.
- **BR-04** Both sides MUST verify `event.origin` against an allowlist before acting on a message.
  The cockpit's allowlist is derived from `CP_APPS`. A message from an unlisted origin MUST be
  discarded silently — no reply, since a reply confirms the listener exists.
- **BR-05** The verb set is closed: `ready`, `ui.open`, `ui.close`, `ui.result`, `ui.error`,
  `ctx.request`, `ctx.provide`. Adding a verb is a protocol version change.
- **BR-06** The surface set is closed: `modal`, `sheet`, `confirm`, `toast`, `passthrough`. Adding
  a surface is a protocol version change.
- **BR-07** The cockpit MUST render exactly one plan-owned surface at a time. A second `ui.open`
  while one is open MUST be answered with `ui.error`, `code: "surface_busy"`.
- **BR-08** The cockpit MUST NOT interpret field semantics. It renders a field by its `type` and
  reports back what the user entered. `edss` is a number with a range; the cockpit does not know
  what EDSS means.
- **BR-09** A payload MUST NOT exceed 256 KB serialised. Larger MUST be rejected with
  `code: "payload_too_large"`.
- **BR-10** The cockpit MUST treat every string in a payload as untrusted input and escape it on
  render.
- **BR-11** Patient identifiers MUST NOT travel in the iframe URL. Context is delivered only through
  `ctx.provide`, after `ready`. See `HANDOFF` §5j and §7 below.
- **BR-12** The cockpit MUST NOT persist payload contents beyond the lifetime of the open surface,
  except for the `AuditEvent` described in §9.

---

## 3. Handshake

The plan announces itself; the cockpit answers with what it supports. This is what allows a plan to
be published before the cockpit catches up, and a cockpit to be upgraded without touching plans.

```
plan  → cockpit   { v:1, id:"…", type:"ready",
                    plan:"sm", sdk:"1.0.0",
                    supports:{ surfaces:["modal","sheet","confirm"], fields:[…] } }

cockpit → plan    { v:1, id:"…", type:"ready",
                    cockpit:"v180",
                    supports:{ surfaces:["modal","sheet","confirm","toast"],
                               fields:["text","textarea","number","date","select",
                                       "multiselect","checkbox","scale","result","display"] },
                    locale:"sk", theme:"ds26" }
```

- **HS-01** The plan MUST NOT send any other verb before it has received the cockpit's `ready`.
- **HS-02** If the cockpit does not answer `ready` within 2000 ms, the plan MUST assume no bridge is
  present and fall back to rendering inline. **A plan must remain usable standalone** — it is also
  served directly at its own URL.
- **HS-03** A plan MUST NOT use a surface or field type absent from the cockpit's `supports`. It
  MUST degrade: an unsupported surface falls back to inline rendering, an unsupported field type
  falls back to `text`.

---

## 4. Surfaces

| Surface | Cockpit renders as | Use for |
|---|---|---|
| `modal` | centred dialog, max 720 px | forms with more than two fields |
| `sheet` | bottom sheet on mobile, side panel ≥ 745 px | long forms, questionnaires |
| `confirm` | small dialog, two actions | destructive or irreversible steps |
| `toast` | transient strip, no actions | acknowledgement; resolves immediately |
| `passthrough` | empty surface of the right geometry | see §4.1 |

### 4.1 `passthrough` — the deliberate escape hatch

Some content cannot be described declaratively: an interactive chart, a drawing canvas, an image
annotator. Without an escape hatch, teams bend the schema until it collapses under special cases.

`passthrough` opens an empty, correctly sized surface and lets the plan render into it through its
own nested iframe, whose URL the plan supplies. The plan loses the cockpit's visual consistency and
keeps the correct geometry.

- **PT-01** `passthrough` MUST carry a `url` on the same origin as the plan. Cross-origin MUST be
  rejected with `code: "origin_mismatch"`.
- **PT-02** The nested frame inherits the same sandbox as the plan frame.
- **PT-03** Expected to be rare. **If more than roughly one dialog in ten uses `passthrough`, the
  field schema is wrong and should be extended instead.** Treat that ratio as a design signal.

---

## 5. `ui.open`

```jsonc
{
  "v": 1, "id": "…", "plan": "sm", "type": "ui.open",
  "surface": "sheet",
  "title": "EDSS assessment",
  "subtitle": "Visit 2026-07-14",          // optional
  "sections": [                             // optional; fields may sit at top level instead
    { "key": "fs", "title": "Functional systems", "fields": [ … ] }
  ],
  "fields": [ … ],
  "actions": [
    { "key": "save",   "label": "Save",   "tone": "primary" },
    { "key": "cancel", "label": "Cancel", "tone": "ghost", "dismiss": true }
  ]
}
```

- **OP-01** `actions` MUST contain at least one action with `dismiss: true`, or the cockpit MUST add
  a cancel affordance itself. A surface the user cannot leave is a defect.
- **OP-02** `tone` is one of `primary`, `default`, `ghost`, `danger`. It carries emphasis, not
  meaning.
- **OP-03** Sections exist because real plans are grouped — the SM contract carries twelve groups
  (Patient, Diagnosis, EDSS, MRI, CSF, Labs, Pre-treatment, OCT, Neurofilaments, Differential,
  Treatment, Communication). A flat field list is unreadable past about eight fields.

---

## 6. Fields

Ten types. Each is a **primitive with constraints**, never a clinical concept. This is the property
that makes the protocol scale: a plan for Fabry disease, dementia or colorectal cancer reaches for
the same ten types, and **the cockpit needs no change to support a new plan**.

| type | value shape | key options |
|---|---|---|
| `text` | string | `maxLength`, `placeholder` |
| `textarea` | string | `rows`, `maxLength` |
| `number` | number \| null | `min`, `max`, `step`, `unit`, `precision`, `refRange` |
| `date` | ISO-8601 date string | `min`, `max` |
| `select` | string \| null | `options[]` |
| `multiselect` | string[] | `options[]`, `max` |
| `checkbox` | boolean | — |
| `scale` | number \| null | `min`, `max`, `step`, `labels{}` |
| `result` | `"pos"` \| `"neg"` \| `"pending"` \| `"na"` \| null | `posLabel`, `negLabel` |
| `display` | not editable | `value`, `tone` |

Common to all: `key` (required, unique), `label` (required), `help`, `required`, `default`,
`readOnly`, `dependsOn`.

### 6.0 DRAFT primitives — v0.9, awaiting sign-off (Roman + Marek)

> **Status: not ratified.** These three were built into the cockpit renderer (v188) so they could
> be *seen and judged* against the STEP-1 MRI modal, after the review asked to adopt the care plan's
> carded body ("prebrať všetko okrem hlavičky a buttons"). They are visually complete and round-trip
> through `brgVal`/`brgSet`, but they are **not part of the ratified contract**: no plan should build
> against them until this section loses the DRAFT marker. They are recorded here rather than accreted
> silently precisely because §12 warns the contract must not reach v1.0 by accretion. Demo:
> *Care plans → Step 1 — MRI (cp-20 draft)*.

| type / option | value shape | key options | notes |
|---|---|---|---|
| `toggle` *(field type)* | boolean | — | Same value shape as `checkbox`; rendered as a switch in a bordered box (label left, control right) rather than a checkbox+label row. Open question for sign-off: is a second boolean primitive justified, or should this be a *render hint* on `checkbox` (e.g. `style:"switch"`) so transport keeps one boolean type? |
| `columns` *(section option)* | integer ≥ 1 | on a `section` | Lays the section out as an *n*-column grid. A field with `wide: true`, and every `textarea`/`group`/`multiselect`, spans all columns. Purely presentational; changes no value. |
| `collapsible` / `collapsed` *(section options)* | boolean | on a `section` | Renders the section as an expandable group (the "Voliteľné polia" pattern); `collapsed: true` starts closed. Presentational. Open question: should a collapsed **required** field ever be hidden, or must validation force-expand its section? Current renderer keeps validation working (a required field still blocks Save) but does not yet auto-expand — flagged for Marek. |

Field option added by this draft: `wide` (boolean) — span all grid columns; no effect outside a `columns` section.

### 6.1 Why `result` is its own type

A tri-state clinical result is the single most repeated shape in the SM contract — oligoclonal
bands, AQP4, MOG, ANA, ANCA, HIV, syphilis, borrelia, thyroid, JCV, TBC, HBV, VZV. Expressing it as
a `select` would force every plan to re-declare the same option list and invent its own labels, and
"not tested" would drift between `null`, `""` and `"unknown"`. As a first-class type the cockpit
renders it consistently and the distinction between *negative* and *not tested* — clinically not the
same thing — cannot be lost in transport.

### 6.2 `number` carries unit and reference range

```jsonc
{ "key":"vitaminD", "type":"number", "label":"Vitamin D",
  "unit":"nmol/L", "min":0, "max":400, "precision":1,
  "refRange":{ "low":75, "high":250 } }
```

The cockpit shows the unit, and marks a value outside `refRange` visually. **It does not block it**
— out-of-range is often exactly what is being recorded. Reference ranges vary by laboratory and by
market, so they belong to the plan, not to the cockpit.

### 6.3 `display` — computed values are output, not input

The SM contract has fields that are calculated, never typed: `calculatedEdss` from the functional
systems, `vitalsBmi` from height and weight, `fsSummary`, `lesionLocationsText`. They appear on the
same surface as the inputs, so they need representation — but as read-only output.

- **FD-01** The **plan** computes them and sends the result. The cockpit MUST NOT calculate. A BMI
  formula in the cockpit is a clinical rule in the wrong layer.
- **FD-02** A `display` field is never returned in `ui.result`.

### 6.4 Validation boundary

The cockpit enforces **structure**: required present, number within `min`/`max`, date parses,
selection is among `options`.

The cockpit does not enforce **clinical rules**. That an EDSS of 6.5 is inconsistent with the
recorded ambulation distance is the plan's judgement. The plan reports it by re-opening the surface
with `fieldErrors`, or by refusing to proceed on its own side.

### 6.5 Repeatable groups

`customTests` in the SM contract is a free list of laboratory tests. A fixed field list cannot
express it.

```jsonc
{ "key":"customTests", "type":"group", "label":"Additional tests",
  "repeatable":{ "min":0, "max":20, "addLabel":"Add test" },
  "fields":[ { "key":"name",  "type":"text",   "label":"Test" },
             { "key":"value", "type":"text",   "label":"Result" },
             { "key":"date",  "type":"date",   "label":"Date" } ] }
```

Value is an array of objects. **Nesting is limited to one level** — a repeatable group MUST NOT
contain another. This is a deliberate ceiling: deeper nesting is a sign the plan should own the
surface through `passthrough`.

### 6.6 Conditional fields

```jsonc
{ "key":"allergiesOther", "type":"textarea", "label":"Describe allergies",
  "dependsOn":{ "key":"allergies", "op":"includes", "value":"other" } }
```

Operators: `eq`, `ne`, `includes`, `gt`, `lt`, `truthy`. A hidden field is not validated and is
returned as `null`. Conditions reference sibling fields within the same surface only.

---

## 7. Patient context

Context is requested, never pushed in the URL (`BR-11`).

```
plan  → cockpit  { v:1, id:"…", type:"ctx.request", scope:["patient.demographics"] }
cockpit → plan   { v:1, id:"…", type:"ctx.provide", granted:["patient.demographics"],
                   context:{ patient:{ id:"…", displayName:"…", birthDate:"…", sex:"…" } } }
```

- **CX-01** Scopes are coarse and closed: `patient.demographics`, `patient.identifiers`,
  `encounter.current`, `practitioner.current`.
- **CX-02** The cockpit MAY grant a subset. The plan MUST handle a partial grant.
- **CX-03** Every `ctx.provide` MUST write an `AuditEvent` recording plan, scope and time. This is
  a disclosure of patient data to a distinct application and must be evidenced.
- **CX-04** In `overlay` mode the cockpit passes through only what the host system has released to
  it. It MUST NOT synthesise identifiers.

---

## 8. Security

- **SE-01** Origin allowlist in both directions (`BR-04`).
- **SE-02** No HTML, no scripts, no URLs in a payload except `passthrough.url` (`PT-01`).
- **SE-03** Payload strings escaped on render (`BR-10`).
- **SE-04** 256 KB cap (`BR-09`).
- **SE-05** Production requires a CSP `frame-src` allowlist at the gateway. Out of scope for the
  prototype, in scope for launch.
- **SE-06** An embedded plan is a **distinct data-flow boundary**. Whether the plan service is a
  processor or a separate controller, and whether a plan hosted outside the EU environment is
  acceptable under the platform's regional isolation, are open questions for Marek — recorded here
  because the protocol makes the flow easy and the flow is the risk.

---

## 9. Audit

- **AU-01** `ctx.provide` MUST be audited (`CX-03`).
- **AU-02** `ui.open` MUST be audited as an interaction event: plan, surface, field keys, time.
  **Field values MUST NOT be audited** — they are clinical content owned by the plan, and the
  cockpit's audit trail is not their store.
- **AU-03** Rejected messages (bad origin, oversized, unsupported version) MUST be audited. A
  rejection is a security event.

---

## 10. Versioning

The protocol carries a major version in `v`. Additive change — a new optional field option, a new
field type — does not increment it, because the handshake already lets a plan discover what it can
use. Removing or changing the meaning of anything does increment it, and the cockpit MUST then
support both versions until every plan in `CP_APPS` has migrated.

`hilbi-sdk.ts` is distributed **by copy**, not as an npm dependency. Plans are static Vite builds;
a shared package would mean publishing, versioning and rebuilding every plan for any change. Copies
drift, and the handshake is what makes drift survivable. This is a deliberate trade, and it is the
reason `HS-03` is normative rather than advisory.

---

## 11. Conformance

| Rule | Prototype status |
|---|---|
| BR-01..BR-12 | to be implemented in `index.html` (v180) |
| HS-01..HS-03 | to be implemented |
| Field types §6 | ten types, validated against `sm-plus.contract.ts` |
| CX-01..CX-04 | `ctx.request` / `ctx.provide` implemented; demo data only |
| SE-05 | ✗ gateway concern, not prototype |
| SE-06 | ✗ open for Marek |
| AU-01..AU-03 | audited through the existing `logAudit` seam |

## 12. Open points

1. **SE-06** — processor vs controller, and non-EU hosting of a plan. Marek.
2. **Offline** — a plan may be embedded where the cockpit has no connectivity. Unspecified.
3. **Field-level i18n** — labels arrive from the plan already localised, so the plan owns
   translation while the cockpit owns chrome. Acceptable now; revisit if a plan ships only Slovak
   while the cockpit runs English (`I18N-13` tension).
4. **`scale` versus questionnaires** — PHQ-9 is nine `scale` fields, MSIS-29 is twenty-nine. It
   works, but a `questionnaire` field type carrying an item bank may be worth it once several plans
   render the same instruments.

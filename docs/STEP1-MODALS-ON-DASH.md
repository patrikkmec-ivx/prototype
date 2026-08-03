# Step 1 "Stanovenie diagnózy" — move the modals onto DASh

Every modal in step 1 opens on the cockpit instead of inside the plan iframe. Field keys
below are taken from `sm-plus.contract.ts` — **do not rename them**; they are what your
mappers and the OCR aliases already emit.

Protocol: `cp-20` v1. Client: `hilbi-sdk.ts`.

---

## What changed in the cockpit for this

Your intake modal needed three things the bridge did not have. All three are live now, and
all three are generic rather than SM-specific.

**1. `toolbar` — actions that fill the form.** *Nahrať / Odfotiť / Vložiť z NIS* sit above
the fields, not in the footer. They are inputs to the form; putting them next to Save would
read as four equal commits.

**2. `ui.update` — write into an open surface.** This one was the blocker. SM is OCR-driven
end to end, and without it an upload would have forced the surface closed and reopened,
discarding anything already typed. `ui.update` fills only the keys you send; **a field you
do not mention keeps exactly what the clinician put there.** Verified.

**3. `templates` on `textarea`.** Your per-field *Štandardná* picker. The cockpit will not
silently overwrite edited text — if the field holds something that is not an unmodified
template, it asks first.

---

## The OCR round trip

```ts
const r = await hilbi.open({ surface:'sheet', title:'Vstupné vyšetrenie',
  toolbar:[{key:'upload',label:'Nahrať',icon:'file'},
           {key:'photo', label:'Odfotiť',icon:'cam'},
           {key:'nis',   label:'Vložiť z NIS',icon:'bldg'}],
  sections:[/* … */], actions:[/* … */] });
```

```ts
hilbi.onToolbar(async ({ action }) => {
  hilbi.update({ busy:true });                 // dims the form while you work
  const extracted = await runOcr(action);      // your existing pipeline
  hilbi.update({ busy:false, values: extracted });
});
```

Send only what OCR actually found. Sending `null` for a key it missed would erase a value
the clinician typed by hand.

Icons available: `file`, `cam`, `scan`, `bldg`, `flask`, `tube`, `steth`, `pill`, `clip`,
`user`, `cal`, `pen`, `search`. Anything else falls back to a label-only button.

---

## 1.1 Vstupné vyšetrenie — `intake`

Surface `sheet`. This is the largest of the five; keep the sections.

| section | key | type | notes |
|---|---|---|---|
| Vyšetrenie | `referralSource` | `select` | |
| | `performedDate` | `date` | OCR alias `visitDate` |
| Anamnéza | `reasonForVisit` | `textarea` | template *Štandardná* |
| | `presentIllness` | `textarea` | TO |
| | `personalHistory` | `textarea` | OA — text |
| | `familyHistory` | `textarea` | RA |
| | `symptomOnsetNarrative` | `textarea` | |
| | `onsetDate` | `date` | |
| | `priorEpisodes` | `checkbox` | |
| | `priorEpisodesNarrative` | `textarea` | `dependsOn: priorEpisodes truthy` |
| Komorbidity a alergie | `comorbidities` | `multiselect` | |
| | `comorbiditiesOther` | `textarea` | `dependsOn: comorbidities includes 'other'` |
| | `allergies` | `multiselect` | AA checklist |
| | `allergiesOther` | `textarea` | `dependsOn: allergies includes 'other'` |
| | `medications` | `multiselect` | |
| | `riskFactors` | `multiselect` | |
| Subjektívne | `subjective` | `textarea` | |
| | `subjectiveSymptoms` | `multiselect` | |
| Objektívne a vitály | `objectiveFinding` | `textarea` | |
| | `vitalsBp` | `text` | free form, `140/90` |
| | `vitalsPulse` | `number` | unit `/min` |
| | `vitalsHeight` | `number` | unit `cm` |
| | `vitalsWeight` | `number` | unit `kg` |
| | `vitalsBmi` | **`display`** | **you compute it, the cockpit never calculates** |
| | `vitaminDLevel` | `number` | unit `nmol/L`, `refRange {low:75, high:250}` |

## 1.2 MRI mozgu a miechy — `mri`

Surface `sheet`.

| key | type | notes |
|---|---|---|
| `performedDate` | `date` | |
| `newT2Lesions` | `number` | `min:0`, `step:1` |
| `enlargingT2Lesions` | `number` | `min:0`, `step:1` |
| `gadEnhancing` | `number` | `min:0`, `step:1` |
| `lesionLocations` | `multiselect` | periventrikulárne, juxtakortikálne, infratentoriálne, spinálne |
| `atrophyPresent` | `checkbox` | |
| `atrophyAssessment` | `select` | `dependsOn: atrophyPresent truthy` |
| `mcdonaldDIS` | `checkbox` | |
| `mcdonaldDIT` | `checkbox` | |
| `conclusion` | `textarea` | OCR alias `conclusion` → `summary` |

`lesionLocationsText` is `computed:true` in the contract — **do not send it as a field.**

## 1.3 CSF vyšetrenie — `csf`

Surface `modal`; only four fields.

| key | type | notes |
|---|---|---|
| `performedDate` | `date` | |
| `ocb` | **`result`** | not a select — see below |
| `iggIndex` | `number` | `step:0.01` |
| `kappaChains` | `number` | |

## 1.4 Laboratórne vyšetrenie — `lab`

Surface `modal`. Every value carries a unit and a reference range; the cockpit marks
out-of-range but **does not block it** — out of range is often the point.

| key | type | unit | LOINC |
|---|---|---|---|
| `performedDate` | `date` | | |
| `crpValue` | `number` | mg/L | 1988-5 |
| `altValue` | `number` | µkat/L | 1742-6 |
| `astValue` | `number` | µkat/L | 1920-8 |
| `lymphocytesValue` | `number` | ×10⁹/L | 731-0 |

Reference ranges vary by laboratory and market, so they belong to the plan. Send them.

## 1.5 Diferenciálna diagnostika — `differential`

Surface `sheet`. **Every serology here is `result`, not `select`.**

`hivResult`, `syphilisResult`, `aqp4Result`, `mogResult`, `anaResult`, `ancaResult`,
`borreliaIgG` → `type:'result'`
`vitB12`, `folate`, `tsh` → `number` with unit
`mimicChecklist` → `multiselect`
`customTests` → `group` with `repeatable`, sub-fields `name` / `value` / `date`
`conclusionText` → `textarea`

The structured sub-objects (`ena`, `anca`, `borreliaStructured`, `thyroid`,
`antiphospholipid`) do not map to a flat surface. Either flatten them into `result` fields
per analyte, or keep that one dialog in-frame for now. **Do not force them into a `group`.**

## 1.6 Stanovenie diagnózy — `diagnosis`

Surface `modal`, and this is the step's conclusion.

| key | type | notes |
|---|---|---|
| `icd10Code` | `select` | G35, G36.0, … |
| `phenotype` | `select` | RRMS / SPMS / PPMS / CIS / RIS |
| `mcdonaldDIS` | `checkbox` | |
| `mcdonaldDIT` | `checkbox` | |
| `diagnosisConfirmed` | `checkbox` | |
| `performedDate` | `date` | OCR alias `confirmedDate` |
| `expectedCourse` | `textarea` | |
| `notes` | `textarea` | |

Confirming a diagnosis is consequential. Use `hilbi.confirm()` before committing, with
`danger: false` — it is significant, not destructive.

---

## Two things worth restating

**`result`, not `select`, for every finding.** `ocb`, `hivResult`, `aqp4Result` and the
rest are tri-state plus *not tested*. A select would let *negative* and *not tested*
collapse into the same empty value, and those are not the same clinical statement. The
`result` type keeps them apart in the UI and in transport.

**`display` for anything computed.** `vitalsBmi`, `calculatedEdss`, `fsSummary`,
`lesionLocationsText` — the plan computes, the cockpit shows. A BMI formula in the cockpit
would put a clinical rule in the wrong layer, and `display` values are never returned in
`ui.result`, so they cannot round-trip and drift.

---

## What the cockpit will not do

Validate clinically. It checks required, range, date parsing and option membership. That an
EDSS of 6.5 contradicts a recorded ambulation distance is your judgement — re-open with
your own message, or refuse on your side. A cockpit that ruled on clinical values would
take on medical-device weight this architecture exists to avoid.

---

## Checklist per modal

- [ ] Field keys match `sm-plus.contract.ts` exactly
- [ ] Findings are `result`; computed values are `display`
- [ ] Numbers carry `unit`, and `refRange` where a laboratory range exists
- [ ] `ui.update` sends only keys OCR actually found — never `null` for a miss
- [ ] The plan's own modal component is deleted for these six once they work
- [ ] Verified at ~890 px inside the cockpit, and on a phone

Once these six are on the bridge, step 1 has no in-frame dialog left — which is the point.
On a phone the difference should be immediate.

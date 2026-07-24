---
id: GSR-TECH-TERMINOLOGY
title: Terminology systems — sources, licences, bindings, release cadence
collection: gsr
area: tech
type: reference
owner: patrik
status: draft
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [terminology, snomed, icd, loinc, atc, rxnorm, licensing]
related: [GSR-TECH-KB, GSR-TECH-INTERNAL-REGISTRIES, cp-17, core-01]
classification: Confidential — internal
---

# Terminology systems

> **Authority: INFORMATIVE.** Binding rules on coding live in `cp-17` §3 (`TERM-01..09`).
> This document says where each system comes from, what it costs, how often it changes
> and which slot it binds to.

**The rule that shapes everything below:** a code is never obtained by vector search.
Terminology lives behind a terminology server and is resolved with `$expand`,
`$validate-code`, `$translate` and `$lookup`. A code must be exact and verifiable, not
probable (`GSR-TECH-KB` §0).

---

## 1. Systems

| System | Source | Licence | Cost | Release cadence |
|---|---|---|---|---|
| **SNOMED CT** International + national editions | MLDS via the national release centre: SK NCZI · CZ ÚZIS · DE BfArM · IN NRCeS · US NLM · AE DoH | Affiliate licence; **registration with the NRC is mandatory** | **Free** — all six markets are members of SNOMED International | International twice a year; national editions vary |
| **SNOMED CT IPS Free Set** | snomed.org | Free set, also for non-member countries | Free | with the International release |
| **Common Drug Codes for India (CDCI)** | NRCeS | SNOMED CT India drug extension, ISO IDMP model, RF2 | Free | synchronised with SNOMED CT International |
| **LOINC** | loinc.org | LOINC licence, attribution, registration | Free | twice a year |
| **MKCH-10** (SK) | NCZI | national classification | Free | annual |
| **MKN-10** (CZ) | ÚZIS | national classification | Free | annual |
| **ICD-10-GM**, **OPS** (DE) | BfArM | free download, BfArM copyright | Free | annual |
| **ICD-10-CM / PCS** | CDC NCHS, CMS | public domain | Free | annual, 1 October |
| **ICD-11** | WHO ICD API | **CC BY-ND 3.0 IGO** — no derivatives | Free | continuous |
| **ATC / DDD** | atcddd.fhi.no | search free; the file via the ordering portal; **citation required** | Free / about €200 a year | annual, January |
| **RxNorm** | NLM | UMLS licence; use the *Prescribable Content* subset for redistribution | Free | monthly |
| **UMLS Metathesaurus** | NLM | free licence, **redistribution of subsets prohibited**, source categories 0–4 | Free | twice a year |
| **UCUM** | Regenstrief | free licence | Free | irregular |
| **EDQM Standard Terms** | EDQM | registration and licence; **charged for commercial use** | Paid | continuous |
| **CPT** | AMA | **strictly commercial**, per seat, redistribution prohibited | Paid | annual |
| **HCPCS** | CMS | public domain | Free | quarterly |
| **MedDRA** | ICH / MSSO | subscription by revenue; a System Developer tier exists | Paid | twice a year |

> **ICD-11 and NoDerivatives.** Transforming the content into our own structure —
> including storing derived forms — is legally doubtful under a `ND` licence. Until we
> genuinely need ICD-11, use the WHO API rather than a local copy.

---

## 2. Binding — which slot takes which system

Per `TERM-04`. This is **configuration per market** (`TERM-07`), never a branch in logic.

| Slot | EU (SK/CZ/DE) | US | IN | AE |
|---|---|---|---|---|
| Clinical record | SNOMED CT | SNOMED CT | SNOMED CT + CDCI | SNOMED CT |
| Claim / diagnosis | MKCH-10 · MKN-10 · ICD-10-GM | ICD-10-CM | ICD-10 | **ICD-10-CM** |
| Laboratory (O) | LOINC | LOINC | LOINC | LOINC |
| Medication (P, rx) | ATC | RxNorm | CDCI + ATC | ATC + Dubai Drug Code |
| Procedures | national list | CPT / HCPCS | national | CPT |
| Units | UCUM | UCUM | UCUM | UCUM |
| Dose forms, routes | EDQM Standard Terms | — | — | — |

`S` is predominantly narrative and **must not be forced into a code** (`TERM-04`).

---

## 3. Rules that come from licensing, not from architecture

1. **SNOMED CT is free in all six markets, but registration is not optional.** Each
   national release centre must be notified of the deployment (`TERM-09`). Free of charge
   is not the same as free of process.
2. **UMLS must not be redistributed as a subset.** It may be embedded in an application;
   it may not be exposed as a downloadable or fully browsable vocabulary.
3. **RxNorm full release contains restricted sources.** For anything leaving our systems,
   use the *Prescribable Content* subset.
4. **CPT is a per-seat cost in the US and the UAE.** It appears in the budget as soon as
   either market opens for billing.
5. **ATC requires a citation** wherever its content is displayed.
6. **MedDRA is only needed for pharmacovigilance.** If we do not report adverse events,
   we do not pay for it.

---

## 4. Update handling

Every system has an **ingest job** with its own cadence. On a new release:

1. the new version is loaded **alongside** the current one, never over it
2. codes used by signed documents must stay resolvable — a signed document references the
   version that was in force at signature (`AMD-06`)
3. retired and replaced concepts are recorded, not deleted; `ConceptMap` carries the
   transition
4. a change that alters a binding (for example the annual ICD-10-CM revision) sets
   `review_due` on the affected market profile

**The failure mode to design against:** an annual classification update silently changes
what a stored code means, and last year's document renders with this year's display term.
The snapshot (`AMD-05..09`) prevents it for signed documents; nothing prevents it for
drafts, which is correct — a draft should follow the current version.

---

## 5. Open decisions

| Question | Owner | Blocks |
|---|---|---|
| Which terminology server (HAPI, Ontoserver, Snowstorm, commercial) | Roman + Juraj | production coding, phase 3 |
| SNOMED CT registration with NCZI and the other five NRCs | Patrik + Marek | lawful use |
| EDQM Standard Terms — needed for EU ePrescription? | Marek | paid licence |
| CPT licence — when the US or UAE opens for billing | Roman | budget |

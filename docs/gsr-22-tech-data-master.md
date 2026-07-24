---
id: GSR-TECH-DATA-MASTER
title: Data layer — every database, code list and source in one place
collection: gsr
area: tech
type: reference
owner: patrik
status: draft
version: 1.0
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [master, databases, code-lists, terminology, sources, licensing, fhir, rag]
related: [GSR-TECH-KB, GSR-TECH-TERMINOLOGY, GSR-TECH-MEDICINAL-PRODUCTS, GSR-TECH-DRUG-SAFETY, GSR-TECH-CLINICAL-EVIDENCE, GSR-TECH-INTERNAL-REGISTRIES, GSR-TECH-KB-RULES, GSR-TECH-BE-PREP]
classification: Confidential — internal
---

# Data layer — the whole picture

> **Authority: INFORMATIVE.** One consolidated view of every database, code list and
> external source the platform depends on, why each sits where it sits, and what governs
> it. The detail lives in `gsr-14` and `gsr-16` to `gsr-21`; the binding rules live in
> `cp-17`, `cp-15`, `core-01` and the Care Plans Standard. In a conflict the norm wins.

**Markets:** SK · CZ · DE · IN · US · AE.
**Three isolated data environments:** EU (Frankfurt) · US · India.

---

## 1. The decision that shapes everything else

Most of what is loosely called "the database" is not one thing, and most of it does not
belong in a vector store. Putting drugs, SNOMED, FHIR and guidelines into a single vector
index produces a system that answers "what is the dose" with a **similar sentence rather
than the correct value**. For medicines that is a safety defect and it pushes Hilbi IQ
toward being a regulated medical device.

### Six storage classes

| # | Class | Technology | Content | Master |
|---|---|---|---|---|
| **1** | **Terminology server** | FHIR `CodeSystem` / `ValueSet` / `ConceptMap`; `$expand`, `$validate-code`, `$translate`, `$lookup` | SNOMED CT, ICD/MKCH, LOINC, ATC, RxNorm, UCUM, EDQM, CDCI | external, we host |
| **2** | **Relational master data** | PostgreSQL | drug registers, formularies, prices, procedure lists, internal code lists | **Hilbi** |
| **3** | **Deterministic rules** | rules engine | interactions, allergies, contraindications, renal dosing, `evaluationRules` | **Hilbi** |
| **4** | **Vector store** | PostgreSQL + `pgvector` | free text: SPC/PIL, guidelines, patient education, internal documents, transcripts | **Hilbi** |
| **5** | **FHIR store** | FHIR R4 server | clinical and care-plan resources | split — see §5 |
| **6** | **Audit** | append-only, tamper-evident | `Provenance`, `AuditEvent`; separate from the usage logbook | **Hilbi** |

### Four rules that follow from it

1. **A code is never obtained by vector search.** Always class 1. A code must be exact
   and verifiable, not probable.
2. **A dose, interaction, contraindication or allergy is never generated.** Always
   class 3.
3. **The clinical audit and the usage logbook are two separate streams** (`F23`) with
   different retention and access.
4. **A market is configuration, never a branch in logic** (`I32`). `if (market === …)`
   in logic is a defect.

---

## 2. External sources — terminology (class 1)

Detail: `gsr-16`.

| System | Source | Licence | Cost | Release cadence |
|---|---|---|---|---|
| **SNOMED CT** + national editions | National release centre: SK NCZI · CZ ÚZIS · DE BfArM · IN NRCeS · US NLM · AE DoH | affiliate; **registration with the NRC is mandatory** | **free** — all six markets are members | twice a year |
| **SNOMED IPS Free Set** | snomed.org | free set, also non-members | free | with International |
| **CDCI** (India drug extension) | NRCeS | SNOMED extension, ISO IDMP, RF2 | free | with International |
| **LOINC** | loinc.org | LOINC licence, attribution | free | twice a year |
| **MKCH-10** (SK) | NCZI | national | free | annual |
| **MKN-10** (CZ) | ÚZIS | national | free | annual |
| **ICD-10-GM**, **OPS** (DE) | BfArM | BfArM copyright | free | annual |
| **ICD-10-CM / PCS** | CDC NCHS, CMS | public domain | free | annual, 1 Oct |
| **ICD-11** | WHO ICD API | **CC BY-ND** — no derivatives ⚠️ | free | continuous |
| **ATC / DDD** | atcddd.fhi.no | citation required | free / ≈ €200 a year | annual |
| **RxNorm** | NLM | UMLS licence; *Prescribable Content* for redistribution | free | monthly |
| **UMLS** | NLM | **redistribution of subsets prohibited** ⚠️ | free | twice a year |
| **UCUM** | Regenstrief | free licence | free | irregular |
| **EDQM Standard Terms** | EDQM | **charged for commercial use** ⚠️ | paid | continuous |
| **CPT** | AMA | **per seat, strictly commercial** ⚠️ | paid | annual |
| **HCPCS** | CMS | public domain | free | quarterly |
| **MedDRA** | ICH / MSSO | subscription by revenue | paid — only for pharmacovigilance | twice a year |

### Slot bindings per market (`TERM-04`, `TERM-07`)

| Slot | EU (SK/CZ/DE) | US | IN | AE |
|---|---|---|---|---|
| Clinical record | SNOMED CT | SNOMED CT | SNOMED CT + CDCI | SNOMED CT |
| Claim / diagnosis | MKCH-10 · MKN-10 · ICD-10-GM | ICD-10-CM | ICD-10 | **ICD-10-CM** |
| Laboratory (O) | LOINC | LOINC | LOINC | LOINC |
| Medication (P, rx) | ATC | RxNorm | CDCI + ATC | ATC + Dubai Drug Code |
| Procedures | national list | CPT / HCPCS | national | CPT |
| Units | UCUM | UCUM | UCUM | UCUM |
| Dose forms, routes | EDQM | — | — | — |
| Signature | eIDAS AdES/QES | HIPAA e-sig | IT Act / ABDM | per emirate |
| Identity | national identifier | MRN, NPI | ABHA, HPR, HFR | Emirates ID, Sheryan |

`S` is predominantly narrative and **must not be forced into a code**.

---

## 3. External sources — medicines (classes 2, 3, 4)

Detail: `gsr-17` (products), `gsr-18` (safety).

### 3a. Product registers and leaflets

| Market | Register | Leaflet text | Licence |
|---|---|---|---|
| **SK** | ŠÚKL, data.slovensko.sk | SPC + PIL, ≈ 25 000 documents | open data |
| **CZ** | SÚKL, opendata.sukl.cz (DLP) | SPC + PIL | open data |
| **DE** | BfArM / PharmNet.Bund | Fachinformation, Gebrauchsinformation | free; in practice ABDATA / Rote Liste — **commercial** ⚠️ |
| **EU** | EMA | product information per language | reuse with attribution |
| **US** | DailyMed, openFDA, NDC Directory | SPL — XML with LOINC-coded sections | public domain |
| **IN** | **ABDM National Drug Registry** (live 2026-06-29, open APIs, SNOMED-based) + NPPA prices | **no central repository** | free |
| **AE** | MOHAP drug list, DHA Dubai Drug Code | none centrally | public |

**SPC and PIL are not the same document.** The SPC is for the physician, the leaflet for
the patient; different collections, different register of language. **India has no
regulated patient leaflet at all** — under Schedule D (II) §6 the package insert is
prescriber-directed and in English.

**Format decides the effort:** US is XML with sections already separated; SK, CZ and the
EU are PDF and need extraction plus section detection. Build the pipeline on US data,
then port it.

### 3b. Drug safety knowledge — the paid layer

| Vendor | Product | Order of magnitude |
|---|---|---|
| First Databank | FDB MedKnowledge | low five to six figures USD a year |
| Wolters Kluwer | Medi-Span, Lexicomp | comparable |
| Merative | Micromedex | comparable |
| DrugBank | Clinical API | commercial licence |

Free but insufficient: DrugBank non-commercial (no severity), DDInter, ONCHigh
(incomplete). **LactMed** (NLM, public domain) is genuinely usable for lactation.
⚠️ RxNav interaction API — verify availability; NLM withdrew parts of RxNav in 2024.

**Recommendation for the MVP: do not perform interaction checking, and say so in the
interface.** The overlay role makes that coherent — the provider's system does its own
safety checking (`REP-01`, `REP-02`). Doing it badly is worse than declining, and doing
it at all moves Hilbi toward a regulated device. Decision: Marek (MDR) + Roman (budget).

---

## 4. External sources — evidence and education (class 4)

Detail: `gsr-19`.

### 4a. National backbone — what actually binds a physician

SK Štandardné postupy MZ SR · CZ Klinické doporučené postupy (ÚZIS/AZV) · DE AWMF
(copyright, commercial use needs an agreement) · DE G-BA, IQWiG · IN ICMR · AE DHA/DoH.

### 4b. Free international layer — best value in this document

VA/DoD Clinical Practice Guidelines (the closest licence-free equivalent to NICE) ·
USPSTF with the Prevention TaskForce API · CDC · AHRQ · NIH · MedlinePlus · LactMed.
All public domain, no restriction on machine use.

### 4c. Licensing traps

| Source | Trap |
|---|---|
| **NICE** ⚠️ | the open licence is **UK only**; international use needs a separate application and fee; **AI use requires a separate written licence**; route is the syndication API; training prohibited, scraping prohibited; a cyber-security certification is required — **ISO 27001 qualifies**. CKS and BNF are licensed separately |
| **WHO guidelines** ⚠️ | CC BY-**NC** — not usable commercially |
| **PMC** | only the **Open Access subset** is redistributable |
| **Cochrane** | abstracts free, full texts copyright |
| **NCCN, AHA/ACC, ADA, ESC, EAN, ESMO** | society copyright, licence per source |
| **ERAS Society** | copyright; relevant because care plans lean on it |
| **UpToDate, Micromedex, Lexicomp** | no redistribution, no machine processing |
| **ECRI Guidelines Trust** | free to read, but a catalogue — a data licence is a separate negotiation |

**NICE should be deferred.** Its recommendations are bound to NHS drug availability and
NHS cost-effectiveness thresholds; in SK, CZ or DE they carry no standing.
**Worth examining before NICE: MAGICapp** — guidelines published in a machine-readable
structure.

### 4d. Rare disease and genetics

Orphanet / Orphadata **CC BY 4.0** (commercial use permitted) · HPO (free, attribution) ·
MONDO, ClinVar, MedGen, GARD (CC BY / public domain) · OMIM (registration, restrictions).

### 4e. Patient education

**Our own content is the primary source** — it is also the position under `F22`, where
the author is a physician. Supplemented by MedlinePlus (public domain), the national
PILs, and CDC. Never UpToDate, Mayo, patient.info or WHO fact sheets (NonCommercial).

**PRO instruments are a licensing minefield.** PHQ-9, GAD-7, AUDIT-C, EDSS and FSS are
free; **EQ-5D, SF-36, MMSE, MoCA, SDMT, Epworth, MSIS-29 and PSQI require a licence or
permission.** Every instrument is checked individually before it enters a care plan.

---

## 5. FHIR — what the platform builds (class 5)

FHIR **R4**, with our own Implementation Guide. FHIR base and terminologies are
**referenced, not copied**. Detail: `gsr-15`.

| Group | Resources | Master |
|---|---|---|
| Plan core | `CarePlan`, `PlanDefinition`, `ActivityDefinition`, `Goal`, `Task` | **Hilbi** |
| Clinical core | `Condition`, `Procedure`/`ServiceRequest`, `Observation`, `MedicationRequest` | EHR/NIS — read |
| PRO | `Questionnaire`, `QuestionnaireResponse` | **Hilbi** |
| Actors | `Patient`, `Practitioner`/`PractitionerRole`, `Organization`, `Encounter`, `CareTeam` | identity = **Hilbi core** |
| Consent | `Consent` | **Hilbi** — the gate to data |
| IPS context | `AllergyIntolerance`, `Immunization`, `MedicationStatement`, `DiagnosticReport`, `RiskAssessment` | EHR — read |
| Orchestration | `Appointment`, `Communication`, `DocumentReference`, `Coverage` | **Hilbi** |
| Measurement | `Measure`, `MeasureReport` | **Hilbi** |
| Commerce | `ChargeItemDefinition`, `ChargeItem`, `Invoice` | **Hilbi** |
| Wrapper | `Composition`, `Bundle` | **Hilbi** |
| Audit | `Provenance`, `AuditEvent` | **Hilbi** |

**Provider and Practice** (v164): a Provider is an `Organization`; a Practice is an
`Organization` with `partOf` pointing at it; a signatory is bound through
`PractitionerRole.organization` to the **Practice**, not the Provider. A Provider may
have several Practices.

**No resource duplicates clinical truth** (`A1`) — the clinical context is referenced.
Step state is **derived**, not stored (`D15`). Soft delete only (`F24`).

---

## 6. Internal registries — 23, and nobody supplies them

Detail: `gsr-20`. Each has a normative source, a symbol in the prototype and a named
owner. This is the most underestimated part of the platform.

**Configuration and jurisdiction:** market profile `MKT` (`I32`, `I33`) · signature level
per market (`SIG-01`) · Practices (`REP-07`, `TPL-19`).

**Clinical core:** obligation scale + `ConceptMap` to ERAS GRADE and ACC/AHA COR-LOE
(`B8`) · evidence grade scale (`B7`) · primitives — 11 states, 3 events, metadata
(`B10`) · phase catalogue (`D15`) · bound function catalogue (`B7`) · patient-surface
card catalogue, 14 types (`D16`) · role catalogue (`F21`) · outcome and variance
definitions (`F26`).

**Documents and report:** template registry `TPL_REG` (`TPL-03`, `TPL-16`) · **the six
section-source registers** — `TPL_SRC`, `SRC_COVERS`, `TERM_BIND`, `SRC_STYLE`,
`SRC_DISP` and the resolver (`TPL-17`) · document types `SLOTS` · document identity
`DOC_REG` (`DOC-01..07`) · snapshots (`AMD-05..09`) · consent registry `CNS_REG` keyed
`(id, ver, lang)` (`CNS-01..05`, `I18N-11`) · DSI registry (`DSI-01..05`) · storage
collections (`STO-01..05`).

**Content and language:** translation layer `I18N` — English is the source language since
v166 (`D17`) · three language axes: interface, document, patient (`I18N-02`) ·
questionnaire registry with a **mandatory licence field** (`C14`) · medication
instruction library bound to the active substance with ATC-class inheritance ·
specialisation registry `SPECBY` · KB records with source, version and licence
(`C11`, `C12`) · demo and clinical content, Slovak by decision, never a translation key.

**Commerce and operations:** plan pricing (`H31`) · usage logbook (`F23`) · clinical audit
(`AUD-01..03`).

**Thirteen of these have no owner yet** — the whole clinical-core group except roles, the
questionnaire registry, the instruction library and pricing. Assigning owners is cheaper
than discovering drift later.

---

## 7. Knowledge base rules (class 4)

Detail: `gsr-21`. `C11` and `C12` are already normative.

**Chunk envelope** — a record without `licence` and `reuse_mode` is not admitted:
`source_id`, `source_version`, `retrieved_at`, `licence`, `reuse_mode`, `territory`,
`language`, `market_scope`, `doc_type`, `section_code`, `subject_ids`, `clinical_domain`,
`evidence_grade`, `review_due`, `checksum`, `supersedes`.

**Licence enforcement at generation time:**

| `reuse_mode` | May | Must not |
|---|---|---|
| `verbatim` | quote with attribution | — |
| `paraphrase` | state the fact, cite the source | reproduce wording |
| `cite_only` | say the source exists, point to it | reproduce content |
| `internal_only` | use internally | show to the user |

**Collections are divided by licence, not by topic** — `kb_open`, `kb_restricted`,
`kb_internal`, `phi_{region}_{tenant}`. Withdrawing a source then becomes a `DELETE`
rather than archaeology. The professional knowledge base is non-personal and may be one
set for all markets; an index over patient documents is personal data, per tenant and
per region, never in the same collection.

**Residency — the point that is easy to miss.** The knowledge base is non-personal, but
**the query is not**: it carries patient context. Query embedding and reranking run **in
the patient's region**; embedding of the knowledge base itself may run anywhere.

**Retrieval:** hybrid BM25 plus dense vectors, then reranking — dense retrieval alone
fails exactly where it matters, on drug names and codes. Filters before search. Every
returned chunk carries its citation, without which `DSI-01..04` cannot be satisfied.

**Chunk by section, never by fixed length.** SPCs share the EU QRD structure, leaflets
have six fixed questions, US SPL sections carry LOINC codes. A question about
contraindications filters to section 4.3 before any vector search. This matters more than
the choice of embedding model.

---

## 8. Cost summary

| | Sources |
|---|---|
| **Free, no obstacle** | SNOMED CT (all six markets are members), LOINC, UCUM, national ICD variants, ICD-10-CM, ATC search, RxNorm, ŠÚKL / SÚKL / EMA / DailyMed registers and leaflets, ABDM Drug Registry, ŠDTP and KDP, VA/DoD, USPSTF, CDC, Orphanet, HPO, MedlinePlus, FHIR and the IGs, our own content |
| **Free with a condition** | UMLS (no subset redistribution), ICD-11 (ND), WHO guidelines (NC), PMC (OA subset only), OMIM, AWMF (copyright), NHS (UK) |
| **Cheap** | ATC annual file ≈ €200 |
| **Paid, decision needed** | EDQM Standard Terms · CPT (US, AE) · MedDRA (only with pharmacovigilance) · **NICE for AI use** · German drug feed · selected PRO instruments (EQ-5D, SF-36, MMSE, MoCA, SDMT) |
| **Expensive, strategic** | **drug interaction and allergy knowledge** — low five to six figures USD a year |

---

## 9. Order of work

| Phase | Content | Why in this position |
|---|---|---|
| **P0** | Terminology server · `MKT` profiles · identity (`B9`) · drug registers SK/CZ/US · SPC and PIL SK/CZ/EU · internal documents into `kb_internal` | Without a terminology server nothing can be coded. `kb_internal` has zero licence risk and exercises the whole retrieval chain first |
| **P1** | National guidelines · Orphanet, HPO · MedlinePlus · German and Indian drug data · decision on the interaction vendor | Licence negotiations have long lead times |
| **P2** | ICD-11 · MedDRA · commercial guidelines · reimbursement lists for the remaining markets | Only once it is clear which markets actually open |

**First concrete step for the backend:** build `kb_internal` over our own normative
documents. No licence risk, no personal data, and it proves the metadata schema,
chunking, hybrid retrieval and citations before anything external is touched.

---

## 10. What needs a decision rather than work

| Question | Owner | Blocks |
|---|---|---|
| Which terminology server | Roman + Juraj | all production coding |
| Do we perform our own interaction checking | Marek (MDR) + Roman (budget) | class 3, a five- to six-figure line |
| Owners for the thirteen unowned registries | Roman | governance of the clinical core |
| SNOMED CT registration with NCZI and the other five NRCs | Patrik + Marek | lawful use |
| Which PRO instruments we use and pay for | clinical owner + Marek | questionnaire registry |
| NICE — do we need it at all | Marek | a separate licence if yes |
| EDQM Standard Terms for EU ePrescription | Marek | paid licence |
| Is the knowledge base one global set or per region | Roman | deployment topology |

---

*Owner: Hilbi Health Group (R&D). Markdown is the SSOT. Licensing details were accurate
on 2026-07-24, must be verified before any contract is signed, and are not legal advice.*

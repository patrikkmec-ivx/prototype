---
id: GSR-TECH-CLINICAL-EVIDENCE
title: Clinical evidence sources — guidelines, literature, licensing
collection: gsr
area: tech
type: reference
owner: patrik
status: draft
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [guidelines, evidence, licensing, nice, pubmed]
related: [GSR-TECH-KB, GSR-TECH-KB-RULES]
classification: Confidential — internal
---

# Clinical evidence sources

> **Authority: INFORMATIVE.** This is the most licence-sensitive area in the whole
> knowledge base and the one that changes most often. Verify terms before signing
> anything; the notes below were accurate on 2026-07-24 and are not legal advice.

---

## 1. The backbone is national, not international

The guidance that binds a physician is the guidance of the market they work in. An
international source is a reference, not an authority.

| Market | Source | Licence |
|---|---|---|
| **SK** | Štandardné diagnostické a terapeutické postupy, MZ SR | public |
| **CZ** | Klinické doporučené postupy, ÚZIS / AZV | public |
| **DE** | AWMF Leitlinien | free to read, AWMF and society copyright — commercial use needs an agreement |
| **DE** | G-BA, IQWiG | public, official |
| **IN** | ICMR, NHM | public |
| **AE** | DHA / DoH clinical guidelines | public |

---

## 2. The free international layer

Public domain, no licence, no restriction on machine use. Best value in this document.

| Source | Content |
|---|---|
| **VA/DoD Clinical Practice Guidelines** | broad, well structured, across specialties — the closest licence-free equivalent to NICE |
| **USPSTF** (with the Prevention TaskForce API) | prevention and screening with grades |
| **CDC** | immunisation, infectious disease, opioids, travel |
| **AHRQ / EPC reports** | systematic reviews |
| **NIH, NHLBI, NIDDK** | cardiology, diabetes, nephrology |
| **MedlinePlus, LactMed** | patient education, lactation |

---

## 3. Licensing traps

| Source | The trap |
|---|---|
| **NICE** | The open licence covers **use within the UK only**; international use needs a separate application and fee. **Use of NICE content for AI purposes requires a separate written licence.** The route is the syndication API, which also covers AI use; training models on NICE content is not permitted and scraping is prohibited. A cyber-security certification is required — **ISO 27001 qualifies**. CKS and BNF are licensed separately, by Agilio and Pharmaceutical Press. |
| **WHO guidelines** | CC BY-NC-SA — **NonCommercial**, so not usable by us |
| **PMC** | only the **Open Access subset** is redistributable; the rest is not |
| **Cochrane** | abstracts free, full texts copyright |
| **NCCN, AHA/ACC, ADA, ESC, EAN, ESMO** | society copyright, licence per source; NCCN is the strictest |
| **ERAS Society** | copyright; relevant because care plans lean on it |
| **UpToDate, Micromedex, Lexicomp** | expensive, no redistribution, no machine processing |
| **ECRI Guidelines Trust** | free to read after registration, but it is a catalogue — the guidelines remain society property. ECRI does distribute content to commercial publishers, so a data licence is negotiable separately |

**Recommendation on NICE: defer it.** Its recommendations are bound to the NHS — UK drug
availability, UK cost-effectiveness thresholds, UK pathways. In SK, CZ or DE they carry
no standing and can conflict with national reimbursement. Guiding a Slovak physician with
NHS economics is weak clinically as well as legally.

**Worth examining before NICE: MAGICapp.** It publishes guidelines in a structured,
machine-readable form — built for digital consumption, which is exactly our problem.

---

## 4. Literature

| Source | Access | Note |
|---|---|---|
| **PubMed / MEDLINE** | free E-utilities API, rate limited | abstracts only |
| **PMC Open Access subset** | free, redistributable | full texts |
| **Orphanet / Orphadata** | **CC BY 4.0**, commercial use allowed with attribution | rare disease |
| **HPO** | free, attribution | phenotype |
| **OMIM** | registration, redistribution and commercial restrictions | genetics |
| **MONDO, ClinVar, MedGen, GARD** | CC BY / public domain | |

---

## 5. Rules

1. **Every chunk carries `reuse_mode`** (`gsr-21` §3). For most sources in §3 that is
   `paraphrase` or `cite_only`, never `verbatim`.
2. **A guideline is scoped to a market.** A German guideline does not surface for a
   Slovak encounter unless deliberately requested.
3. **Evidence changes.** `C11` requires detection of evidence change; a superseded
   guideline is retained with `supersedes`, never deleted.
4. **Our own authored content is the safest patient-facing source** and is also the
   position under `F22`, where the author is a physician.

---
id: GSR-TECH-MEDICINAL-PRODUCTS
title: Medicinal product data — registers, leaflets, ingest per market
collection: gsr
area: tech
type: reference
owner: patrik
status: draft
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [medicines, spc, pil, dailymed, sukl, abdm, ingest]
related: [GSR-TECH-KB, GSR-TECH-TERMINOLOGY, GSR-TECH-KB-RULES]
classification: Confidential — internal
---

# Medicinal product data

> **Authority: INFORMATIVE.** Three separate layers are involved and confusing them is
> the usual mistake: **product identity** (relational), **product text** (vector) and
> **clinical drug knowledge** (deterministic rules — see `gsr-18`).

---

## 1. The two documents are not the same thing

| | For whom | Structure | Storage class |
|---|---|---|---|
| **SPC** — summary of product characteristics | the physician | EU QRD sections 1–6 | relational identity + vector text |
| **PIL** — patient leaflet | the patient | six fixed questions | vector text, patient register |

They belong in different collections. Merging them means the assistant answers a
physician with a patient leaflet.

**India has only the first.** Under Schedule D (II) §6 of the Drugs and Cosmetics Rules
the package insert is prescriber-directed and must be in English; there is no regulated
equivalent of the EU patient leaflet. For India the patient layer must be our own
content — see §5.

---

## 2. Sources per market

| Market | Product register | Leaflet text | Licence |
|---|---|---|---|
| **SK** | ŠÚKL, data.slovensko.sk | SPC and PIL, roughly 25 000 documents | open data |
| **CZ** | SÚKL, opendata.sukl.cz (DLP) | SPC and PIL | open data |
| **DE** | BfArM / PharmNet.Bund (AMIce) | Fachinformation, Gebrauchsinformation | public; in practice ABDATA / Rote Liste dominate — **commercial** |
| **EU centralised** | EMA | product information per language | reuse with attribution |
| **US** | DailyMed, openFDA, NDC Directory | SPL, XML with LOINC-coded sections | public domain |
| **IN** | **ABDM National Drug Registry** (launched 2026-06-29, open APIs, SNOMED CT based) plus NPPA for prices | no central repository | free |
| **AE** | MOHAP drug list, DHA Dubai Drug Code | none centrally | public |

---

## 3. Format decides the effort

| | Format | Effort |
|---|---|---|
| **US** | XML with LOINC-coded sections | near zero — sections already separated |
| **SK, CZ, EU** | PDF and DOC | high — text extraction plus section detection |
| **IN, AE** | scattered, manufacturer sites | highest |

**Build and prove the pipeline on US data, then port it to SK and CZ.** The section
structure is equivalent, but the US corpus removes parsing risk from the first iteration.

---

## 4. Ingest

- **US bulk**: openFDA `download.json` manifest, or DailyMed full releases split into
  roughly 3 GB parts. DailyMed archives are zips containing thousands of zips — extract
  selectively.
- **US incremental**: DailyMed API v2 or openFDA search; `setId` is the stable identity
  and `version` increments, which maps directly onto `source_version` and `supersedes`.
- **SK / CZ**: the dataset gives a list with document links; fetch the PDFs and extract.
  **Centrally authorised products carry no national SPC** — ŠÚKL points at the EMA, so
  that branch must be handled separately or a large part of biologics disappears.
- **IN**: request access to the National Drug Registry API. It is new, so early contact
  is an advantage.

A working ingest script producing the chunk schema of `gsr-21` is `ingest_labels.py`.

---

## 5. Three layers, three sources — India as the worked example

| Layer | Where it comes from |
|---|---|
| **Molecule** — pharmacology, interactions, adverse effects | US SPL and EMA SPC — the same molecule, the same properties |
| **Product** — brand, pack, manufacturer, price | ABDM Drug Registry plus NPPA |
| **Patient** — education in the patient's language | **our own content; there is no alternative** |

**The limit of molecule-layer reuse:** it holds for single-ingredient products. It does
**not** hold for Indian fixed-dose combinations, of which India has many with no US or EU
equivalent, so no foreign text exists. For an FDC the source is Indian or the gap is
acknowledged — never filled from another country.

---

## 6. Rules

1. **The same molecule has several leaflets** from different marketing authorisation
   holders. They are not merged; the patient sees the leaflet for the pack they hold.
2. **Chunk by section, never by fixed length** (`gsr-21` §2).
3. **Every chunk carries the drug identity** — ŠÚKL code, NDC, ATC, registration number.
4. **The assistant must not compute a dose from an SPC.** It may show what section 4.2
   says, attributed.
5. **Leaflet language is the market's language, not the interface language** (`I18N-02`).

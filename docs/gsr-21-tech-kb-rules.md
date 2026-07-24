---
id: GSR-TECH-KB-RULES
title: Knowledge base — chunk schema, licence enforcement, retrieval, residency
collection: gsr
area: tech
type: reference
owner: patrik
status: draft
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [knowledge-base, rag, pgvector, licensing, retrieval, residency]
related: [GSR-TECH-KB, GSR-TECH-TERMINOLOGY, cp-17, CARE-PLANS-STANDARD]
classification: Confidential — internal
---

# Knowledge base rules

> **Authority: INFORMATIVE.** `C11` (KB record schema and source version) and `C12`
> (licence as a mandatory field with runtime enforcement) are already normative in the
> Care Plans Standard. This document turns them into an operating design.

---

## 1. What the vector layer is for

Only unstructured text: package leaflets and SPCs, clinical guidelines, patient
education, internal documents, transcripts. Everything else belongs to one of the other
storage classes (`GSR-TECH-KB` §0).

**Three questions must never be answered from a vector search:** a dose, an interaction
or contraindication, and a code. Retrieval over free text is probabilistic; these three
are deterministic lookups. Retrieval may supply context and a citation, never a number.

---

## 2. Chunk schema

Every chunk carries this envelope. A record without `licence` and `reuse_mode` is not
admitted to the index.

```json
{
  "chunk_id":       "ema-spc-ocrevus#4.4",
  "source_id":      "ema-spc-ocrevus",
  "source_version": "2026-03-14",
  "retrieved_at":   "2026-07-24T09:00:00Z",
  "licence":        "EMA-reuse",
  "reuse_mode":     "verbatim | paraphrase | cite_only | internal_only",
  "territory":      ["EU"],
  "language":       "sk",
  "market_scope":   ["SK","CZ","DE"],
  "doc_type":       "spc | pil | guideline | education | internal",
  "section_code":   "4.4",
  "section_title":  "Special warnings and precautions",
  "subject_ids":    { "atc": "L04AA36", "rxcui": null, "snomed": null },
  "clinical_domain":"neurology",
  "evidence_grade": null,
  "review_due":     "2027-03-14",
  "checksum":       "sha256:…",
  "supersedes":     "ema-spc-ocrevus@2025-11-02"
}
```

**`section_code` is what makes retrieval accurate.** SPCs share the EU QRD structure,
patient leaflets have six fixed questions, US SPL sections carry LOINC codes. One chunk
is one section, and a question about contraindications filters to section 4.3 before any
vector search happens. This matters more than the choice of embedding model.

**`subject_ids` is what makes retrieval clinical.** Without the drug identity a query
cannot be scoped to what the patient actually takes, and the result is a chatbot about
medicines rather than a clinical tool.

---

## 3. Licence enforcement at runtime

`C12` requires the licence to be enforced when the answer is generated, not merely
recorded.

| `reuse_mode` | The assistant may | The assistant must not |
|---|---|---|
| `verbatim` | quote directly with attribution | — |
| `paraphrase` | state the fact in its own words with a citation | reproduce the original wording |
| `cite_only` | say the source exists and point to it | reproduce the content |
| `internal_only` | use it internally, for example to validate | show it to the user |

Enforcement is a filter applied **before** generation, not a check afterwards. The mode
travels with the chunk so the generating step cannot lose it.

---

## 4. Collections — divided by licence, not by topic

| Collection | Content | Personal data | Region |
|---|---|---|---|
| `kb_open` | public and CC BY sources (`verbatim`) | no | one, replicated |
| `kb_restricted` | copyright sources (`paraphrase` / `cite_only`) | no | one, replicated |
| `kb_internal` | Hilbi IP, normative documents, SOPs | no | one |
| `phi_{region}_{tenant}` | patient documents | **yes** | EU / US / IN, isolated |

Dividing by licence means withdrawing a source is `DELETE … WHERE source_id = …` rather
than archaeology. Dividing by topic would make it archaeology.

**The hard boundary:** the professional knowledge base is non-personal and may be one set
for every market. An index over patient documents is personal data — per tenant, per
region, and never in the same collection. These are two systems, not two indexes in one.

---

## 5. Residency — the point that is easy to miss

The knowledge base is non-personal, so it has no residency problem of its own. **The
query does.** It carries patient context.

> Query embedding and reranking run **in the patient's region**.
> Embedding of the knowledge base itself may run anywhere.

This follows from the platform commitment that no personal data leaves the EEA at any
point of inference. It must be explicit in the design, because it is the most likely
place for a silent breach.

---

## 6. Retrieval

- **Hybrid**: BM25 for exact terms, codes and drug names, plus dense vectors for meaning,
  then a reranking pass. Dense retrieval alone fails precisely where it matters most —
  on drug names and codes.
- **Filters before search**: market, document language, `reuse_mode`, validity of the
  version.
- **Every returned chunk carries its citation** — `source_id`, version, URL, effective
  date. Without it `DSI-01..04` cannot be satisfied: every AI output declares its logic.
- **Terminology never through the vector layer** — `$expand` / `$validate-code`.

---

## 7. Freshness and change detection

- each source has an ingest job with its own cadence: leaflets monthly, terminology per
  release cycle, guidelines on publication
- the `checksum` is compared; a change records a version transition and sets `review_due`
- **the old version is not deleted**, it gains `supersedes`

The reason is auditable, not tidy: without it there is no way to explain later what the
assistant was drawing on six months ago.

---

## 8. Technology

**PostgreSQL with `pgvector`**, not a separate vector database. Postgres is already in
the stack; a KB record needs relational metadata and a vector in one transaction; licence
filters are a `WHERE` clause rather than application logic; and it is one fewer system to
certify, back up and audit. A dedicated vector database becomes worth considering above
roughly tens of millions of chunks, which this content will not reach.

---

## 9. Order of work

| Step | Content | Why in this position |
|---|---|---|
| 1 | `kb_internal` over our own normative documents | Zero licence risk, zero personal data, and it exercises the whole chain — metadata, chunking, hybrid retrieval, citations |
| 2 | `kb_open`: SPC and PIL for SK, CZ and the EU centralised set | Largest well-structured corpus available free |
| 3 | Guidelines with their licence modes | Where the licensing traps are |
| 4 | `phi_*` per tenant | Only after the audit and consent gate are real |

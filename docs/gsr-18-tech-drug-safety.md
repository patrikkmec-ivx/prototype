---
id: GSR-TECH-DRUG-SAFETY
title: Drug safety knowledge — interactions, allergies, dosing, and the MDR boundary
collection: gsr
area: tech
type: reference
owner: patrik
status: draft — decision pending (Marek, Roman)
version: 0.9
created: 2026-07-24
updated: 2026-07-24
review_due: 2026-10-24
tags: [interactions, allergies, dosing, mdr, vendors, budget]
related: [GSR-TECH-KB, GSR-TECH-MEDICINAL-PRODUCTS, cp-17]
classification: Confidential — internal
---

# Drug safety knowledge

> **Authority: INFORMATIVE, and deliberately unfinished.** This document is the input to
> a decision, not its outcome. Whether Hilbi performs its own interaction checking is a
> five- to six-figure annual commitment and simultaneously an MDR classification
> question. Marek and Roman decide; this sets out what they are deciding on.

---

## 1. Why this is a storage class of its own

Interactions, allergies, contraindications and dose limits are **deterministic rules**,
not text. They must be reproducible and auditable: the same inputs give the same answer,
and the reason can be shown.

**A vector search must never answer one of these questions.** Retrieval over free text is
probabilistic. A plausible sentence about a dose is worse than no answer, because it
carries the appearance of authority.

---

## 2. Vendors

Pricing is not published by any of them; the figures are the shape of the market rather
than quotes.

| Vendor | Product | Order of magnitude |
|---|---|---|
| First Databank (Hearst Health) | FDB MedKnowledge | low five figures to six figures USD a year |
| Wolters Kluwer | Medi-Span, Lexicomp | comparable |
| Merative | Micromedex | comparable |
| DrugBank (OMx) | Clinical API | commercial licence; academic tier cheaper |

**Free but not sufficient:**

| Source | Limitation |
|---|---|
| DrugBank non-commercial | no severity grading; non-commercial only |
| DDInter, ONCHigh | academic, incomplete coverage |
| LactMed (NLM) | lactation only; public domain, genuinely useful |
| RxNav interaction API | **verify availability** — NLM withdrew parts of RxNav in 2024 |

---

## 3. The MDR question

Interaction checking presented to a physician is decision support. Where it sits relative
to the medical device boundary depends on how it is presented, not on how it is computed:

- a **curated, physician-confirmed** rule set, shown as a suggestion with its logic
  declared (`DSI-01..05`), is defensible
- a **freely generated** warning is not

The same boundary governs the patient-facing medication instruction library
(`GSR-TECH-INTERNAL-REGISTRIES` §5): red flags — when to call for help — are curated
only, never generated.

`DSI-04` already states that an AI output must not be presented as a diagnostic decision
and that the boundary between suggestion and decision is assessed by compliance.

---

## 4. Recommendation for the MVP

**Do not perform interaction checking at all, and say so in the interface.**

The overlay role makes this coherent: by default the provider's existing system holds the
clinical record and performs its own safety checking (`REP-01`, `REP-02`). Declining to
duplicate it is a defensible position, whereas doing it badly is not.

Building it moves Hilbi toward a regulated device and adds a recurring cost before there
is revenue to carry it. If a customer requires it, that is the moment to decide — with
the customer's requirement in hand rather than in anticipation of one.

---

## 5. What the decision needs

| Question | Owner |
|---|---|
| Do we perform our own interaction checking, and from which release? | Roman (budget) + Marek (MDR) |
| If yes, which vendor and for which markets — coverage differs sharply outside the US and EU | Roman |
| Does patient-facing red-flag content cross into decision support? | Marek |
| Renal dosing, pregnancy and paediatrics — in scope or out? | clinical owner |
| Is LactMed adopted now, given it is free and public domain? | clinical owner |

---

## 6. If the answer is yes

The layer is built as rules, not as text:

1. rules keyed to the **active substance** and ATC class, not the brand
2. every alert carries **severity, mechanism and source**, all displayed
3. **an alert is a suggestion**; overriding it is recorded with a reason (`PROV-02`)
4. alert fatigue is a safety problem — a rule set that fires constantly is ignored, so
   severity filtering is part of the design and not a setting added later
5. the vendor's data is **never** loaded into the vector index; licences prohibit it and
   the architecture forbids it

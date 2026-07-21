---
id: CORE-AUDIT-EU
title: Independent Audit — EU Perspective (Clinical Core Standard v0.9)
collection: core
area: audit
type: review
owner: patrik
status: final
version: 1.0
created: 2026-07-21
audited_document: CORE-TECH-CLINICAL-CORE v0.9
classification: Dôverné — interné
---

# Independent Audit — European Union

**Audited artifact:** `core-01-tech-clinical-core-standard.md` v0.9 (draft-for-approval)
**Audit perspective:** digital-health / medical-informatics directorate of a leading EU
university hospital, national digitalization frontrunner, EHDS pilot participant. Class
exemplars of this profile: Charité Berlin, Karolinska, Rigshospitalet, Erasmus MC.
*(Independent expert review authored against that profile; not issued by any named
institution.)*
**Scope:** conformance with the EU layer (EHDS Regulation, GDPR, AI Act, eIDAS, MDR
interplay) and with the reality that "EU" is 27 national eHealth systems, not one market.
**Method:** clause-by-clause review; findings rated **Critical / Major / Minor / Observation**.

---

## Verdict

**Architecturally aligned, regulatorily incomplete.** The two-layer FHIR model and the
data-only template stack anticipate EHDS better than most legacy EU hospital systems. The
decisive weakness: the Standard models "EU" as **one region pack** (G1), while every serious
EU deployment is national (gematik/ISiK in DE, ezdravie/NCZI in SK, …), and two legal
mechanisms — erasure and qualified signature — are named but not designed. Three findings
are blocking.

---

## Findings

### EU-01 · CRITICAL — "EU pack" must be a family of national packs
**Clauses:** G1, G2.
Germany legally mandates ISiK (gematik) FHIR profiles for hospital systems and ePA
connectivity; Slovakia mandates ezdravie/NCZI interfaces (largely non-FHIR); other member
states differ again. A single "EU pack" cannot satisfy any of them.
**Required:** restructure G1: region pack **EU = base pack (EHDS/EEHRxF + IPS)** plus
**national sub-packs** (profiles + adapters per member state), same additive mechanics.
E-CONF-05 must test a national sub-pack swap.

### EU-02 · CRITICAL — GDPR Art. 17 erasure vs additive-only store is undesigned
**Clauses:** B3, H (open item O2).
"Lawful erasure workflows (Part H)" is a placeholder. In an immutable, versioned FHIR store
with Compositions referencing resources, erasure/restriction is an architectural feature
(erasure vs anonymization vs restriction of processing; cascade through `_history`,
Compositions, exports, backups), not a workflow footnote. Medical-record retention laws
will usually override erasure — but that adjudication logic must exist.
**Required:** add a normative erasure/restriction design clause: legal-hold vs erasure
adjudication, technical mechanism (crypto-shredding of `Binary`, resource masking with
tombstones), cascade rules, and backup handling. This blocks v1.0 sign-off.

### EU-03 · CRITICAL — Signature of clinical documents lacks eIDAS grounding
**Clauses:** C3, C4, H2.
"Sign" events set `final` and emit AuditEvent, but the Standard never states **what a
signature is**. For medico-legal validity of a dekurz/discharge report, several member
states expect an advanced or **qualified electronic signature (QES)** bound to the
practitioner identity (eIDAS), and EHDS documents will carry provenance seals.
**Required:** define the signature model: signature level per document class (AdES/QES),
signature artifact stored as `Provenance.signature`, practitioner identity binding, and
per-country escalation in national sub-packs.

### EU-04 · MAJOR — EHDS manufacturer obligations not operationalized
**Clauses:** Normative references, Part G.
HHG is already classified as an **EHR system manufacturer** under EHDS (per company
compliance baseline). That entails: mandatory **logging component**, interoperability
component conformant to the **EEHRxF** priority categories (patient summary, ePrescription,
lab results, imaging reports, discharge reports), self-declared conformity + registration in
the EU database.
**Required:** G1 EU base pack MUST enumerate EEHRxF export for the five priority categories
(they map cleanly onto D4 Composition profiles — say so normatively), and Part H MUST claim
the EHDS logging component as satisfied by H2 (verify with compliance lead).

### EU-05 · MAJOR — Secondary use (EHDS Chapter IV) vs RWD boundary
**Clauses:** G2, H1.
The Standard isolates RWD, which is right; but EHDS creates Health Data Access Bodies with a
legal route to request secondary-use data. The pipeline (request → permit → extraction from
the Core → anonymization) is undefined.
**Required:** add an Observation-level clause referencing the RWD extraction pipeline as the
single lawful secondary-use path; detail can live in a GSR/RWD document.

### EU-06 · MAJOR — AI Act risk class of IQ predictions may exceed Art. 50
**Clauses:** C4, H4.
Hilbi IQ is baselined as limited-risk (Art. 50 transparency). But `RiskAssessment`
predictions surfaced to clinicians as decision support can qualify the module as **SaMD**
(MDR) and/or high-risk AI (Annex III via MDR class IIa+). C4's human-sign gate helps but
does not settle classification.
**Required:** open item for compliance: formal qualification of the prediction module (MDCG
2019-11 pathway). Until resolved, predictions MUST remain `preliminary`, labelled, and
non-prescriptive (C4 already implies this — make it explicit).

### EU-07 · MINOR — Data portability (GDPR Art. 20)
Patient-facing export (machine-readable, complete) is implied by patient surfaces but not
required. Add to H: patient export = IPS + full FHIR bundle of their compartment.

### EU-08 · MINOR — DPIA hook
AI producers + cross-source aggregation trigger DPIA obligations. Reference the DPIA process
in H3 change control (a new producer or region = DPIA review trigger).

### EU-09 · OBSERVATION — Retention schedules are national
O2 must be resolved **per member state** (e.g. decades-long retention for medical records);
retention belongs in national sub-packs, not one EU number.

### EU-10 · OBSERVATION — Multilingual narratives
D17 (CP standard) covers clinician language; EEHRxF exchange will require coded content to
survive translation. The Library-driven token engine (D1) is the right mechanism — note that
narrative language is a render parameter, never a data fork.

---

## Summary table

| # | Severity | Area | Blocking for EU launch |
|---|---|---|---|
| EU-01 | Critical | National sub-packs | Yes |
| EU-02 | Critical | Erasure design | Yes (v1.0 gate) |
| EU-03 | Critical | eIDAS signature model | Yes |
| EU-04 | Major | EHDS manufacturer duties | Yes (as manufacturer) |
| EU-05 | Major | Secondary use path | No (document-level) |
| EU-06 | Major | AI Act/MDR class of IQ | Gate for predictions |
| EU-07 | Minor | Portability export | No |
| EU-08 | Minor | DPIA trigger | No |
| EU-09 | Obs. | National retention | With O2 |
| EU-10 | Obs. | Multilingual render | No |

**Positive note:** D2 (core never calls GitHub; artifacts resolved from FHIR) and the
template-as-data doctrine are precisely what EHDS conformity assessment will reward. A2's
explicit conflict-resolution against CP-TECH-STANDARD is unusually good governance hygiene.

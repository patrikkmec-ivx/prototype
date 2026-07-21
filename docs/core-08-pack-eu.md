---
id: CORE-PACK-EU
title: EU Region Pack — Base Pack + National Sub-Packs, Scope & Service Boundaries
collection: core
area: tech
type: spec
owner: patrik
status: draft-for-approval
version: 0.1
created: 2026-07-21
updated: 2026-07-21
review_due: 2026-10-21
tags: [region-pack, eu, ehds, eehrxf, eidas, gdpr, ezdravie, gematik]
related: [CORE-TECH-CLINICAL-CORE, CORE-AUDIT-EU, CORE-AUDIT-CONSOLIDATION, GSR-SEC-ISO]
iso_controls: [A.8.1, A.5.12, A.8.11]
classification: Dôverné — interné
---

# EU Region Pack — Scope & Service Boundaries v0.1

> **Authority: NORMATIVE** for the EU region pack. Derives from CORE-TECH-CLINICAL-CORE
> v0.10; on conflict the Core Standard wins. RFC 2119 keywords. Closes region-specific
> findings of CORE-AUDIT-EU.
> **Structure (Core G3): BASE PACK + NATIONAL SUB-PACKS.** The EU is 27 national eHealth
> systems; the base pack carries EHDS/EEHRxF + IPS, sub-packs carry national profiles,
> adapters and legal parameters.
> **Deployment mode (A6/O9): per member state / per deployment** — primary for SK ambulatory
> practices without a NIS; companion where a national/hospital EHR is master.

---

## P1. Position — EHR system manufacturer under EHDS

**Description:** HHG is classified as an **EHR system manufacturer** under the EHDS Regulation
(EU) 2025/327 (company compliance baseline; wellness-app and MDR routes explicitly out of
scope). Obligation timeline: general application 2027-03-26; EHR-system obligations for
priority category 1 (patient summary, ePrescription/eDispensation) from **2029-03-26**;
category 2 (imaging, labs, discharge reports) from 2031-03-26. Commission implementing acts
with EEHRxF technical specifications are due by 2027-03-26 and are a tracked dependency.
**Requirements:** The two mandatory EHR-system components MUST be provided by this pack:
the **interoperability component** (P2) and the **logging component** (P3). Manufacturer
conformity artifacts (P4) are release-gating for EU deployments from the applicable dates.

## P2. `pack-eu-eehrxf` — EEHRxF interoperability component

**Description:** EEHRxF export/import of the priority categories, mapped onto D4 Composition
profiles and the D6 dual-expose mechanism (EU-04).
**Requirements:** MUST enumerate and export the five priority categories: patient summary
(IPS-aligned), ePrescription/eDispensation, laboratory results, medical imaging reports,
discharge reports. Category ↔ Composition-profile mapping is a pack artifact, CI-tested
(E-CONF-08). Until the implementing acts land, the pack tracks the draft EEHRxF
specifications and pins versions via K35; the mapping layer is built so that a spec change is
a pack update, never a Core change (E-CONF-05).

## P3. `pack-eu-logging` — EHDS logging component

**Description:** Patient-visible access logging (EU-04), implemented on Core H2.
**Requirements:** Every read/export of a patient compartment MUST be queryable **by the
patient** (who accessed, when, in what role). This service is a projection over H2
`AuditEvent` — no second logging pipeline. Retention of access logs per sub-pack matrix.

## P4. `pack-eu-manufacturer` — conformity & registration harness

**Description:** The process artifacts of the manufacturer regime: technical documentation,
self-declared EU conformity, CE marking, registration in the EU database, testing in the
digital testing environment once available.
**Requirements:** Conformity documentation MUST be generated from the SSOT (this repo) —
auto-documentation principle applies; the harness packages test evidence from E-CONF runs.
Process owner: Marek; engineering owner: Juraj. Release-gating per P1 dates.

## P5. `pack-eu-erasure` — H6 executor with national matrices

**Description:** Regional instantiation of Core H6 (EU-02).
**Requirements:** Erasure/restriction requests MUST adjudicate against the **member-state
retention matrix** (O6): statutory medical-record retention prevails where national law says
so (e.g. SK retains zdravotná dokumentácia for decades); outside statutory retention, GDPR
Art. 17 executes via H6 mechanics (crypto-shred, tombstones, cascade, backup SLA).
Art. 18 restriction and Art. 20 portability (patient export = IPS + full FHIR bundle of the
compartment, EU-07) are served by the same service.

## P6. National sub-pack contract (template)

**Description:** A sub-pack adapts one member state without touching the canonical model
(Core G1/G3).
**Requirements:** A sub-pack declares exactly: (a) national profiles/constraints,
(b) national exchange adapters, (c) signature matrix per document class (C6),
(d) retention/erasure values (P5), (e) deployment-mode default (A6), (f) national
terminology bindings. Sub-pack swap MUST pass E-CONF-06.

### P6.1 Sub-pack SK (first)
ezdravie/NCZI adapters (largely non-FHIR national interfaces — adapter, not model change);
signature matrix: QES-grade signature for dekurz/discharge-class documents where national
practice requires, via `Provenance.signature` (C6); retention per SK law (O6, Marek);
mode default: **primary** for ambulatory without NIS, companion where a hospital NIS is
master. NCZI/ezdravie onboarding sequence is a delivery deliverable per customer.

### P6.2 Sub-pack DE (template validation)
gematik **ISiK** FHIR profiles (hospital systems) + ePA connectivity; mode default:
companion (ISiK-certified hospital systems are master); signature and retention per DE law.
DE sub-pack is the proof that P6 template holds for a FHIR-native national regime, as SK
proves it for a non-FHIR one.

## P7. IQ predictions gate (EU-06)

**Requirements:** Until O8 (MDR / AI Act qualification, MDCG 2019-11 pathway) is resolved by
Marek, IQ predictions in EU deployments MUST remain `preliminary`, visibly labelled as
predictions, and non-prescriptive (no dosage/treatment directives) — Core C4/H4 enforced,
pack-level test PACK-EU-03. Secondary-use requests from Health Data Access Bodies (EU-05)
route exclusively through the RWD extraction pipeline (GSR data-plane rule); no direct Core
access.

## P8. Pack parameters (Core G3)

| Parameter | EU base value | Sub-pack override |
|---|---|---|
| Deployment mode (A6) | per deployment | SK: primary (ambulatory) / DE: companion |
| Signature level (C6) | AdES minimum for `final` clinical documents | QES per national matrix (O7) |
| Retention / erasure (H6) | GDPR Art. 17/18/20 mechanics | national retention values (O6) |
| `preliminary` SLA (B4) | SHOULD (clinical hygiene) | — |
| Identifier policy (B5) | national ID / eID per state | sub-pack declares |
| Terminology | SNOMED affiliate status SK open (O4) | national code systems |

## P9. Conformance (pack-level)

**Requirements:** PACK-EU-01: five EEHRxF categories export from D4 profiles (E-CONF-08).
PACK-EU-02: patient can query the access log of their compartment (P3). PACK-EU-03: no
prediction reaches any EU surface non-labelled or `final` while O8 is open. PACK-EU-04:
sub-pack swap SK↔DE changes no Core behavior (E-CONF-06).

## Findings closure map

| Audit finding | Closed by |
|---|---|
| EU-01 national sub-packs | P6 (+ Core G3) |
| EU-02 erasure design | Core H6 + P5 |
| EU-03 eIDAS signature | Core C6 + P8/O7 |
| EU-04 EHDS manufacturer/EEHRxF | P1–P4 |
| EU-05 secondary use path | P7 (RWD pipeline) |
| EU-06 AI Act/MDR of IQ | P7 + O8 |
| EU-07 portability | P5 |
| EU-08 DPIA hook | H3 change control + O6 review (Marek) |
| EU-09 national retention | P5/P6 matrices (O6) |
| EU-10 multilingual render | Core D1/D17 — narrative is a render parameter |

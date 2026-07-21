---
id: CORE-EXEC-SUMMARY
title: Clinical Core — Executive Summary for Sign-off (Roman · Marek)
collection: core
area: ops
type: brief
owner: patrik
status: for-circulation
version: 1.0
created: 2026-07-21
related: [CORE-TECH-CLINICAL-CORE, CORE-PACK-US, CORE-PACK-EU, CORE-PACK-IN, CORE-AUDIT-CONSOLIDATION]
classification: Dôverné — interné
---

# Clinical Core — exekutívne zhrnutie na schválenie

**Pre:** Roman (biznis) · Marek (compliance) · **Od:** Patrik · **Dátum:** 2026-07-21
**Kanonické dokumenty (GitHub `docs/`):** core-01 v0.10 (normatívny štandard) · core-02 v2
(diagram) · core-03/04/05 (nezávislé audity US/EU/IN) · core-06 (konsolidácia) ·
core-07/08/09 (region packy).

## Čo sa rozhodlo

Dekurz engine z SM+ sa povyšuje na **platformový Clinical Core**: FHIR R4 store ako jediná
klinická pravda, dokumenty (dekurz, správy) sú len rendery, domény (SM+, ďalšie) sú dátové
packy, regióny sa adaptujú na hranici cez packy — kanonický model sa nikdy neforkuje.

**Pozícia (A6):** Hilbi je orchestrátor, nie konkurent Epicu. Dva režimy per trh:
**companion** (bežíme nad certifikovaným EHR, klinická pravda u nás len care plans +
engagement, zvyšok write-back do master EHR) a **primary** (sme záznamový systém lekára —
tam nesieme plnú regionálnu záťaž). Certifikačné kapability = samostatné BE mikroslužby
v packoch, nikdy v jadre.

## Výsledok auditov

Tri nezávislé audity (US / EU / India): 7 kritických nálezov, **žiadny nespochybnil jadro** —
všetky sú hraničné/governance doplnky. Sedem konvergentných klauzúl je zapracovaných vo
v0.10 (aditívne, K35). Jediný v1.0 dizajnový gate (GDPR výmaz vs. nemenný store) je
uzavretý klauzulou H6.

## Čo žiadam schváliť

| # | Rozhodnutie | Kto |
|---|---|---|
| 1 | core-01 v0.10 → `active` v1.0 (podmienené bodmi 2–4) | Roman + Marek |
| 2 | Deployment módy per trh (O9): US = companion · India = primary · EÚ = per členský štát (SK ambulancie primary) | Roman |
| 3 | Vlastníctvo otvorených položiek: O2+O6 retenčná/výmazová matica, O7 podpisová matica, O8 MDR/AI Act kvalifikácia IQ predikcií — Marek; O1 store voľba — Juraj; O5 sm_* migrácia — Viktor | Marek potvrdí kapacitu |
| 4 | Region packy core-07/08/09 ako záväzný scope BE mikroslužieb (základ dev plánu) | Roman |

## Riziká a termíny, ktoré treba vidieť

- **EHDS (EÚ):** sme výrobca EHR systému; povinnosti prvej vlny od 26. 3. 2029, vykonávacie
  akty EEHRxF do 26. 3. 2027 — architektúra pripravená, sleduje sa cez K35.
- **India:** DPDP Rules 2025 už platia (fázovanie do 2027); HHI takmer isto Significant Data
  Fiduciary → DPO v Indii, ročný audit, algoritmická due diligence pre IQ.
- **US:** žiadna ONC certifikácia (companion) — kritická podmienka: disciplína A6, žiadna
  klinická pravda mimo care-plan scope bez write-backu.
- **IQ predikcie:** kým O8 neuzavrie Marek, ostávajú `preliminary`, označené, nepreskriptívne.

## Ďalší krok po schválení

v1.0 tag → dev plán mikroslužieb z core-07/08/09 (Dominika rozdelí, Viktor vedie) →
prepojenie Care Plans domény a patient pathway z kokpitu na Core (mapovací dokument, nie
nová architektúra).

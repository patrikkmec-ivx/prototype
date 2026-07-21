---
doc_id: TBD (priradiť podľa gsr-13)
title: "SOAP jadro, case vrstva a billing derivácia — kokpit"
version: 1.3-draft
date: 2026-07-20
authority: "navrhol: Patrik (CEO) · schvaľuje: Roman (CBO) · aplikuje: Dominika/Viktor · kontroluje: Marek"
type: normative
ssot_for: "klinický záznamový model kokpitu (SOAP), case vrstva, derivácia vykazovania"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: draft — čaká na schválenie (Roman) a compliance kontrolu (Marek)
related: [cp-01-tech-standard, cp-13-tech-smplus-mapping, cp-14-tech-soap-screen-flow]
---

# SOAP jadro, case vrstva a billing derivácia

Účel: jeden klinický záznamový model pre všetky trhy (US, EU, India). Lekár vykonáva
akcie; systém ich mapuje do SOAP štruktúry na pozadí. Flows sa líšia poradím vstupov,
nie dátovým modelom.

## 1. Normatívne pravidlá — jadro

- **SOAP-01** Každý klinický zápis MUSÍ byť priradený práve jednému SOAP slotu (S/O/A/P).
- **SOAP-02** SOAP NIKDY nie je prezentovaný ako povinný formulár; vzniká akumuláciou akcií.
- **SOAP-03** Dekurz je kompilácia akcií encounteru do FHIR `Composition` so sekciami S/O/A/P; kompiluje sa priebežne na pozadí.
- **SOAP-04** Mapovanie akcií: eRx → `MedicationRequest` (P) · order → `ServiceRequest` (P) · follow-up → `Appointment` (P) · diagnóza/poznámka → `Condition`/text (A) · vitály/nálezy/výsledky → `Observation` (O) · ťažkosti/anamnéza/chat výňatok → S.
- **SOAP-05** Jednoriadková poznámka má default slot **A**; prepínač S/O/A/P je dostupný, nikdy povinný.
- **SOAP-06** Podpis dekurzu validuje minimálny set podľa `market_rules`; chýbajúce sloty sa indikujú (completeness `S○ O● A● P●`), NIKDY neblokujú nad rámec trhového minima.
- **SOAP-07** Order NIE JE neúplný dekurz. Order vytvára otvorenú slučku (pending result); výsledok sa zapisuje ako O. Kategórie prvej úrovne v UI sú výhradne **Radiology** a **Labs** (nie modality typu MRI); položky sú katalógové per trh/zariadenie.
- **SOAP-08** Finálna správa je render `Composition` (→ `DocumentReference`). Existujú dva templaty: **Rx slip** (IN default) a **plná správa** (EU/US default, obsahuje eRx a follow-up). Jeden dátový objekt, žiadne obsahové vetvenie.
- **SOAP-09** `market_rules` je konfigurácia, nie kódová vetva: minimal-sign set · požiadavka kódovania dg (ICD-10) · default render template · follow-up prezentácia (IN: 1-klik chip pri Rx · EU/US: riadok v správe).

- **SOAP-10** Reverzný návrh A z P (napr. návrh diagnózy odvodený z predpísaných liekov) je prípustný VÝHRADNE ako explicitne potvrdzovaný návrh — vyplní pole, lekár potvrdzuje; nikdy autofill, nikdy tichý zápis.

## 2. Normatívne pravidlá — case vrstva

- **CASE-01** Každý `Encounter` MUSÍ patriť práve jednej `EpisodeOfCare`. Ambulantný prípad = epizóda s jedným encounterom (bez UI réžie navyše).
- **CASE-02** Presun pacienta medzi oddeleniami = uzavretie encounteru + nový encounter v tej istej epizóde. Pacient sa NIKDY nekopíruje.
- **CASE-03** Handoff medzi oddeleniami generuje IQ draft zhrnutia v štruktúre ISBAR zo skompilovaného SOAP prípadu; zhrnutie je udalosť na osi, potvrdzuje odovzdávajúci lekár.
- **CASE-04** Každá udalosť nesie autora A oddelenie. Časová os prípadu je jedna; oddelenie vidí svoju výseč, ošetrujúci lekár prípadu celok.


## 2b. Normatívne pravidlá — encounter vrstvenie na časovej osi

- **ENC-01** Časová os zobrazuje defaultne granularitu encounteru; atomické udalosti sa vrstvia pod ním ako SAMOSTATNÉ REDUKOVANÉ KARTY na vnorenej osi (dlaždica → mini-os s kartami → detail). Rovnaký vizuálny jazyk karty na každej úrovni, len menší.
- **ENC-02** Prvá akcia nad pacientom otvorí encounter; každá ďalšia akcia v seanse sa pripája automaticky. Podpis encounter uzatvára. Zoskupenie je vedľajší produkt práce, nikdy krok navyše.
- **ENC-03** Encounter s jednou udalosťou sa renderuje ako samotná udalosť (degenerácia — indický Rx-only zápis ostáva jednou kartou).
- **ENC-04** Asynchrónny výsledok orderu sa pripája k encounteru, z ktorého order vyšiel; slučka sa uzatvára dovnútra skupiny.
- **ENC-06** Collapse pravidlá dlaždice: počas práce (Prebieha) rozbalená; podpis ju automaticky zbalí na čistý súhrn; historické encountery default zbalené; chevron prepína kedykoľvek.
- **ENC-05** Typ/názov encounteru sa derivuje z odbornosti lekára (GP vyšetrenie, Ortopedické vyšetrenie…), je editovateľný. Súhrnná dlaždica agreguje kľúčové info čiastkových úkonov (A; P · O) + SOAP chipy + stav + počet.

## 3. Normatívne pravidlá — billing derivácia

- **BILL-01** Fakturačný podklad sa VÝHRADNE derivuje z klinických objektov; nikdy sa nezadáva ako paralelný zápis.
- **BILL-02** Systém je suggestion engine: navrhuje `ChargeItem` kandidátov, lekár potvrdzuje. Automatické vykazovanie bez potvrdenia je zakázané (US: False Claims Act riziko; EU: revízne kontroly).
- **BILL-03** ChargeItem kandidáti sa zbierajú per encounter (potvrdenie pri uzavretí pobytu) a agregujú per epizóda pri prepustení → účet / DRG dávka / `Invoice`. Uzatvára gap H31 (cp-13).
- **BILL-04** E/M návrh úrovne (US) sa odvádza z MDM elementov SOAP dát a MUSÍ niesť zdôvodnenie z vlastných dát lekára. Cieľ je úplné zachytenie legitímne vykonaného, nikdy upcoding.
- **BILL-05** Interná atribúcia výnosov per oddelenie je vedľajší produkt CASE + BILL vrstvy; nevyžaduje dodatočný zápis.

## 4. Flows (informatívne)

**A — India, Rx-first:** Rx (P) → voliteľne 1 veta (A) → podpis (min. A+P) → Rx slip. Follow-up 1-klik chip.
**B — EU/US, lineárny S-O-A-P:** sekvenčný zápis → podpis → plná správa vrátane eRx a follow-up riadku.
**C — Ordery:** Radiology/Labs → pending slučka → výsledok ako O (ten istý alebo follow-up encounter).
**Viacoddelenkový prípad:** flows A–C sa opakujú per encounter vnútri jednej epizódy; prepustenie agreguje správu aj účet.

Referenčný diagram: `cp-14-tech-soap-screen-flow.mermaid`.

## 5. Produkčný postup — dve stopy

**Stopa 1 — dátová vrstva (štartuje hneď, Viktor):** EpisodeOfCare, Encounter, Composition, MedicationRequest, ServiceRequest, Observation, Condition, Appointment, ChargeItem/Invoice + `market_rules` konfigurácia. Nezávislé od UI.
**Stopa 2 — UI (handoff po validácii v prototype):** K-16 SOAP chipy + poznámka default A → K-17 dekurz v2 + completeness + chat→S → K-18 ordery + pending → K-19 podpis & render (validácia Flow A vs B na tých istých dátach) → K-20 ChargeItem potvrdenie pri podpise → K-21 case layer (zoskupenie osi per epizóda, oddelenie ako atribút, handoff, agregovaný účet) → M-17/M-18 mobilné sheety. Mobilný text výhradne cez typo tokeny M-17 (podlaha 12 px).

## 6. Otvorené body (blokujú produkčné nasadenie, nie štart stopy 1)

1. Marek: sign-off unified dashboard (ISO 27001/27701, EHDS, HIPAA).
2. Cross-region identita — najrizikovejší architektonický bod, uzavrieť pred ostatnými rozhodnutiami.
3. Marek: potvrdenie minimal-sign A+P pre IN voči Telemedicine Practice Guidelines 2020 / ABDM.
4. Marek: právna hranica „návrh výkazu" vs. „poradenstvo pri kódovaní" per jurisdikcia.
5. CPT licencia (AMA) pre US — nákladová položka go-to-market.
6. doc_id tohto dokumentu podľa gsr-13.

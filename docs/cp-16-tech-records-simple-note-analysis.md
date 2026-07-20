---
doc_id: TBD (priradiť podľa gsr-13)
title: "Records a jednoduchý zápis vyšetrenia — analýza (K-24/K-25)"
version: 0.9-analysis
date: 2026-07-20
authority: "navrhol: Patrik (CEO) · schvaľuje: Roman (CBO) · aplikuje: Dominika/Viktor · kontroluje: Marek"
type: informative
ssot_for: "—"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: analysis — odložené, čaká na go (Patrik); po go povýšiť relevantné pravidlá do cp-15 v1.2 ako normatívne
related: [cp-15-tech-soap-case-billing-standard, cp-14-tech-soap-screen-flow]
---

# Records a jednoduchý zápis vyšetrenia — analýza

Stav: analytický záznam z 20.07.2026. Implementácia (K-24/K-25) ODLOŽENÁ do
explicitného go. Nič z tohto dokumentu zatiaľ nie je v prototype.

## 1. Kľúčový princíp

**Records NIE JE zdroj dekurzu. Records aj dekurz čerpajú z toho istého prúdu
udalostí.** Druhý paralelný zápisový kanál by vytvoril duplicitnú pravdu.

Tri vrstvy:
1. **Udalosti** — atomické, so SOAP slotom; jediný zdroj pravdy; z nich sa
   kompiluje dekurz (existuje, v65–v74).
2. **Records** — knižnica artefaktov prípadu: štruktúrované vyšetrenia,
   generované výstupy (správy, slipy), prijaté dokumenty (OCR, externé),
   ordery s výsledkami. Artefakt je obal — odkazuje na udalosti, ktoré
   vygeneroval alebo z ktorých je vyrenderovaný.
3. **Dekurz** — kompilát udalostí dňa/encounteru (nemení sa).

## 2. Formulár = generátor udalostí

Štruktúrovaný formulár má deklarované SOAP mapovanie sekcií; vyplnenie emituje
dávku udalostí do rovnakých slotov ako atomické akcie z "+". Formulár sám sa
ukladá ako artefakt (FHIR `Composition` + `DocumentReference`) do Records.

Čiastkové vs. celok: formulár sa ukladá čiastkovo (draft); každá dokončená
sekcia emituje svoje udalosti hneď. "Celý prípad" nevzniká zápisom, ale
kompiláciou (deň = dekurz, encounter = správa, epizóda = case view K-21).

## 3. Referenčné mapovanie: Red-flag review (Neurológ, Lovable)

Red-flag review je mikroslužba care planu — NEMENÍ SA; v Records sa zobrazí
len ako artefakt. Mapovanie slúži ako referenčný vzor:

| Sekcia | SOAP | Poznámka |
|---|---|---|
| Anamnéza: Úvod, TO, OA, RA | S | |
| AA — alergická (chipy) | S | + duálny zápis do Life ID (Alergie) |
| LA — lieková anamnéza | S | história medikácie ≠ preskripcia — NIKDY negeneruje P |
| Subjektívne + symptómové chipy | S | kódované symptómy (vstup pre IQ) |
| Objektívne OBJ (status neurologicus) | O | |
| Vitály TK/pulz/výška/váha/BMI | O | + zápis do Vital data (Life ID) |
| EDSS (skóre) | O | skórovaná škála = objektívny nález |
| Doplňujúce: epizódy, komorbidity | S | komorbidity plnia problem list |

Formulár zámerne nemá A ani P — vstupná/triážna šablóna emituje S+O;
záver (A) a plán (P) sú akcie lekára po formulári. Completeness po vyplnení:
S● O● A○ P○.

Preberané vzory: šablóny per pole (Štandardná + edit), chipová kodifikácia
namiesto voľného textu, vstupy Nahrať / Odfotiť / Vložiť z NIS v hlavičke.

## 4. Rozhodnutie Patrika: jednoduchý zápis bez care planu

Namiesto plnej šablóny sa buduje **jednoduchý zápis vyšetrenia**:

**Dve cesty dnu:**
1. **Vlastný zápis** — prázdne sekcie Anamnéza (S) · Subjektívne (S) ·
   Objektívne + vitály (O), každá s viditeľným SOAP badge.
2. **Odfotiť prinesené** — foto → OCR prepis do Anamnézy (označený
   "IQ prepis · na overenie", vzor existujúcej OCR karty); lekár pokračuje
   Subjektívnym a Objektívnym nálezom.

**Ukladanie a verzovanie:** Uložiť = draft artefakt v Records + emisia
udalostí z dokončených (neprázdnych) sekcií do dekurzu + riadok verzie
v dekurze ("vyšetrenie v1 — koncept"). Ďalšie uloženie = v2; emitujú sa len
novo dokončené sekcie — žiadne duplicity. A/P v zápise nie sú — ostávajú
akciami (Record / Rx / Order).

## 5. Návrh Records tabu (K-24)

Foldre per prípad/epizóda (nadväzuje na K-21): **Vyšetrenia** · **Správy**
(generované z podpisov) · **Prijaté dokumenty** (OCR, externé) · **Ordery &
výsledky** (prepojené na pending slučky). Artefakt: názov, dátum, autor +
oddelenie, stav (draft / podpísané / na overenie), preklik "zobraziť udalosti".
Nový zápis sa zakladá z Records aj z "+" menu — obe cesty do toho istého.

## 6. Pravidlá na povýšenie do cp-15 v1.2 (po go)

- **SOAP-11** Štruktúrovaný formulár je generátor udalostí; sekcie majú
  deklarované SOAP mapovanie; čiastkové uloženie emituje udalosti dokončených
  sekcií (opakované uloženie len novo dokončené — bez duplicít).
- **REC-01** Artefakt vždy odkazuje na svoje udalosti (oboma smermi).
- **REC-02** Records nikdy nie je zápisový kanál mimo udalostí.
- **REC-03** Organizácia artefaktov per epizóda/encounter.
- **REC-04** Lieková anamnéza (história medikácie) NIKDY negeneruje P;
  nová preskripcia ide výhradne cez Rx flow.

## 7. Plán dávok (po go)

- **K-24** Records tab: foldre, artefakty so stavom, väzba na udalosti;
  správa z K-19 a zápisy padajú automaticky.
- **K-25** Jednoduchý zápis vyšetrenia: dve cesty (vlastný / OCR z fotky),
  SOAP badge na sekciách, Uložiť = draft + emisia + verzia v dekurze.
- **cp-15 v1.2** SOAP-11 + REC-01..04.

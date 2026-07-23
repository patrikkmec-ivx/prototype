---
doc_id: TBD (priradiť podľa gsr-13)
title: "Report conformance — shell, terminológia, podpis, provenance, AI transparentnosť"
version: 1.1-draft
date: 2026-07-23
authority: "navrhol: Patrik (CEO) · schvaľuje: Roman (CBO) · aplikuje: Dominika/Viktor · kontroluje: Marek"
type: normative
ssot_for: "rola systému (overlay/core), report shell, terminologická väzba, podpis a amendment, provenance a audit, súhlas pri zdieľaní, transparentnosť AI návrhov"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: draft — čaká na schválenie (Roman) a compliance kontrolu (Marek)
related: [cp-15-tech-soap-case-billing-standard, cp-16-tech-records-simple-note-analysis, cp-18-tech-report-lifecycle, cp-19-tech-templates-intake-analysis, core-01-tech-clinical-core-standard]
---

# Report conformance

Účel: zamknúť pravidlá, ktoré robia výstup kokpitu akceptovateľným u zdravotníckych
poskytovateľov v US, EÚ a Indii. `cp-15` definuje **záznamový model** (SOAP, case,
billing derivácia). Tento dokument definuje **čo sa s tým záznamom smie stať** — ako
sa kóduje, podpisuje, verzionuje, audituje, zdieľa a ako sa deklaruje podiel AI.

Rozsah: klinický report a jeho životný cyklus. Mimo rozsah: Records knižnica
(odložená per `cp-16`), MDR klasifikácia (rozhoduje Marek).

---

## 1. Rola systému — overlay vs core

> **Kontinuita.** Táto pozícia nie je nová. Care Plans Standard ju zamkol v **A1
> "Position: orchestrator, not an EHR"** — Hilbi nie je system of record, EHR/NIS je master
> klinického záznamu. Pravidlá nižšie sú jej rozpracovaním pre report vrstvu.

- **REP-01** Hilbi je **default v role overlay** (orchestrátor nad existujúcim
  systémom poskytovateľa). Rola `core` je **opt-in konfigurácia**, NIE default.
- **REP-02** V móde `overlay` je autoritatívny podpísaný záznam v hostiteľskom
  systéme (system of record). Hilbi kompiluje, predkladá na potvrdenie a zapisuje
  späť. Hilbi si v tomto móde NESMIE nárokovať rolu system of record.
- **REP-03** V móde `core` je autoritatívna `Composition` Hilbi. Prepnutie do `core`
  MUSÍ byť sprevádzané napojením certifikačnej vrstvy podľa regulácie trhu
  (EÚ: EHDS CE režim pre EHR systémy · US: certifikované Health IT · IN: ABDM).
- **REP-04** Prechod `overlay → core` MUSÍ byť zmenou konfigurácie a napojením
  služieb, NIKDY prepisom dátového modelu. Všetky pravidlá tohto dokumentu platia
  v oboch módoch rovnako; líši sa len to, kde žije autoritatívny podpis.
- **REP-05** Aktuálny mód MUSÍ byť deklarovaný na renderi (viditeľne, nie skryto
  v konfigurácii).

## 2. Report shell

- **REP-06** Report MÁ jednotný shell: hlavička (identita) · telo (sloty) · pätka
  (podpis, profil, mód, status). Chrome sa definuje **raz**; typy reportov sa líšia
  výberom a formátom slotov, NIKDY duplikáciou hlavičky alebo pätky.
- **REP-07** Identita sa číta **z kontextu**, NIKDY nie je zapísaná natvrdo. Nesie
  identifikátory podľa trhu: IN `ABHA` (pacient), `HPR` (lekár), `HFR` (zariadenie) ·
  US `MRN`, `NPI` · EÚ národný identifikátor.
- **REP-08** Render MUSÍ deklarovať cieľový **dokumentový profil** trhu
  (IN: ABDM Prescription / OPConsultation · EÚ: EEHRxF · US: US Core / C-CDA).
- **REP-09** Platí `SOAP-08`: jeden dátový objekt, viac templatov, žiadne obsahové
  vetvenie. Templat je formát, nie iný obsah.

## 3. Terminológia

- **TERM-01** Klinický obsah určený na strojové spracovanie MUSÍ byť kódovaný.
  Kódové pole NIKDY nesmie obsahovať voľný text.
- **TERM-02** **Dual coding.** Záznam sa kóduje referenčnou terminológiou
  (**SNOMED CT**), výkaz štatistickou klasifikáciou (**MKCH-10 / ICD-10 / ICD-10-CM**
  podľa trhu). Sú to dve vrstvy, NIE alternatívy.
- **TERM-03** Naratív sa NIKDY nestráca. Väzba je FHIR `CodeableConcept` =
  `coding[]` **+** `text`; formulácia lekára ostáva v `text`. Podpísaný dokument MUSÍ
  niesť ľudsky čitateľný naratív (`Composition.text`).
- **TERM-04** Väzba podľa SOAP slotu:
  - **A** — `SNOMED CT` (záznam) **+** klasifikácia trhu (výkaz), povinné
  - **O** — `LOINC`
  - **P** — `SNOMED CT` + liekový systém trhu (`ATC` pre EÚ/IN, `RxNorm` pre US)
  - **S** — prevažne naratív; NESMIE byť kódovaný nasilu
- **TERM-05** Kód vzniká **pri zázname** (capture). Odvodzovanie kódu z voľného textu
  pri renderi NIE JE prípustné ako produkčný mechanizmus.
- **TERM-06** Výber kódu je **vyhľadávanie nad ValueSetom** viazaným na pole,
  špecializáciu a trh (`$expand` / `$validate-code`). Výber z celého číselníka
  formou `select` NIE JE prípustný.
- **TERM-07** ValueSety, mapy a liekový systém sa rozlišujú per trh cez
  `market_rules` — konfigurácia, nie kódová vetva (rozšírenie `SOAP-09`).
- **TERM-08** Nekódovaná položka MUSÍ byť vizuálne priznaná. Tichý preskok
  nekódovanej položky NIE JE prípustný.
- **TERM-09** Použitie SNOMED CT MUSÍ byť registrované u národného release centra
  (SK: NCZI). V členských krajinách je použitie bez licenčného poplatku; pre
  nečlenské územia platí affiliate režim.

## 4. Podpis

- **SIG-01** Podpisová úroveň je vlastnosť trhu v `market_rules`
  (EÚ: eIDAS pokročilý/kvalifikovaný · US: e-signature podľa HIPAA a štátu ·
  IN: IT Act / ABDM).
- **SIG-02** Podpis validuje minimálny set slotov podľa `SOAP-06`.
- **SIG-03** V móde `overlay` Hilbi podpis **predkladá a zaznamenáva**, právne
  platný podpis vykonáva hostiteľský systém. Hilbi NESMIE prezentovať vlastný
  UI-stav ako právne platný podpis.

## 5. Amendment

- **AMD-01** `Composition.status` prechádza `preliminary` → `final` (prvý podpis) →
  `amended` (každá ďalšia verzia).
- **AMD-02** Podpísaný záznam je **nemenný**. Oprava sa vykonáva **addendom**,
  NIKDY tichou editáciou.
- **AMD-03** Originál MUSÍ byť zachovaný a dohľadateľný pri každej revízii.
- **AMD-04** Každá revízia MUSÍ niesť dôvod opravy a vlastný `Provenance` záznam.

## 6. Provenance a audit

- **PROV-01** Každá tvorba alebo zmena klinického obsahu MUSÍ generovať
  `Provenance`: agent, rola, čas, aktivita, cieľ.
- **PROV-02** Role: `author` (zápis) · `attester` (podpis, addendum) ·
  `verifier` (potvrdenie výkazu).
- **PROV-03** Obsah navrhnutý AI MUSÍ byť atribuovaný agentovi **Hilbi IQ**, nikdy
  implicitne lekárovi. Potvrdenie lekárom sa zaznamenáva ako samostatný akt.
- **AUD-01** Každý prístup, export alebo zdieľanie MUSÍ generovať `AuditEvent`
  s **purpose-of-use**.
- **AUD-02** Audit log MUSÍ byť perzistentný, nemenný a tamper-evident. Log držaný
  len v pamäti relácie NIE JE zhodný s touto normou.
- **AUD-03** Retenčná doba auditu sa riadi trhom a určuje ju compliance
  (US: HIPAA · EÚ: EHDS + GDPR · IN: DPDP; India navyše vyžaduje bezpečnostný audit
  cez CERT-In empanelled auditora pre ABDM certifikáciu).

## 7. Súhlas a zdieľanie

- **CNS-01** Zdieľanie mimo kontext liečby MUSÍ niesť súhlasový kontext. Tlačidlo
  bez súhlasového kontextu NIE JE prípustné.
- **CNS-02** **IN** — zdieľanie je viazané na ABDM Consent Manager: explicitný,
  časovo obmedzený a odvolateľný súhlas pacienta. Federovaný model: záznam ostáva
  u pôvodcu.
- **CNS-03** **EÚ** — purpose-of-use podľa EHDS vrátane práva pacienta obmedziť
  prístup.
- **CNS-04** **US** — info-blocking pravidlá a funkcia obmedzenia prístupu.
- **CNS-05** Zdieľať sa smie iba **podpísaná verzia**, nikdy draft.

## 8. Transparentnosť AI (DSI)

- **DSI-01** Každý AI výstup MUSÍ byť označený ako **návrh**.
- **DSI-02** Návrh MUSÍ deklarovať: typ mechanizmu (pravidlo vs. model), verziu,
  vstupy a logiku.
- **DSI-03** AI NIKDY nezapisuje ticho. Zápis vzniká výhradne potvrdením lekára
  (v súlade s `SOAP-10`, `BILL-02`).
- **DSI-04** AI výstup NESMIE byť prezentovaný ako diagnostické rozhodnutie.
  Hranica návrh/rozhodnutie je zároveň hranicou voči MDR — posudzuje compliance.
- **DSI-05** Zmena verzie logiky návrhu MUSÍ byť zaznamenaná a viditeľná.

## 9. Šablóny

- **TPL-01** Šablóna určuje **formu** výstupu a NIKDY nie je miestom uloženia údaja.
  Sekcia šablóny vyberá a zoraďuje položky; položky si nesú svoju FHIR identitu.
- **TPL-02** Šablóna sa pri uložení MUSÍ validovať proti povinnému minimu trhu.
  Nevalidná šablóna sa NESMIE stať aktívnou.
- **TPL-03** Typ dokumentu (`slotKey`), šablóna poskytovateľa a pravidlá trhu sú **tri
  nezávislé osi**. Trh NIKDY nevyberá šablónu — trh určuje minimum a kódové systémy.
- **TPL-04** Anamnestické okruhy (OA, AA, FA, RA, SA, PA) patria na **pacientsku
  úroveň**; šablóna ich do dokumentu premieta. NESMÚ sa ukladať ako súčasť encounteru.
- **TPL-05** Šablónový povrch je **doménovo neutrálny**. NESMIE obsahovať doménovo
  špecifické sekcie natvrdo; vykresľuje to, čo mu dodá register a doménový plug-in.
- **TPL-06** Šablóna definuje sekcie a väzby; **renderery sú vymeniteľné**
  (štruktúrovaný a textový). Textový výstup slúži na prenos do cudzieho systému
  a MÔŽE niesť kódy podľa nastavenia šablóny.

## 10. Vstup cez Hilbi IQ

- **INT-01** Výstup OCR a AI extrakcie vzniká ako **kandidát** (`validated=false`),
  atribuovaný agentovi Hilbi IQ, označený ako návrh.
- **INT-02** Nevalidovaný kandidát sa NESMIE dostať do podpísaného dokumentu.
  Validácia je vedomý akt lekára a zaznamenáva sa (`Provenance`, `AuditEvent`).
- **INT-03** Coverage — vyplnené a chýbajúce sekcie — MUSÍ byť viditeľná pred podpisom.
- **INT-04** Položka prenesená z predchádzajúceho encounteru MUSÍ byť viditeľne
  označená ako prenesená, MUSÍ sa potvrdzovať **po položkách** (nikdy hromadne)
  a jej `Provenance` MUSÍ niesť zdrojový encounter — nie dnešné pozorovanie.
- **INT-05** Prenesená a nepotvrdená položka sa NESMIE započítať do derivácie výkazu.
- **INT-06** Nahrávanie konzultácie vyžaduje súhlas pacienta; rozsah a forma sa riadia trhom.
- **INT-07** MUSÍ byť rozhodnuté, či sa audio po prepise uchováva alebo zahadzuje,
  a či je súčasťou zdravotnej dokumentácie. Do rozhodnutia sa audio NEUCHOVÁVA.

## 11. Integrácia modulov

- **SYS-01** Dash je **system of record**. Úložisko integrovaného modulu (napr. Care Plan)
  je **odvodené** — projekcia, nie rovnocenný zdroj.
- **SYS-02** Žiadny klinický fakt NESMIE existovať iba v integrovanom module.
- **SYS-03** Komunikácia medzi Dash a integrovaným modulom prebieha **výhradne cez API**.
  Priamy prístup do cudzej databázy NIE JE prípustný.
- **SYS-04** Akcia vykonaná v integrovanom povrchu MUSÍ vytvoriť `Provenance` v Dash.
  API preto nesie agenta, rolu a purpose-of-use — audit sa NESMIE končiť na hranici modulu.

## 12. Trhová matica

| Vrstva | EÚ | US | IN |
|---|---|---|---|
| Dokumentový profil | EEHRxF | US Core / C-CDA | ABDM Prescription / OPConsultation |
| Záznam (referenčná) | SNOMED CT | SNOMED CT | SNOMED CT |
| Výkaz (klasifikácia) | MKCH-10 (SK) / ICD-10 | ICD-10-CM | ICD-10 |
| Laboratórne | LOINC | LOINC | LOINC |
| Lieky | ATC | RxNorm | ATC |
| Podpis | eIDAS AdES/QES | HIPAA e-signature | IT Act / ABDM |
| Identita | národný identifikátor | MRN, NPI | ABHA, HPR, HFR |
| Súhlas | EHDS purpose-of-use | info-blocking | ABDM Consent Manager |
| Certifikácia (mód `core`) | EHDS CE režim | certifikované Health IT | ABDM + CERT-In audit |

## 13. Stav prototypu voči tejto norme

Prototype (`index.html`, v129) implementuje **štruktúru**; nasledujúce body sú
vedome placeholdery a NIE sú zhodné s normou:

| Pravidlo | Stav |
|---|---|
| TERM-05, TERM-06 | ✗ kód sa odvodzuje regexom pri renderi; capture-side picker chýba |
| TERM-01..04, TERM-08 | ✓ štruktúra dual coding, naratív zachovaný |
| AUD-02 | ✗ audit log len v pamäti relácie |
| SIG-01, SIG-03 | ~ úroveň deklarovaná, integrácia podpisu chýba |
| AMD-01..03 | ✓ · AMD-04 ✗ (dôvod opravy sa nezbiera) |
| PROV-01..02 | ✓ · PROV-03 ~ (atribúcia AI nie je dôsledná) |
| CNS-01..05 | ~ súhlasový kontext deklarovaný, dialóg chýba |
| DSI-01..04 | ✓ · DSI-05 ✗ |
| REP-01..09 | ✓ |
| TPL-01, TPL-03, TPL-05, TPL-06 | ✓ register doménovo neutrálny, tri osi, dva renderery |
| TPL-02 | ✗ validácia šablóny proti minimu trhu chýba |
| TPL-04 | ✗ anamnestické okruhy zatiaľ nie sú na pacientskej úrovni |
| INT-03 | ✓ coverage |
| INT-01, INT-02, INT-04..07 | ✗ intake vrstva zatiaľ nepostavená |
| SYS-01..04 | ✗ integrácia zatiaľ nepostavená |

## 14. Otvorené body

- **Marek** — MDR hranica pre Hilbi IQ (`DSI-04`); rozsah EHDS CE režimu a Cyber
  Resilience Act pri prechode do módu `core`; podpisová úroveň per trh (`SIG-01`);
  retencia auditu (`AUD-03`); India CERT-In.
- **Registrácia použitia SNOMED CT** u NCZI (`TERM-09`).
- **Výber terminologického servera** pre `$expand` / `$validate-code` (`TERM-06`).
- **Perzistencia auditu** — návrh nemenného, tamper-evident úložiska (`AUD-02`).
- **doc_id** priradenie podľa `gsr-13`.

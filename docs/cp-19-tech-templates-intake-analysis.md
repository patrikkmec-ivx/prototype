---
doc_id: TBD (priradiť podľa gsr-13)
title: "Šablóny, IQ intake a kompilácia dekurzu — analýza a postup"
version: 1.0-draft
date: 2026-07-23
authority: "navrhol: Patrik (CEO) · schvaľuje: Roman (CBO) · aplikuje: Dominika/Viktor · kontroluje: Marek"
type: informative
ssot_for: "—  (analýza; normatívne dôsledky patria do cp-17 a cp-15)"
domain: dev
visibility: internal
market: [SK, CZ, DE, IN, AE, US]
status: draft — analýza pred implementáciou
related: [cp-15-tech-soap-case-billing-standard, cp-16-tech-records-simple-note-analysis, cp-17-tech-report-conformance-standard, cp-18-tech-report-lifecycle]
---

# Šablóny, IQ intake a kompilácia dekurzu

Analýza šablónovej vrstvy zo SM Care Plan+ (`@hilbi/summary-templates`) a jej prenosu
do kokpitu ako mikroslužby. Cieľ: **podchytiť akýkoľvek čiastkový vstup, držať jednotnú
FHIR štruktúru na pozadí a na frontende zobraziť podľa šablóny poskytovateľa.**

Tento dokument je **informatívny**. Normatívne dôsledky sú vymenované v §7 a patria
do `cp-17`.

---

## 1. Prečo šablóny

Poskytovatelia sa väčšinovo držia SOAP, ale vetvia ho — najmä subjektívnu časť —
na anamnestické okruhy: **OA** (osobná), **AA** (alergická), **FA** (farmakologická),
**RA** (rodinná), **SA** (sociálna), **PA** (pracovná). Každé pracovisko má vlastný
zvyk a vlastnú štruktúru výstupu.

Šablóna rieši tri veci naraz:

1. **Zobrazenie** — lekár vidí dekurz v štruktúre, na ktorú je zvyknutý.
2. **Kompilácia** — čiastkové vstupy (OCR, formulár, chat, meranie) sa poskladajú
   do súvislého textu bez toho, aby ich lekár prepisoval.
3. **Výstup do cudzieho systému** — vyrenderovaný **plain text** sa vloží cez schránku
   priamo do existujúceho EHR, ktorý väčšinou prijíma voľný text. Z toho si pracovisko
   tlačí svoje správy.

Bod 3 je priamym naplnením role **overlay** (`cp-17` REP-01, REP-02): nepotrebujeme
integráciu s cudzím systémom, aby sme boli užitoční. Zároveň si u seba držíme
štruktúrovaný záznam.

## 2. Čo preberáme zo SM Care Plan+

| Prvok | Rola | Poznámka k prevzatiu |
|---|---|---|
| `slotKey` | typ dokumentu (dekurz, žiadanka, súhlas, pacientsky list) | Generalizácia nášho `tpl`. Jedna pipeline, N výstupov. |
| `kind: system` / `user` | šablóny dodané vs. vytvorené poskytovateľom | Priama odpoveď na „každý poskytovateľ má svoje". |
| **Coverage** `{total, filled, missing[]}` | koľko polí je vyplnených | Nemáme. Napojiť na completeness (`SOAP-06`) a na priznanie medzery (`TERM-08`). |
| **Split-save / karanténa** | `validated=false` sa nedostane do dekurzu | **Kritické pre IQ intake.** Bez toho OCR zanesie neoverené dáta. |
| Adaptérové úložisko | Session → Supabase → REST → Core | Prevziať rozhranie, nie implementáciu. |
| Immutabilná história | nová generácia = nová verzia | Zhoduje sa s `AMD-01..03`. |
| Doménové formattery | jediné miesto kolapsu štruktúry do textu | Zachovať ako pravidlo. |
| Token / Mapping / Kb registre | katalóg tokenov, kanonické cesty, návod | Tokeny **generovať** z modelu, nie písať ručne. |
| Pure renderer bez I/O | testovateľnosť | Zachovať. |

## 3. Čo musíme rozhodnúť inak

### 3.1 Sekcia šablóny je pohľad, nie zdroj

Anamnestické okruhy vyzerajú ako textové podnadpisy, ale zodpovedajú samostatným
FHIR zdrojom:

| Okruh | FHIR zdroj |
|---|---|
| AA — alergická | `AllergyIntolerance` |
| FA — farmakologická | `MedicationStatement` |
| OA — osobná | `Condition` (minulé), `Procedure` |
| RA — rodinná | `FamilyMemberHistory` |
| SA / PA — sociálna, pracovná | `Observation`, kategória social-history |

Ak sa okruhy uložia ako textové sekcie šablóny, stratí sa štruktúra a systém sa
zredukuje na generátor plain textu. Preto: **sekcia šablóny vyberá a zoraďuje položky;
položky si nesú svoju FHIR identitu.** Šablóna nikdy nie je miesto uloženia.

### 3.2 Anamnéza a encounter majú odlišný životný cyklus

- **Pacientska úroveň** (OA, AA, FA, RA, SA, PA) — pretrváva medzi návštevami,
  **aktualizuje sa**, nevzniká nanovo. Patrí do Life ID.
- **Encounter úroveň** (S, O, A, P dnešnej návštevy) — vzniká nanovo pri každom stretnutí.

Šablóna dekurzu anamnézu **premieta**, nevlastní ju. Inak by sa pri každej návšteve
prepisovala.

Toto rozdelenie presne kopíruje IQ intake: **OCR napĺňa pacientsku úroveň** (minulosť
z prinesenej dokumentácie), **lekár dopĺňa encounter úroveň** (dnešok).

### 3.3 Trh šablónu nevyberá — obmedzuje ju

Súčasný model (`MKT.tpl` určuje šablónu) nie je udržateľný, keď si šablóny nesie
poskytovateľ. Správne sú **tri nezávislé osi**:

| Os | Kto určuje | Príklad |
|---|---|---|
| Typ dokumentu | kontext akcie | `slotKey: dekurz` / `referral` / `consent` |
| Šablóna | poskytovateľ | `system` (dodaná) alebo `user` (vlastná) |
| Pravidlá trhu | regulácia | povinné minimum, kódové systémy, podpisová úroveň |

Trh nehovorí „použi Rx slip". Trh hovorí „bez A a P nepodpíšeš" a „diagnóza musí byť
kódovaná". Šablóna určuje **formu**, trh určuje **minimum**.

### 3.4 Používateľské šablóny potrebujú konformančnú bránu

Gap v súčasnom dizajne: ak si poskytovateľ uloží šablónu, ktorá vynechá diagnózu,
vyrenderuje sa nekonformná správa. **Šablóna sa musí pri uložení validovať proti
povinnému minimu trhu** — rovnako, ako sa validuje podpis. Nevalidná šablóna sa
neuloží ako aktívna.

### 3.5 Jedna šablóna, dva renderery

Náš `RPT_TPL` je štrukturálny (zoznam sekcií), `SummaryTemplate` je textový
(`{{tokeny}}`). Nie sú to konkurenti:

```
Šablóna = sekcie + väzby tokenov
   ├─► renderer TEXT        → plain text → schránka → cudzí EHR
   └─► renderer ŠTRUKTÚRA   → HTML so sekciami a kódovými chipmi (naše UI)
```

Šablóna rozhoduje, či sa do textového výstupu dostanú aj kódy (napr. `G35` priamo
v texte) — dual coding sa teda cez schránku nemusí stratiť.

## 4. IQ intake — postup

Postup pre situáciu „pacient prinesie dokumentáciu".

```
1. Pacient prinesie dokumentáciu (papier, výpisy, nálezy)
2. Lekár ju odfotí cez IQ                        → capture
3. OCR + AI extrakcia → KANDIDÁTI
      validated = false
      Provenance.agent = Hilbi IQ                (PROV-03)
      označené ako návrh                         (DSI-01)
4. Auto-kompilácia dekurzu podľa šablóny poskytovateľa
      anamnestické okruhy naplnené z kandidátov  (pacientska úroveň)
5. Lekár dopĺňa S, O, liečbu, plán               (encounter úroveň)
6. Coverage ukazuje, čo ešte chýba
7. Lekár validuje kandidátov                     validated = true + audit
      ⚠ nevalidovaný kandidát sa do podpísaného dekurzu NEDOSTANE
8. Podpis                                        status: final  (AMD-01)
9. Výstupy z tej istej pipeline:
      (a) plain text  → schránka → cudzí EHR     [overlay]
      (b) štruktúrovaný FHIR                     [u nás]
      (c) správy, žiadanky, súhlasy              [iný slotKey]
```

Bezpečnostné jadro postupu je **krok 7**. Výstup OCR aj AI extrakcie je návrh, nie
záznam. Prechod z návrhu do záznamu je vedomý akt lekára a zaznamenáva sa.

## 5. Hranica mikroslužby

| Vrstva | Obsah | Kde žije |
|---|---|---|
| **Engine (generický)** | renderer, formattery, registre, adaptéry, UI picker | `@hilbi/summary-templates` |
| **Doména** | tokeny, mapovania, doménové formattery, bootstrap | plug-in per doména |
| **Doména `core`** | SOAP + anamnestické okruhy pre všeobecnú ambulantnú prax | **nová, treba postaviť** |

Kokpit nie je SM. Potrebuje vlastný doménový plug-in `core`, ktorého tokeny sa
**generujú z nášho klinického modelu**, nie píšu ručne — inak vznikne druhá taxonómia.

## 6. Riziká

| Riziko | Dôsledok | Ošetrenie |
|---|---|---|
| Šablóna sa stane úložiskom | strata FHIR štruktúry, návrat k plain textu | §3.1 — sekcia je pohľad |
| Anamnéza v dekurze | prepisovanie pri každej návšteve | §3.2 — pacientska úroveň |
| Neoverený OCR výstup v podpísanom zázname | klinické a právne riziko | §4 krok 7 — karanténa |
| Nekonformná používateľská šablóna | nevalidný výstup | §3.4 — brána pri uložení |
| Ručne písané tokeny | druhá taxonómia | §5 — generovať z modelu |
| Rozrastanie šablón bez správy | neudržateľnosť | verziovanie a vlastníctvo šablón |

## 7. Navrhované normatívne dôsledky (do `cp-17`)

- **TPL-01** Šablóna určuje formu výstupu, NIKDY nie je miestom uloženia údaja.
  Sekcia šablóny vyberá a zoraďuje položky; položky si nesú svoju FHIR identitu.
- **TPL-02** Šablóna sa pri uložení MUSÍ validovať proti povinnému minimu trhu.
  Nevalidná šablóna sa NESMIE stať aktívnou.
- **TPL-03** Typ dokumentu, šablóna poskytovateľa a pravidlá trhu sú tri nezávislé osi.
  Trh NIKDY nevyberá šablónu; trh určuje minimum a kódové systémy.
- **TPL-04** Anamnestické okruhy patria na pacientsku úroveň a šablóna ich premieta.
  NESMÚ sa ukladať ako súčasť encounteru.
- **INT-01** Výstup OCR a AI extrakcie vzniká ako **kandidát** (`validated=false`),
  atribuovaný agentovi Hilbi IQ, označený ako návrh.
- **INT-02** Nevalidovaný kandidát sa NESMIE dostať do podpísaného dekurzu.
  Validácia je vedomý akt lekára a zaznamenáva sa (`Provenance`, `AuditEvent`).
- **INT-03** Coverage (vyplnené / chýbajúce polia) MUSÍ byť viditeľné pred podpisom.

## 8. Integračný model — Dash a Care Plan

- **Dash je system of record.** Úložisko Care Planu je **odvodené** (projekcia/cache),
  nie rovnocenný zdroj. Invariant: **žiadny klinický fakt nesmie existovať iba
  v Care Plane.** Bez toho neplatí požiadavka „ak Care Plan vypadne, všetko ostáva
  v Dash".
- **Komunikácia výhradne cez API.** Žiadny priamy prístup do cudzej databázy.
  Pravidlá synchronizácie sa dorobia pri integrácii (nadväzuje na `core-12`).
- **Care Plan je integrovaný cez iFrame** — je to *vymeniteľný povrch*, nie závislosť.

Dôsledky, ktoré treba navrhnúť (nie predpokladať):

| Téma | Otázka |
|---|---|
| Autentifikácia cez hranicu | obmedzenia cookies tretích strán; obe aplikácie sú pod `hilbi.com`, mechanizmus treba navrhnúť |
| Kto renderuje šablónový povrch | ak Care Plan vnútri iFrame, potrebuje naše komponenty a tokeny **ako balík** — závisí od `tokens.json` (DTCG) |
| Provenance cez hranicu | akcia v iFrame MUSÍ vytvoriť `Provenance` v Dash; API nesie agenta, rolu a purpose-of-use |
| Verziovanie kontraktu | povrch a API sa vyvíjajú nezávisle — potrebná verzia kontraktu |

## 9. Vstupné body IQ

IQ vstupuje do dekurzu tromi spôsobmi. Všetky podliehajú `INT-01` a `INT-02` —
výstup je **kandidát**, nie záznam.

| Vstup | Popis |
|---|---|
| **Predvyplnenie z opakovanej návštevy** | prenos obsahu z predchádzajúceho encounteru |
| **Doplnenie cez speech-to-note** | prepis hovoreného slova do slotov |
| **Vytvorenie z nahrávky** | celý dekurz zostavený z audia |

### 9.1 Riziko: klonovaná dokumentácia

Prenášanie obsahu z predchádzajúcej návštevy je známy problém klonovanej
dokumentácie — v zázname sa objaví nález, ktorý v danom dni nikto nevykonal.
V USA ide o audit red flag; cez E/M úroveň vedie k nadhodnotenému vykazovaniu.
Keďže výkaz sa **deriviuje z klinických dát** (`cp-15`, BILL), prenesený obsah by
úroveň umelo nafúkol.

Ošetrenie:

- **INT-04** Položka prenesená z predchádzajúceho encounteru MUSÍ byť viditeľne
  označená ako prenesená, MUSÍ sa potvrdzovať **po položkách** (nikdy hromadne)
  a jej `Provenance` MUSÍ niesť zdrojový encounter — nie dnešné pozorovanie.
- **INT-05** Prenesená a nepotvrdená položka sa NESMIE započítať do derivácie výkazu.

### 9.2 Riziko: nahrávka ako osobný údaj

- **INT-06** Nahrávanie konzultácie vyžaduje súhlas pacienta; rozsah a forma súhlasu
  sa riadia trhom.
- **INT-07** MUSÍ byť rozhodnuté, či sa audio po prepise **uchováva alebo zahadzuje**,
  a či je nahrávka súčasťou zdravotnej dokumentácie. Do rozhodnutia sa audio
  neuchováva.

## 10. Sada šablón poskytovateľa

Jedna šablóna neprodukuje dekurz aj žiadanku — tie majú odlišný `slotKey`. Lekár
nahráva **sadu šablón** so spoločným štýlom a názvoslovím sekcií (`provider profile`).
Dekurz a jeho exporty sú tá istá šablóna cez dva renderery (§3.5).

## 11. Otvorené body

- Rozsah domény `core` — ktoré anamnestické okruhy sú v základe a ktoré voliteľné.
- Formát importu poskytovateľskej šablóny (nahratie textu vs. sprievodca).
- Vlastníctvo a verziovanie šablón na úrovni organizácie vs. lekára.
- Či sa kódy vkladajú do textového výstupu predvolene, alebo per šablóna.
- Perzistencia kandidátov pred validáciou a ich retencia, ak lekár nevaliduje.
- Pravidlá synchronizácie Dash ↔ Care Plan a riešenie konfliktov.
- Mechanizmus autentifikácie cez hranicu iFrame.
- Súhlas s nahrávaním a retencia audia (`INT-06`, `INT-07`) — rozhoduje compliance.
- Balíčkovanie šablónového povrchu a tokenov pre spotrebu v Care Plane.

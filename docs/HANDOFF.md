# HAND-OFF — Hilbi Cockpit + Clinical Core (pokračovanie v novom chate)
Dátum: 2026-07-21 · Autor kontextu: Patrik Kmeč (CEO, Hilbi Health Group)

## 0. Ako pokračovať
Skopíruj tento súbor do prvej správy nového chatu. Prototyp aj dokumenty sú v GitHube
(single source), takže nový chat si vie stiahnuť aktuálny stav.

## 1. Prototyp "Kokpit" (lekársky cockpit, jeden HTML súbor)
- Repo: `patrikkmec-ivx/prototype`, súbor `index.html`; dokumenty v `docs/`.
- Live: https://patrikkmec-ivx.github.io/prototype/  (Claude env NEVIE fetchnúť github.io — 403; autoritatívny je obsah repa)
- GitHub token (fine-grained): <TOKEN — NIKDY necommitovať; Patrik dodá čerstvý fine-grained token na začiatku session, po sessione REVOKNÚŤ>
  !!! PO SESSIONE REVOKNÚŤ !!!
- POSLEDNÝ COMMIT prototypu: v110b = 9d862670 (Record Session fixy).
- Commit workflow: urllib GET sha cez GitHub contents API -> PUT nový base64+sha. Changelog v <title>/HTML komentári, každá verzia vNN.
- Sanity pred commitom: python brace balance (baseline -1 = "balanced"), extract <script> do _js.js, `node --check _js.js`.
- i18n: zdroj SK, default EN (setLang('en') na loade cez swapText). I18N pole [SK,EN] párov; prekladá text nody aj [title]/[placeholder]/[aria-label]/[data-tip].

### Čo je v prototype hotové (posledné veci)
- Ľavý nav = hierarchické menu (Home + skupiny Patients/Calendars/Waiting areas/Orders/Payments/Medical Facility), rozbaľovanie, .active highlight (token --nav-active).
- Org switcher (Miami General / FN Trnava / DFN) dropdown.
- Encounter dlaždice: mená lekárov NIE v titulku -> hover tooltip nad avatarom (#avtip floating na body cez delegation). Dátumy zarovnané, collapse chevron pod dátumom.
- LIBRARY komponent .pillbtn (cyan akčný button #6AD5E5/#06343E; POZN: #6AD5E5 = --brand-cyan, treba pri konsolidácii nahradiť token).
- Life ID / PHR panel: 4 taby (PHR/Vitals/Behavioral/Personal), 4 nové komponenty (phr-gauge, phr-range, phr-ring, phr-listrow), 0 nových BE záznamov/tokenov. Panel sa mení šírkou DRAGOM (grip na ľavom okraji), min-collapse !important, pamätá šírku.
- Care plans tab (stredná plocha) dropdown: Care Plan Studio + SM/Dementia/Fabry/Colorectal.
- IQ Record Session (iqrec modal): krok1 capture (meno pacienta, format dropdown SOAP+VÚSCH+Create template[neaktív], QR párovanie 156px, record+pauza/pokračovať+timer+waveform+Stop), krok2 SOAP náhľad štruktúrovaný (ikona+nadpis+editovateľný text per sekcia) -> Sign -> encEvent na časovú os. Fix [hidden]{display:none!important}.

### TOKEN DISCIPLÍNA (dohodnutý kontrakt — dodržiavať pri každej zmene)
1. Reuse existujúci token value-matchingom. 2. Ak nie je zhoda, odvoď z existujúcej škály
(radius {4,8,12,16,20,24}, space {4,8,12,16,24,32,48,64}, typo 12/13/15/17/22, farby brand/accent/semantic).
3. Len ak genuinely nový semantic -> JEDEN token v :root (nie inline), kanonický názov, EXPLICITNE nahlásiť.
- OTVORENÝ TOKEN DLH: pill #6AD5E5 -> --brand-cyan, #06343E -> nový --brand-cyan-ink, org gradienty FN/DF do tokenov. (konsolidačný pass, dohodnuté urobiť neskôr)
- Figma sync dlh: v81-v110 nie sú vo Figme (čaká "finalize" one-pass sync).

### SSOT / Figma rozhodnutia
- Token SSOT = CODE-FIRST (tokens.json DTCG + Style Dictionary) EXPORTUJE do Figma Variables + CSS. Figma = konzument, nie vlastník.
- Figma component library = SAMOSTATNÝ nový file "Hilbi Design System" (nie v produktovom "Dashboard face lift 2026"). Komponenty pomenované rovnako ako v kóde. Jeden file zatiaľ (bez Foundations/Components split).

## 2. NORMATÍVNY ŠTANDARD — Clinical Core (hlavná strategická línia)
Rozhodnutie: povýšiť SM+ dekurz engine z domény na PLATFORMOVÝ, FHIR-natívny core EHR.
SM sa stane mikroslužbou čo si vymieňa dáta s core cez FHIR.

- `docs/core-01-tech-clinical-core-standard.md` — NORMATIVE draft v0.9 (commit 298d78c5).
  Kľúč: A FHIR R4 store = clinical truth; dvojvrstvový model (resources=pravda, dokumenty=Composition rendery);
  doménovo-agnostický core + domény ako DATA packy; producer equivalence (manual/OCR/speech/device/import/IQ) cez Provenance;
  B2 kanonická FHIR mapovacia tabuľka; C write kontrakt + AI review gate; D template stack = čisté dáta
  (PlanDefinition/StructureDefinition/Library/StructureMap), pipeline GitHub->CI->FHIR->core; G region packs (US Core/EHDS/ABDM) bez forku modelu; H governance; I migrácia SM+.
  5 open items (O1 store voľba-Juraj, O2 retencia-Marek, O3 CP amendment, O4 SNOMED/CPT licencie, O5 sm_* migrácia-Viktor).
- `docs/core-02-tech-clinical-core-flow.mermaid` — informatívny diagram (commit 6654f9ca).

### 3 nezávislé audity (US/EU/IN) + konsolidácia — HOTOVÉ, commitnuté
- `docs/core-03-audit-us.md` (49cc63a2): 10 nálezov, 2 Critical — SMART on FHIR patient access chýba (information blocking), kvarantína preliminary vs info blocking. + NCPDP eRx, US Core notes ako DocumentReference, 42 CFR Part 2, identity/MPI.
- `docs/core-04-audit-eu.md` (26aed56f): 10 nálezov, 3 Critical — "EU pack" musí byť rodina národných sub-packov (gematik/ISiK, ezdravie), GDPR Art.17 erasure vs immutable store nedizajnované, eIDAS/QES podpis chýba. + EHDS manufacturer/EEHRxF, AI Act/MDR klasifikácia IQ.
- `docs/core-05-audit-in.md` (169715b7): 10 nálezov, 2 Critical — ABDM = HIP/HIU rolová architektúra s Consent Managerom (nie REST adapter), DPDP consent lifecycle first-class. + ABDM record types->D4, offline-first rezilencia, NHCX claims.
- `docs/core-06-audit-consolidation.md` (6df15de9): 7 Critical spolu, žiadny nespochybňuje jadro.
  KONVERGENTNÉ diery (vstup do core-01 v0.10, všetky additive cez K35):
  1) consent lifecycle, 2) identity/matching, 3) signature model (eIDAS/QES),
  4) erasure vs immutable (JEDINÝ v1.0 gate = EU-02), 5) region pack > terminológia,
  6) notes dual-expose (Composition aj DocumentReference), 7) offline resilience.

## 2b. STAV PO SESSION 2026-07-21 (audit → v0.10 → packy)
- core-01 v0.10 COMMITNUTÉ (f697ec0e): 7 konvergentných klauzúl z core-06 + A6 deployment
  modes (companion/primary). Nové klauzuly: A6, B4+ (preliminary SLA hook), B5 (identity),
  C6 (podpis eIDAS/QES), C7 (offline), D6 (dual-expose), G1+ (role/exchange mikroslužby),
  G3 (pack composition + EU národné sub-packy), H2+ (read/export audit = EHDS logging +
  HIPAA accounting), H5 (consent lifecycle), H6 (erasure — ZATVÁRA EU-02, jediný v1.0 gate).
  E-CONF-06..08, open items O6-O9, changelog na konci.
- REGION PACK SCOPES commitnuté: core-07-pack-us.md (8e364990), core-08-pack-eu.md
  (862dfd5a), core-09-pack-in.md (bc6f9946) — každý = zoznam BE mikroslužieb + G3 parametre
  + findings closure mapa. US=companion (ŽIADNA ONC certifikácia), EU=base+sub-packy
  (SK ezdravie / DE ISiK), IN=primary (ABDM HIP+HIU, DPDP/SDF, offline povinný).
- core-02 mermaid v2 (360a1da6): módy, pack mikroslužby, D6/H5/H6 pravidlá.
- core-10-executive-summary.md (7fc45178): 1-pager pre Romana+Mareka — 4 schvaľovacie body.
- .docx cirkulačný balík (exec summary + core-01 v0.10) odovzdaný Patrikovi v chate;
  kanonický je .md v repe. POZOR: /mnt/project/hilbi-template-vseobecny.docx v project
  knowledge je len TEXTOVÁ extrakcia — docx generovať pandoc + python-docx.

## 3. ĎALŠÍ KROK
0. HOTOVÉ 2026-07-22: core-01 v1.0 ACTIVE (Roman+Marek sign-off) · core-11 v0.2 (panel,
   fixné foldre, M-O2 closed) · core-12 sync štandard · D7 template governance.
1. Prototyp HTML: 6 rozpracovaných desktop/nav zmien + premietnutie MAP pravidiel
   (pathway click-through MAP-01, milestone flag S3).
2. Dev plán mikroslužieb z core-07/08/09 (Dominika rozdelí, Viktor vedie) — gsr-08 tracker.
3. Mapovací dokument: Care Plans doména (E2) + patient pathway z kokpitu (F1) → Core.
4. Otvorené: O1 store (Juraj), O2/O6 retencia + O7 podpisy + O8 MDR/IQ (Marek),
   O5 sm_* migrácia (Viktor), O9 módy (Roman).

## 4. Kľúčoví ľudia / reťazec
Patrik navrhuje -> Roman (CBO) schvaľuje -> Dominika (PM) aplikuje -> Marek (compliance) kontroluje -> Juraj (platform) supportuje. Viktor (dev lead, GitLab->GitHub migr.). Julia (marketing).

## 5. Referenčné súbory v projekte (/mnt/project/)
- cp-01-tech-standard.md (Care Plans normatív — konvencie frontmatteru/keyword strength)
- DEKURZ-FLOW.md (SM+ dekurz engine reference — základ pre generalizáciu)
- hilbi-template-vseobecny.docx (Hilbi docx šablóna)
- 03_02_Platform_Technical_Specification_v2-5 (tech spec)

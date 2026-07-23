# HAND-OFF — kde sme a čo je ďalej

> **Autorita: INFORMATIVE.** Stav rozpracovanej práce. Záväzné sú `cp-17` a `cp-15`;
> ako sa v repozitári správať určuje `CLAUDE.md`; čo je čo určuje `README.md`.
> **Aktualizuje sa na konci každej relácie.**

Aktualizované: 2026-07-23 · Verzia prototypu: **v131** (`1f116414`)

---

## 1. Štart novej relácie

1. Prečítaj `README.md` → `CLAUDE.md` → `docs/cp-17-…` → `docs/DEV-SUMMARY.md`.
2. Stiahni aktuálny `index.html` z `main` (autoritatívny je obsah repa; GitHub Pages nie).
3. Na zápis potrebuješ **čerstvý fine-grained token** — Patrik ho dodá na začiatku relácie.
   Rozsah: repozitár `prototype`, oprávnenie **Contents: Read and write**.
   **Po relácii token revoknúť.** Token nikdy nepatrí do repozitára.
4. Sanity pred každým commitom: brace balance **baseline `-1`** + `node --check` na
   extrahovanom `<script>`.

## 2. Čo sa uzavrelo naposledy (v126–v129)

Konformančný cyklus pre report vrstvu — sedem oblastí z regionálneho review
(US / EÚ / India). Rozhodnutia sú zapísané normatívne v `cp-17`, implementácia je
v `index.html`, mapa pravidlo → kód je v `docs/DEV-SUMMARY.md` §4.

| Oblasť | Stav |
|---|---|
| Dokumentové profily per trh | hotové |
| Terminológia (dual coding) | štruktúra hotová, **capture-side chýba** |
| Podpisová úroveň per trh | deklarovaná, integrácia chýba |
| Amendment / addendum | hotové (bez dôvodu opravy) |
| Provenance + AuditEvent | hotové (log len v pamäti) |
| Súhlas pri zdieľaní | deklarovaný, dialóg chýba |
| AI transparentnosť (DSI) | hotové (bez verzovania logiky) |

Plus: rola systému **overlay** (default) vs **core** (opt-in) je zapísaná normatívne —
v súlade s A1 Care Plans Standardu.

Presný zoznam nezhôd voči norme je **`cp-17` §10**. Ten je zdroj pravdy o tom, čo je
hotové a čo je placeholder — nie tento súbor.

## 3. Plán fáz

| Fáza | Obsah | Stav |
|---|---|---|
| 1 | SSOT dokumentácia — `cp-17`, `cp-18`, `README`, `CLAUDE.md`, `DEV-SUMMARY` | **hotová** |
| 2 | Traceability matica: normatívne ID → obrazovka/komponent | hrubá verzia v `DEV-SUMMARY` §4; plná chýba |
| 3a | Šablónový povrch — picker, coverage, dva renderery (v131) | **hotová** |
| 3b | **Rozhranie správy šablón** — zoznam, editor sekcií, validácia proti minimu (TPL-02) | **ďalšia na rade** |
| 3c | Rozhranie dekurzu — intake, kandidáti, validácia (INT-01..05) | čaká |
| 3d | Anamnestické okruhy na pacientskej úrovni (TPL-04) | čaká |
| 4 | UX podpis, amendment s dôvodom, súhlasový dialóg | čaká |
| 5 | Audit a verzie ako systémová plocha (nie len v reporte) | čaká |
| 6 | Kokpit cieľový layout — Life ID panel, taby, dekurz modal, IQ widget | čaká |
| 7 | i18n, tokeny, mobil pass | čaká |

**Fáza 3 je architektonicky najdôležitejšia.** Dnes sa kód odvodzuje regexom až pri
renderi (`codeOf` sa volá len v `renderOut`). To je obrátene — kód patrí do udalosti,
lebo udalosti sú SSOT. Fáza 3 mení dátový model udalosti (pribudne `coding[]`), preto
sa dotýka `cp-16` a musí sa premietnuť do `cp-17` §10 v tom istom commite.

## 4. Otvorené body mimo kódu

- **Marek (compliance):** hranica návrh vs. rozhodnutie pri Hilbi IQ (MDR) · podpisová
  úroveň per trh · retencia auditu · rozsah EHDS CE režimu pri prechode do módu `core` ·
  India CERT-In.
- **Registrácia použitia SNOMED CT** u NCZI. Slovensko je členom SNOMED International
  (NCZI = národné release centrum), použitie v členskej krajine je bez licenčného poplatku.
- **Výber terminologického servera** pre `$expand` / `$validate-code` — blokuje Fázu 3
  v produkčnej podobe (v prototype stačí demo ValueSet, ale UI vzor musí byť správny).
- **Návrh perzistentného, tamper-evident audit logu** (`AUD-02`).
- **`doc_id`** priradenie pre `cp-17` a `cp-18` podľa `gsr-13`.

## 5. Overené, neoverené

- Overené staticky: brace balance, `node --check`, smoke test kódového resolvera,
  mermaid parser.
- **Neoverené vizuálne:** vykreslenie kódových chipov, audit panelu a DSI boxu
  v prehliadači. Odporúča sa vizuálna kontrola pred ďalšou iteráciou.

## 6. Staršie, mimo report vrstvy

- Figma sync tokenov v81 → v129+: token SSOT code-first (`tokens.json` DTCG +
  Style Dictionary) → Figma Variables; nový súbor „Hilbi Design System".
  Kľúče: DS '26 `ombR6X345rSPGaJPfnye7e`, Marketplace `QWv1xbC62cOhiy0MYlgVts`.
- Otvorený dlh tokenov: pill `#6AD5E5` → `--brand-cyan`, `#06343E` → nový
  `--brand-cyan-ink`, organizačné gradienty do tokenov.
- Sub-špecializácie lekárov: keď budú dáta na odlíšenie viacerých lekárov na rovnakom
  oddelení, doplniť do `SPECBY` — prejde všade naraz (dropdown, pill, tooltip).

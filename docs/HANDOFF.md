# HAND-OFF — kde sme a čo je ďalej

> **Autorita: INFORMATIVE.** Stav rozpracovanej práce. Záväzné sú `cp-17` a `cp-15`;
> ako sa v repozitári správať určuje `CLAUDE.md`; čo je čo určuje `README.md`.
> **Aktualizuje sa na konci každej relácie.**

Aktualizované: 2026-07-23 · Verzia prototypu: **v153** (`fe64b943`)

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
| 3b | Rozhranie správy šablón — zoznam, editor sekcií, validácia TPL-02 (v132); vstup z profilového menu (v134) | **hotová** |
| 3b+ | Šablóny: register, editor, náhľad, extrakcia zo vzorky, hlavička organizácie, anamnéza, súhlas, okruhy vlastníctva (v136–v139) | **hotová** |
| 3c1 | Šablóny ako podstránka, dizajn systém (tlačidlá, polia, taby, rozostupy) — v140–v147 | **hotová** |
| 3c2 | Zmrazenie obsahu pri podpise — snímka + odtlačok (AMD-05..09), v148 | **hotová** |
| 3c3 | Jazyková vrstva — neutrálne kľúče, jazyk dokumentu, súhlas per jazyk, preklad na vyžiadanie (I18N-01..15), v149 | **hotová** |
| 3c4 | Šablóna **FNTT SM** podľa reálnej ambulantnej správy + zdroje ako podmnožiny slotov (TPL-17, TPL-18), v152 | **hotová** |
| 3d | **Rozhranie dekurzu** — intake, kandidáti z IQ, validácia po položkách (INT-01..05) | **ďalšia na rade** |
| 3d | Anamnestické okruhy na pacientskej úrovni (TPL-04) | čaká |
| 4 | UX podpis, amendment s dôvodom, súhlasový dialóg | čaká |
| 5 | Audit a verzie ako systémová plocha (nie len v reporte) | čaká |
| 6 | Kokpit cieľový layout — Life ID panel, taby, dekurz modal, IQ widget | čaká |
| 7 | i18n, tokeny, mobil pass | čaká |

**Fáza 3 je architektonicky najdôležitejšia.** Dnes sa kód odvodzuje regexom až pri
renderi (`codeOf` sa volá len v `renderOut`). To je obrátene — kód patrí do udalosti,
lebo udalosti sú SSOT. Fáza 3 mení dátový model udalosti (pribudne `coding[]`), preto
sa dotýka `cp-16` a musí sa premietnuť do `cp-17` §10 v tom istom commite.

## 3b. Čo z jazykovej vrstvy ešte chýba

- Systémové šablóny sú lokalizované len čiastočne (`I18N-04`).
- Taxonómia sa zatiaľ neprekladá cez **zobrazovací termín kódu** (`I18N-05`) — dnes
  cez `SRC_DISP`; produkčne má čerpať z terminologického servera.
- Cudzie dokumenty na časovej osi (`I18N-10`), jazyk tlače (`I18N-13`) a locale
  formátovanie čísel a dátumov (`I18N-14`) zatiaľ neriešené.
- Jazyk pacienta ako samostatná os (riadi súhlasy a pacientske listy).

## 3c. Poskytovateľské šablóny

Prvá reálna šablóna je **FNTT SM** (okruh `provider`), adaptovaná z ambulantnej správy
Neurologickej kliniky — Centrum SM. Sekcie: TO · Obj. · HK/DK · Laboratórne a likvorové
vyšetrenia · Záver · Dop. · Recepty · Diagnózy · Vyhlásenie pacienta.

Pri adaptácii sa preberá **iba štruktúra** (`TPL-08`) — klinické hodnoty, identita
pacienta ani cudzie právne texty sa nekopírujú; demo dáta a znenie súhlasu sú vlastné.

Ďalšie poskytovateľské šablóny sa pridávajú rovnako: rozpoznať sekcie → namapovať na
zdroje (v prípade potreby doplniť nový zdroj podľa `TPL-17`) → overiť minimum trhu →
zabezpečiť znenie súhlasu v jazyku dokumentu → **vybrať podpisovateľov** (`TPL-19`).

Hlavička, pätka a podpisovatelia sa editujú v **nastaveniach zariadenia**, nie v šablóne;
z editora šablóny tam vedie odkaz.

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

## 4b. Poučenie z incidentu v148

Commit **v148 ticho prepísal v145–v147**: prostredie sa reštartovalo, lokálny
`index.html` sa vrátil do staršieho stavu a nebol znovu stiahnutý z `main`. Tri
následné commity sa aplikovali na starý súbor a odstránili podstránku šablón.
Obnovené vo **v151**.

Preto platí: **pred úpravami over zhodu lokálneho súboru s `main`** a opakuj to po
každom náznaku reštartu (napr. keď zmizne obsah `/tmp`). Pravidlo je v `CLAUDE.md` §4.

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

# Hilbi Cockpit — štart relácie

> Vlož tento text do prvej správy nového chatu. **Je zámerne krátky** — všetko podstatné
> je v repozitári. Duplikovať sem obsah by vytvorilo druhý zdroj pravdy.

**Repo:** `patrikkmec-ivx/prototype` · **Live:** https://patrikkmec-ivx.github.io/prototype/
**Verzia:** v161 · **Uzávierka:** 2026-07-23

---

## 1. Prvé tri kroky

1. **Prečítaj v tomto poradí:**
   `README.md` → `CLAUDE.md` → `docs/HANDOFF.md` → `docs/cp-17-…` → `docs/DEV-SUMMARY.md`
2. **Stiahni `index.html` z `main`** a over, že sa zhoduje s tým, čo máš lokálne.
3. **Na zápis potrebuješ čerstvý fine-grained token** (Patrik ho dodá):
   repozitár `prototype`, oprávnenie **Contents: Read and write**. Po relácii revoknúť.

## 2. Čo je záväzné

| Súbor | Autorita |
|---|---|
| `docs/cp-17-tech-report-conformance-standard.md` | **NORMATIVE** — report, terminológia, podpis, provenance, šablóny, jazyk, identita dokumentu, úložisko |
| `docs/cp-15-…`, `core-01-…`, `core-11/12` | **NORMATIVE** — záznamový model, klinické jadro |
| `CLAUDE.md` | **BEHAVIORAL** — ako pracovať v repe |
| `index.html` | implementácia, **nikdy nie norma** |

Pri konflikte vyhráva `cp-17`. Čo je hotové a čo placeholder: **`cp-17` §16**.

## 3. Sanity brány — všetkých sedem pred každým commitom

1. brace balance — **baseline `-1`**, nie `0`
2. `node --check` na extrahovanom `<script>`
3. **handlery** — každý `onclick`/`onchange`/`oninput` má definíciu
4. **poradie CSS** — media query nesmie byť prebitý neskorším základným pravidlom
5. **tokeny** — žiadna hex farba mimo `:root`, ktorá už má token
6. **preklady** — každý reťazec v `tt()` aj statický popisok má pár v `I18N`
7. **kľúče zdrojov** — konzistentné naprieč šiestimi registrami

Skripty sa v prostredí nezachovajú — napíš ich znova podľa `CLAUDE.md` §4.

## 4. Štyri veci, ktoré nie sú zrejmé a dnes zabolelo

- **Over zhodu s `main` po každom náznaku reštartu prostredia.** Ak zmizne obsah `/tmp`,
  mohol sa vrátiť aj `index.html`. Editovanie zastaraného súboru **ticho vráti späť
  predchádzajúce commity** — stalo sa vo v148, opravené až vo v151.
- **Každá textová náhrada musí mať assert a skript zapisuje až na konci.** Náhrada,
  ktorá nenájde kotvu, prebehne naprázdno a bez chyby. Kotvu ber z práve prečítaného
  súboru — rozdiel jednej medzery stačí.
- **Pred novou CSS triedou over, či názov neexistuje.** Jeden menný priestor;
  kolízia ticho prepíše nesúvisiacu časť rozhrania (stalo sa s `.card`).
- **Sanity brány nezachytia vizuálne chyby.** Nedostupné tlačidlo (v133) aj zalomený
  náhľad (v147) prešli všetkými bránami. **Väčšina UI od v126 nebola videná v prehliadači.**

## 5. Kde sme

Šablónová vrstva, conformance vrstva a predpoklady tvorby dokumentov sú hotové:
report shell · dual coding · provenance a audit · DSI · šablóny ako podstránka
(tri okruhy vlastníctva, editor so živým náhľadom, extrakcia zo vzorky, hlavička
a podpisy zariadenia, súhlasy) · zmrazenie obsahu pri podpise · jazyková vrstva ·
identita dokumentu · jeden dokument v dvoch pohľadoch · perzistenčný seam.

**Ďalší krok: tvorba dokumentov** — rozpis v `docs/HANDOFF.md` §3e.
Potom **rozhranie dekurzu** (`INT-01..05`): IQ intake, kandidáti z OCR, validácia
po položkách, označenie prenesených položiek.

## 6. Mimo kódu

- **Marek (compliance):** MDR hranica pre IQ · podpisová úroveň per trh · retencia
  auditu · EHDS CE režim pri prechode do módu `core` · India CERT-In · kedy stačí
  strojový preklad
- **Registrácia použitia SNOMED CT** u NCZI
- **Figma:** `tokens.json` → Style Dictionary → Figma Variables (DS '26
  `ombR6X345rSPGaJPfnye7e`). Smer je **kód → tokeny → Figma**; komponenty idú opačne
  (Figma je ich zdroj).

---

*Komunikácia: slovensky, priamo, plain language. Blokery na začiatku, nie na konci.
Stručné potvrdenie lepšie než rozvíjanie.*

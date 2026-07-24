# Hilbi Cockpit — štart relácie

> Vlož tento text do prvej správy nového chatu. **Je zámerne krátky** — všetka hĺbka
> je v repozitári. Duplikovať sem obsah by vytvorilo druhý zdroj pravdy.

**Repo:** `patrikkmec-ivx/prototype` · **Live:** https://patrikkmec-ivx.github.io/prototype/
**Verzia:** v163 · **Stav:** overený audit, pripravené na odovzdanie · 2026-07-23

---

## 1. Prvé tri kroky

1. **Prečítaj v tomto poradí:**
   `README.md` → `CLAUDE.md` → `docs/HANDOFF.md` → `docs/cp-17-…` → `docs/DEV-SUMMARY.md`
2. **Stiahni `index.html` z `main`** a over, že sa zhoduje s tým, čo máš lokálne.
   **Bez tokenu je GitHub API rate-limited (403)** — na čítanie použi
   `https://raw.githubusercontent.com/patrikkmec-ivx/prototype/main/<súbor>`,
   ten funguje bez autentifikácie.
3. **Na zápis potrebuješ čerstvý fine-grained token** (Patrik ho dodá):
   repozitár `prototype`, oprávnenie **Contents: Read and write**. Po relácii revoknúť.

## 2. Čo je záväzné

| Súbor | Autorita | Obsah |
|---|---|---|
| `docs/cp-17-…` | **NORMATIVE** | 93 pravidiel: report, terminológia, podpis, provenance, šablóny, súhlas, jazyk, úložisko, identita dokumentu |
| `docs/cp-15-…`, `core-01`, `core-11`, `core-12` | **NORMATIVE** | záznamový model, klinické jadro, mapovanie, synchronizácia |
| `CLAUDE.md` | **BEHAVIORAL** | ako pracovať v repe — brány, vzory rozhrania, commit workflow |
| `index.html` | — | implementácia, **nikdy nie norma** |

Pri konflikte vyhráva `cp-17`. **Čo je hotové a čo placeholder: `cp-17` §16.**

## 3. Sanity brány — všetkých deväť pred každým commitom

1. brace balance — **baseline `-1`**, nie `0`
2. `node --check` na extrahovanom `<script>`
3. **handlery** — každý `onclick`/`onchange`/`oninput` má definíciu
4. **poradie CSS** — media query nesmie byť prebitý neskorším základným pravidlom
5. **nedefinované tokeny** — každý `var(--x)` má definíciu, aj ten s fallbackom
6. **drift tokenov** — žiadna hex farba mimo `:root`, ktorá už má token
7. **úplnosť prekladov** — každý reťazec v `tt()` aj statický popisok má pár
8. **konfliktné preklady** — žiadny SK kľúč nemá dva rôzne EN preklady
9. **kľúče zdrojov** — konzistentné naprieč šiestimi registrami

Skripty sa v prostredí nezachovajú — napíš ich znova podľa `CLAUDE.md` §4.

## 4. Päť vecí, ktoré nie sú zrejmé a už raz zabolelo

- **Over zhodu s `main` po každom náznaku reštartu prostredia.** Ak zmizne obsah
  `/tmp`, mohol sa vrátiť aj `index.html`. Editovanie zastaraného súboru **ticho
  vráti späť predchádzajúce commity** — stalo sa vo v148, opravené až vo v151.
- **Každá textová náhrada musí mať assert a skript zapisuje až na konci.** Náhrada,
  ktorá nenájde kotvu, prebehne naprázdno a bez chyby. Kotvu ber z práve prečítaného
  súboru — rozdiel jednej medzery stačí (`--phrw:280px}` vs `--phrw:280px }`).
- **Pred novou CSS triedou over, či názov neexistuje.** Jeden menný priestor;
  kolízia ticho prepíše nesúvisiacu časť rozhrania (stalo sa s `.card`).
- **`new Map(I18N)` berie posledný záznam**, a nové páry sa pridávajú na začiatok.
  Duplicitný SK kľúč teda ticho prehrá a prechod EN→SK→EN poškodí text. Bráni tomu brána 8.
- **Brány nezachytia vizuálne chyby.** Nedostupné tlačidlo (v133) aj zalomený náhľad
  (v147) prešli všetkými. **Väčšina UI od v126 nebola videná v prehliadači.**

## 5. Overený stav pri odovzdaní (v163)

Deväť brán prechádza · **mŕtvy kód nula** · 4 730 riadkov · 220 funkcií ·
98 tokenov v `:root` (drift nula, žiadny nedefinovaný `var()`) · 699 položiek `I18N`
(0 duplicít, 0 konfliktov) · 89 handlerov · polia bez popisu nula.

**Integrita dokumentácie overená:** 173 normatívnych ID bez visiaceho odkazu ·
všetkých 52 symbolov z mapy `DEV-SUMMARY` §4 existuje v kóde · žiadny neplatný
odkaz na súbor · `README` index pokrýva všetkých 25 súborov v repe.

**Známy a zdôvodnený dlh:** `docs/HANDOFF.md` §4d — osirelé CSS triedy, rozostupy
mimo škály v pôvodných komponentoch, pamäťové úložisko, nejednoznačnosť EN→SK.
**Nič z toho nie je chyba na opravu naslepo.**

## 6. Kde sme

Hotové: report shell · dual coding (SNOMED záznam / klasifikácia trhu výkaz) ·
provenance a audit · transparentnosť AI · šablóny ako podstránka (tri okruhy
vlastníctva, editor so živým náhľadom, extrakcia zo vzorky, hlavička a podpisy
zariadenia, súhlasy per jazyk) · zmrazenie obsahu pri podpise · jazyková vrstva ·
identita dokumentu · jeden dokument v dvoch pohľadoch · perzistenčný seam.

**Ďalší krok: tvorba dokumentov** — šesťbodový rozpis v `docs/HANDOFF.md` §3e.
Odporúčané rozdelenie na tri commity: *výber typu a šablóny* → *naplnenie a coverage*
→ *podpis a výstup vrátane tlačovej vrstvy* (`I18N-13`, zatiaľ neexistuje).

Potom **rozhranie dekurzu** (`INT-01..05`): IQ intake, kandidáti z OCR ako
`validated=false`, validácia po položkách, označenie prenesených položiek
z predchádzajúcej návštevy (klonovaná dokumentácia).

## 7. Otvorené rozhodnutia

- **Vstupný bod tvorby dokumentu** — dock, hlavička detailu pacienta, alebo oboje?
  Štrukturálna zmena, treba rozhodnúť pred implementáciou.
- **Vizuálna kontrola prototypu** — pozri §4, posledná odrážka.

## 8. Mimo kódu

- **Marek (compliance):** MDR hranica pre IQ · podpisová úroveň per trh · retencia
  auditu · EHDS CE režim pri prechode do módu `core` · India CERT-In · kedy stačí
  strojový preklad a kedy treba ľudské overenie
- **Registrácia použitia SNOMED CT** u NCZI (Slovensko je člen, použitie sa registruje)
- **Figma:** `tokens.json` → Style Dictionary → Figma Variables (DS '26
  `ombR6X345rSPGaJPfnye7e`). Smer je **kód → tokeny → Figma**; komponenty idú opačne
  — Figma je ich zdroj, kód sa opravuje podľa nej.

---

*Komunikácia: slovensky, priamo, plain language. Blokery na začiatku, nie na konci.
Stručné potvrdenie lepšie než rozvíjanie. Štrukturálne zmeny sa neschvaľujú sami —
pýtaj sa pred, nie po.*

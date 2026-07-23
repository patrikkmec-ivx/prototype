# CLAUDE.md — operačný kontrakt pre AI nástroje

> **Autorita: BEHAVIORAL.** Tento súbor riadi, *ako* sa AI nástroj v tomto repozitári správa.
> Nedefinuje vecnú podstatu — v každej vecnej otázke ustupuje `cp-17`, `cp-15` a `core-01`.
> Poradie čítania a precedenciu určuje `README.md`.

---

## 1. Čo tento repozitár je

Prototyp lekárskeho kokpitu Hilbi (`index.html`, jeden súbor: HTML + `<style>` + `<script>`,
bez závislostí, demo dáta) a klinické špecifikácie v `docs/`.

**Hilbi je orchestrátor, nie system of record.** Predvolená rola je `overlay` nad existujúcim
systémom poskytovateľa. Toto nie je detail — určuje to, čo smie systém tvrdiť o svojich výstupoch.

## 2. Tvrdé pravidlá

- **Prototyp nikdy nedefinuje normu.** Ak sa kód rozchádza so specom, oprav kód. Ak je spec
  zlý, oprav spec **samostatnou zmenou** a povedz to nahlas — nikdy to nerieš tichou úpravou kódu.
- **Nikdy necommituj token, kľúč ani reálne údaje pacienta.** Demo dáta sú vždy vymyslené.
- **Nikdy nevydávaj prototypový stav za splnenú normu.** Placeholder pomenuj placeholderom.
  Zoznam vedomých nezhôd je `cp-17` §10 — pri zmene ho **aktualizuj v tom istom commite**.
- **Auto-dokumentácia.** Zmena, ktorá mení normatívne správanie, sa nesmie commitnúť bez
  aktualizácie príslušnej dokumentácie **v tom istom kroku**. Čo nie je zdokumentované,
  neexistuje.

  Po každom významnom kroku sa aktualizuje **celá sada**, aby existoval jeden SSOT:

  | Dokument | Čo sa v ňom mení |
  |---|---|
  | `docs/cp-17-…` | nové alebo zmenené normatívne pravidlo **a** §14 stav prototypu |
  | `docs/DEV-SUMMARY.md` | §4 mapa pravidlo → kód, §5 čo musí nahradiť produkcia |
  | `docs/HANDOFF.md` | verzia prototypu, stav fáz, otvorené body |
  | `README.md` | verzia, index súborov, konformita v jednej vete |
  | `CLAUDE.md` | nový vzor rozhrania, nová sanity brána, nové „nesmie zregresovať" |
  | `index.html` | changelog `vNN` s odkazom na normatívne ID |

  Rozpor medzi ktorýmikoľvek dvoma z nich je chyba, nie detail.
- **Jeden zdroj pravdy v kóde.** Pred pridaním novej mapy alebo konštanty over, či už
  neexistuje. Zavedené jednotné zdroje: `SPECBY` + `specOf` (špecializácie lekárov),
  `MKT` (pravidlá trhu), `reportShell` (chrome reportu), `TERM_BIND` + `CODEMAP` (kódovanie),
  `I18N` (preklady). Duplikácia taxonómie je opakovaný zdroj konfliktov.

## 3. Čo nesmie zregresovať

Nasledujúce je implementácia normy, nie kozmetika. Pri refaktoringu sa to musí zachovať:

| Pravidlo | Implementácia |
|---|---|
| `REP-06` jednotný shell | `reportShell()` — hlavička/telo/pätka **raz**, žiadne duplikované chrome |
| `REP-07` identita z kontextu | `RPT_ID`, `rptIdLine()` — nikdy natvrdo zapísané meno alebo ID |
| `REP-01`, `REP-05` rola systému | `RPT_MODE`, `rptModeNote()` — mód musí byť viditeľný |
| `TERM-02`, `TERM-03` dual coding | `codeChips()` — kód **vedľa** naratívu, nikdy namiesto neho |
| `TERM-07` konfigurácia per trh | `MKT` — nikdy `if (market === …)` vetvenie v logike |
| `TERM-08` priznaná medzera | chip `.cd.none` — nekódovaná položka sa nikdy nepreskočí ticho |
| `AMD-01..03` amendment | `RPT_VERS`, `rptStatus()` — originál sa zachováva |
| `PROV-*`, `AUD-*` | `logProv()`, `logAudit()` — hooky na každej akcii |
| `DSI-01..04` | `DSI`, `dsiHTML()` — každý AI návrh deklaruje logiku |
| `CNS-05` | `rptShare()` — zdieľanie len po podpise |
| `AMD-05..09` zmrazenie | `rptSnapshot()` — podpísaná verzia sa **nikdy** neskladá zo živých dát |
| `I18N-01`, `I18N-06` | `TPL_SRC` neutrálne kľúče + `SRC_DISP` — skratka je zobrazenie, nie kľúč |
| `I18N-02` | `srcAbbr()` vs `srcName()` — jazyk dokumentu a jazyk rozhrania sa **nesmú** zlúčiť |
| `I18N-08` | `trBarHTML()` — preklad je čítacia pomôcka s upozornením, nikdy tichá náhrada |
| `I18N-11` | `cnsPick()` — chýbajúce znenie súhlasu sa prizná, nenahrádza sa prekladom |
| `TPL-17` | `ENC_SRC` — dve sekcie na tom istom zdroji nesmú duplikovať obsah |

### Pridanie zdroja sekcie

Nový zdroj sa musí doplniť do **šiestich** registrov naraz, inak vzniknú tiché medzery:
`TPL_SRC` (ponuka), `SRC_COVERS` (validácia minima), `TERM_BIND` (kódovanie),
`SRC_STYLE` (hierarchia), `SRC_DISP` (zobrazenie per jazyk) a resolver v `rptSource()`.
Kontrolný skript konzistencie kľúčov to overí.

## 4. Commit workflow

1. **Stiahni aktuálny `index.html` z `main`** (autoritatívny je obsah repa, nie GitHub Pages)
   a **over, že lokálny súbor sa s ním zhoduje** — veľkosťou aj kontrolou kľúčových značiek
   poslednej zmeny. Prostredie sa môže reštartovať a vrátiť lokálny súbor do staršieho stavu;
   editovanie takého súboru **ticho vráti späť predchádzajúce commity**.
   Signálom reštartu je čokoľvek, čo zmizlo z `/tmp` alebo `/home/claude`.
   Overenie sa opakuje **po každom náznaku reštartu**, nielen na začiatku relácie.
2. Uprav lokálne.
3. **Pred zavedením novej CSS triedy over, či názov už neexistuje.** Prototyp je jeden
   súbor so spoločným menným priestorom; nová trieda s existujúcim názvom ticho prepíše
   nesúvisiacu časť rozhrania (stalo sa s `.card`).
4. **Sanity brány — všetky musia prejsť:**
   - brace balance: `t.count('{') - t.count('}')` — **baseline je `-1`**, nie `0`
   - extrahuj `<script>` do `_js.js` a spusti `node --check _js.js`
   - **kontrola handlerov**: vytiahni všetky `onclick` / `onchange` / `oninput`
     z HTML aj zo šablónových reťazcov v JS a over, že každý má definíciu.
     Syntaktická kontrola toto NEODHALÍ — tlačidlo volajúce neexistujúcu funkciu
     je platný JavaScript. Rovnako neodhalí prvok, ktorý je v DOM nedosiahnuteľný.
   - **kontrola prekladov**: každý reťazec v `tt('…')` musí mať pár v `I18N`.
     `tt()` bez páru vráti **slovenský originál**, takže v anglickom rozhraní
     ticho presakuje slovenčina. Syntaktická kontrola to neodhalí.
   - **kontrola poradia CSS**: pre každé pravidlo v `@media` over, že rovnaký
     selektor nemá základné pravidlo **až za ním** — inak ho prebije a media query
     nikdy nezaberie. Porovnávaj **celé selektory** (`.a .b` nie je `.b`) a media
     bloky parsuj párovaním zátvoriek, nie regexom po prvú `}`.
5. **Každý `str_replace` a textová náhrada musí byť overená assertom.** Náhrada, ktorá
   nenájde kotvu, prebehne **naprázdno a bez chyby**. Skript, ktorý mení súbor,
   má **zapisovať až na konci** — potom assert v strede zabráni čiastočnej zmene.
   Kotvu ber z **práve prečítaného súboru**, nie z pamäte: rozdiel jednej medzery
   (`--phrw:280px}` vs `--phrw:280px }`) stačí na tiché zlyhanie.
6. Commitni cez GitHub contents API (GET sha → PUT base64 + sha).
7. Verzia `vNN` v changelogu; správa commitu vecne popisuje zmenu a odkazuje na normatívne ID.

Mermaid diagramy validuj parserom (`mermaid.parse` s jsdom) — `mmdc` potrebuje Chrome,
ktorý v prostredí nemusí byť.

## 5. Disciplína dizajnových tokenov

1. Znovupouži existujúci token zhodou hodnoty.
2. Ak zhoda nie je, odvoď z existujúcej škály (radius {4,8,12,16,20,24}, space
   {4,8,12,16,24,32,48,64}, typografia 12/13/15/17/22, farby brand/accent/semantic).
3. Len ak ide o skutočne novú sémantiku → **jeden** token v `:root` (nikdy inline),
   kanonický názov, a **explicitne to nahlás**.

Kľúčové tokeny: `--text-heading` `#333D6C` · `--text-body` `#46506B` · `--text-muted` `#687087` ·
`--brand-accent` `#FF4496` · `--brand-cyan` `#6AD5E5` · `--brand-cyan-soft` `#E1F5F9` ·
`--brand-teal-text` `#0E7D92`.

## 6. Vzory rozhrania

Ustálené vzory sa **znovupoužívajú**, nevymýšľajú sa varianty. Nový variant je zmena
dizajn systému a musí sa nahlásiť.

**Responzívne pravidlo patrí vždy hneď za základné pravidlo toho istého selektora.**
Poradie v jednom súbore rozhoduje pri rovnakej špecificite.

### Taby — jediný povolený vzor

Plochý button bez rámu a pozadia, **ikona + popisok**. Neaktívny `--text-muted`;
aktívny `--text-heading`, hrúbka 700, s **3px podčiarknutím** (`border-radius:2px`)
v `--text-heading`. Rozostup 22–26 px.

**Pilulky, segmenty, orámované prepínače a farebné pozadia sa ako taby NEPOUŽÍVAJÚ.**

Implementácie: `.tabs` (hlavná lišta kokpitu) · `.dtabs` (dekurz) · `.tabbar`
(univerzálna trieda pre nové tab pruhy — použi túto). Voliteľný počet v `.cnt`.

Výnimka: dvojstavový prepínač zobrazenia vnútri panela (napr. Štruktúra / Text)
nie je navigácia, a preto ostáva segmentom.

### Tlačidlá

Škála z dizajn systému, **veľkosť sa vyberá podľa kontextu**:

| Veľkosť | Kedy |
|---|---|
| **48 · L** (`.btn.lg`) | primárne CTA, mobil na plnú šírku, prázdne stavy, landing |
| **40 · M** (`.btn`) | **default** — väčšina UI: formuláre, panely, toolbary, karty |
| **32 · S** (`.btn.sm`) | kompaktné a riadkové — riadky tabuliek, husté filtre |

Ikonové `.btn.icob` (32×32), tiché `.btn.ghost`.
Popisky: L 16/24, M 14/20, S 12/16, Mulish SemiBold.

Typy podľa dôrazu: **Primary › Secondary › Ghost**; kontextové sú Destructive, IQ,
Inverse, Glass. Secondary má vždy **neutrálny** rám — cyan rám na Secondary znamená
vybraný chip, nie tlačidlo. Vlastné farby mimo typov sa nepoužívajú.

Primary je `--brand-cyan` s textom `--brand-cyan-ink` (`#06343E`), **nikdy biely text**.
**Na jednej obrazovke smie byť najviac jedno primary tlačidlo** — hlavná akcia.
Podporné akcie sú sekundárne (biele s rámom), potichu ghost.

Vlastné rozmery tlačidiel sa **nedefinujú**. Ak niektorý rozmer chýba, je to zmena
dizajn systému a musí sa nahlásiť — nie prepísať lokálne.

### Umiestnenie akcií panela

Akcie, ktoré platia pre celý panel (uložiť, zahodiť, potvrdiť), patria do **hornej
lišty**, zarovnané vpravo v riadku s tabmi — **nikdy pod obsah**. Ak je obsah
scrollovateľný, tlačidlá pod ním používateľ nevidí a nevie, že existujú.

Aktivujú sa podľa stavu panela (`disabled`, keď akcia nedáva zmysel), nie skrývajú —
skrývanie mení rozloženie a používateľ stratí orientáciu.

### Formulárové polia

Podľa handoffu dizajn systému: **bez rámu v pokojovom stave**, výplň `surface/1`,
hodnota v `--text-heading`, popisok `--text-muted`, placeholder `--text-subtle`.
Focus = biele pozadie + **2px prstenec** `--brand-cyan`. Hover `surface/2`.

Veľkosti: **S 40 px** (radius 8) · **M 48 px** (radius 12, default) · **L 56 px** (radius 16).
**Nikdy pod 40 px** a nikdy rám ako pokojový stav. Placeholder sa nepoužíva namiesto
popisku; popisok je vždy viditeľný.

### Podstránky

Skladba: **drobčeky** (12/16, `--text-muted`) → **hlavička** (nadpis 24/32 bold +
akcia vpravo) → **karta** `.pgcard` (biela, 1px rám, radius 14, padding 24).
Podstránka nahrádza kokpit; **PHR panel sa nerezervuje** — patrí len do detailu pacienta.

Rozostupy držia škálu **8 / 16 / 24 / 32**. Medzihodnoty (14, 18, 20, 22) sa nepoužívajú.

### Modálne okná

`sheetwrap` → `sheet` (`sheet wide` pre široký obsah) → `sh-h` hlavička, `sh-b` telo,
`sh-f` pätka s tlačidlami vpravo. Zatváranie cez `mClose(id)` aj kliknutím na `scrim`.

**Výšku určuje obsah.** Modal nemá vynútenú výšku ani `min-height` na vnútorných
paneloch; jediné obmedzenie je responzívny strop (`max-height:86vh`) so scrollom
v `sh-b`. Prázdne miesto pod krátkym obsahom je chyba.

## 7. i18n

Zdroj je slovenčina, default zobrazenie angličtina. Pole `I18N` obsahuje páry `[SK, EN]`;
**každý nový reťazec vo `tt()` musí dostať pár v tom istom kroku** — inak sa v anglickom
rozhraní zobrazí po slovensky.

`swapText` prekladá textové uzly aj `title` / `placeholder` / `aria-label` / `data-tip`.
**Nové páry pridávaj na začiatok poľa.** Každý nový používateľský reťazec musí mať pár.

## 8. Komunikácia

Slovensky, priamo, plain language. Bežné anglicizmy (API, ISO, FHIR, GitHub) áno; hybridy
a vymyslené zloženiny nie. Odborný termín vysvetli pri prvom použití. Blokery a konflikty
hlás **na začiatku**, nie na konci. Stručné potvrdenie je lepšie než rozvíjanie.

## 9. Čo eskalovať, nie riešiť sám

- Hranica návrh vs. rozhodnutie pri Hilbi IQ (`DSI-04`) — dotýka sa MDR. Rozhoduje compliance.
- Podpisová úroveň per trh (`SIG-01`), retencia auditu (`AUD-03`).
- Rozsah EHDS CE režimu pri prechode do módu `core` (`REP-03`).
- Čokoľvek, čo by z prototypu spravilo nástroj pracujúci s reálnymi údajmi pacientov.

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
  aktualizácie príslušného dokumentu v `docs/` v tom istom commite. Čo nie je zdokumentované,
  neexistuje.
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

## 4. Commit workflow

1. Stiahni aktuálny `index.html` z `main` (autoritatívny je obsah repa, nie GitHub Pages).
2. Uprav lokálne.
3. **Sanity brány — obe musia prejsť:**
   - brace balance: `t.count('{') - t.count('}')` — **baseline je `-1`**, nie `0`
   - extrahuj `<script>` do `_js.js` a spusti `node --check _js.js`
4. Commitni cez GitHub contents API (GET sha → PUT base64 + sha).
5. Verzia `vNN` v changelogu; správa commitu vecne popisuje zmenu a odkazuje na normatívne ID.

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

## 6. i18n

Zdroj je slovenčina, default zobrazenie angličtina. Pole `I18N` obsahuje páry `[SK, EN]`;
`swapText` prekladá textové uzly aj `title` / `placeholder` / `aria-label` / `data-tip`.
**Nové páry pridávaj na začiatok poľa.** Každý nový používateľský reťazec musí mať pár.

## 7. Komunikácia

Slovensky, priamo, plain language. Bežné anglicizmy (API, ISO, FHIR, GitHub) áno; hybridy
a vymyslené zloženiny nie. Odborný termín vysvetli pri prvom použití. Blokery a konflikty
hlás **na začiatku**, nie na konci. Stručné potvrdenie je lepšie než rozvíjanie.

## 8. Čo eskalovať, nie riešiť sám

- Hranica návrh vs. rozhodnutie pri Hilbi IQ (`DSI-04`) — dotýka sa MDR. Rozhoduje compliance.
- Podpisová úroveň per trh (`SIG-01`), retencia auditu (`AUD-03`).
- Rozsah EHDS CE režimu pri prechode do módu `core` (`REP-03`).
- Čokoľvek, čo by z prototypu spravilo nástroj pracujúci s reálnymi údajmi pacientov.

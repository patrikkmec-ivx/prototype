# Hilbi Cockpit — prototyp a klinické špecifikácie

**Čítaj tento súbor prvý.** Definuje, čo je každý súbor v repozitári, **akú autoritu nesie**,
**v akom poradí ho čítať** a **kto vyhráva pri konflikte**.

- **Live prototyp:** https://patrikkmec-ivx.github.io/prototype/
- **Aktuálna verzia prototypu:** **v158** — changelog je v hlavičke `index.html`
- Desktop ≥ 745 px, mobil ≤ 744 px; jazyky EN/SK (prepínač v menu)

> **Prototyp nie je produkčný kód.** Žiadne reálne údaje pacientov. Prototyp implementuje
> *štruktúru* noriem, nie ich produkčné naplnenie — nezhody sú vymenované v `cp-17` §10.

---

## Úrovne autority

| Úroveň | Význam | Pri konflikte s vyššou úrovňou |
|---|---|---|
| **NORMATIVE** | Záväzné. Musí sa dodržať a musí sa voči tomu konformovať. | Nižšie postavený normatívny artefakt ustupuje vyššiemu. |
| **BEHAVIORAL** | Riadi, *ako* AI nástroj uvažuje a koná. Nedefinuje podstatu. | Vo vecných otázkach ustupuje NORMATIVE. |
| **INFORMATIVE** | Vysvetľujúca orientácia. Nezáväzné. | Nikdy nič neprebíja. |
| **REFERENCE** | Ilustratívny vzor. Nie je zdroj pravdy. | Nikdy nič neprebíja; ak sa rozchádza s NORMATIVE, chyba je v ňom. |

## Precedencia

```
cp-17 (report conformance)  >  cp-15 (záznamový model)  >  index.html (implementácia)
        core-01 je nadradený pre klinické jadro
        (CLAUDE.md riadi správanie AI, vo veci ustupuje vyššiemu)
```

1. **Pri konflikte o tom, čo sa smie so záznamom stať** — kódovanie, podpis, verziovanie,
   provenance, zdieľanie, AI transparentnosť — **vyhráva `cp-17`**.
2. **Pri konflikte o záznamovom modeli** (SOAP, case, billing derivácia) — **vyhráva `cp-15`**.
3. **Prototyp nikdy nedefinuje normu.** Ak sa `index.html` rozchádza so specom, chyba je
   v prototype — okrem bodov vedome uvedených v `cp-17` §10 ako placeholder.

## Poradie čítania pre AI nástroj

1. **`README.md`** (tento súbor) — čo čítaš a akú to má váhu.
2. **`CLAUDE.md`** — ako sa v tomto repozitári správať (sanity brány, commit pravidlá, disciplína tokenov).
3. **`docs/cp-17-…`** — čo je záväzné pre report a jeho životný cyklus.
4. **`docs/cp-15-…`** — záznamový model (SOAP, case, billing).
5. **`docs/DEV-SUMMARY.md`** — rýchla orientácia a mapa „pravidlo → kde v kóde".
6. **`index.html`** — implementácia.

---

## Index súborov

| Súbor | Autorita | Čo to je |
|---|---|---|
| `README.md` | — | Tento index: autorita, precedencia, poradie čítania. |
| `CLAUDE.md` | **BEHAVIORAL** | Operačný kontrakt pre AI nástroje (Claude Code) pracujúce v tomto repozitári. |
| `docs/cp-17-tech-report-conformance-standard.md` | **NORMATIVE** | Report conformance: rola overlay/core, shell, terminológia, podpis, amendment, provenance a audit, súhlas, DSI. Trhová matica EU/US/IN. |
| `docs/cp-15-tech-soap-case-billing-standard.md` | **NORMATIVE** | Záznamový model: SOAP jadro, case vrstva, billing derivácia. |
| `docs/core-01-tech-clinical-core-standard.md` | **NORMATIVE** | Klinické jadro. |
| `docs/cp-16-tech-records-simple-note-analysis.md` | **INFORMATIVE** | Analýza Records vrstvy; implementácia odložená. |
| `docs/cp-19-tech-templates-intake-analysis.md` | **INFORMATIVE** | Analýza šablónovej vrstvy a IQ intake postupu; návrh pravidiel TPL-*/INT-*. |
| `docs/cp-18-tech-report-lifecycle.mermaid` | **REFERENCE** | Životný cyklus reportu s Provenance bodmi — vizualizácia `cp-17`. |
| `docs/cp-14-tech-soap-screen-flow.mermaid` | **REFERENCE** | Obrazovkový tok SOAP. |
| `docs/core-02-tech-clinical-core-flow.mermaid` | **REFERENCE** | Tok klinického jadra. |
| `docs/core-03…06-audit-*` | **INFORMATIVE** | Regionálne audity (US, EU, IN) a konsolidácia. |
| `docs/core-07…09-pack-*` | **INFORMATIVE** | Regionálne balíky. |
| `docs/core-10-executive-summary.md` | **INFORMATIVE** | Zhrnutie pre vedenie. |
| `docs/core-11-tech-careplan-pathway-mapping.md` | **NORMATIVE** | Mapovanie care plan → pathway. |
| `docs/core-12-tech-sync-standard.md` | **NORMATIVE** | Synchronizačný kontrakt. |
| `docs/DEV-SUMMARY.md` | **INFORMATIVE** | Orientácia pre dev tím + mapa „pravidlo → kde v kóde". |
| `docs/HANDOFF.md` | **INFORMATIVE** | Kontext na pokračovanie práce v novej relácii. |
| `index.html` | — | Prototyp. Implementácia, nikdy nie norma. |

> **Poradie čítania pri zmene:** norma (`cp-17`) → mapa do kódu (`DEV-SUMMARY` §4) →
> implementácia. Každý normatívny krok sa premieta do `cp-17` §14 (stav prototypu),
> `DEV-SUMMARY` §4 a §5, a `HANDOFF`. Dokumentácia sa aktualizuje **v tom istom kroku**,
> nie neskôr.

---

## Pravidlo, ktoré rieši väčšinu otázok

> **Hilbi je orchestrátor, nie system of record.** Východisková rola je **overlay** nad
> existujúcim systémom poskytovateľa; rola `core` je opt-in a viaže sa na ňu certifikačná
> vrstva podľa trhu. Pozri `cp-17` §1 — v súlade s **A1** Care Plans Standardu
> („orchestrator, not an EHR"), ktorý túto pozíciu zamkol skôr.

## Konformita v jednej vete

Výstup je konformný, keď je klinický obsah **kódovaný dual coding** (záznam SNOMED CT, výkaz
klasifikácia trhu) so **zachovaným naratívom**, nesie **podpisovú úroveň trhu**, **podpis zmrazí
obsah do snímky s odtlačkom**, má **nemenný audit s purpose-of-use**, opravuje sa **výhradne
addendom**, zdieľa sa **len po podpise a so súhlasovým kontextom**, každý **AI výstup je označený
ako návrh** s deklarovanou logikou, a **jazyk dokumentu je nezávislý od jazyka rozhrania**
(klinický obsah sa neprekladá automaticky, súhlas nikdy).

---

*Vlastník: Hilbi Health Group (R&D). Markdown je SSOT; akýkoľvek `.docx` je z neho generovaný
pre obeh a nie je autoritatívny.*

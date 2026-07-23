# Dev Summary — kokpit a report vrstva

> **Autorita: INFORMATIVE.** Rýchla orientácia pre dev tím. Nezáväzné — záväzný zdroj je
> `docs/cp-17-tech-report-conformance-standard.md` (report conformance) a
> `docs/cp-15-tech-soap-case-billing-standard.md` (záznamový model).

## 1. Čo staviame (jedna veta)

**Orchestrátor, nie EHR.** Kokpit konsoliduje priebeh starostlivosti a prepája klinickú stranu
s pacientom; predvolene beží ako **overlay** nad systémom poskytovateľa, ktorý ostáva master
klinického záznamu. Rola `core` (Hilbi ako system of record) je opt-in a viaže sa na ňu
certifikačná vrstva podľa trhu.

## 2. Kompilačný reťazec

```
Udalosti  →  Dekurz  →  Správa  →  Records
```

- **Udalosti** — atomické akcie lekára, každá s jedným SOAP slotom. **Jediný zdroj pravdy.**
- **Dekurz** — priebežná kompilácia udalostí do FHIR `Composition` (sekcie S/O/A/P), beží
  na pozadí. Nie je to formulár.
- **Správa** — *render* tej `Composition` → `DocumentReference`. Jeden dátový objekt,
  viac templatov (Rx slip / plná správa), **žiadne obsahové vetvenie**.
- **Records** — knižnica artefaktov, len obal odkazujúci na udalosti. Nie druhý zápisový
  kanál. Implementácia odložená (`cp-16`).

## 3. Konfigurácia per trh

`market_rules` (v prototype objekt `MKT`) je **konfigurácia, nie kódová vetva**. Nesie:
minimálny podpisový set, render template, dokumentový profil, podpisovú úroveň, identity
label, a kódové systémy (záznam / výkaz / lieky / laboratórne).

| | EÚ | US | IN |
|---|---|---|---|
| Profil | EEHRxF | US Core / C-CDA | ABDM Prescription / OPConsultation |
| Záznam | SNOMED CT | SNOMED CT | SNOMED CT |
| Výkaz | MKCH-10 / ICD-10 | ICD-10-CM | ICD-10 |
| Lieky | ATC | RxNorm | ATC |
| Podpis | eIDAS AdES/QES | HIPAA e-signature | IT Act / ABDM |
| Identita | národný identifikátor | MRN, NPI | ABHA, HPR, HFR |

**Ak niekde vzniká `if (market === …)` v logike, je to chyba** — patrí to do konfigurácie.

## 4. Mapa: pravidlo → kde v kóde (`index.html`, v129)

| Oblasť | Normatívne ID | Symbol v kóde |
|---|---|---|
| Rola systému | `REP-01`, `REP-02`, `REP-05` | `RPT_MODE`, `rptModeNote()` |
| Shell reportu | `REP-06` | `reportShell()` |
| Identita | `REP-07` | `RPT_ID`, `rptIdLine()` |
| Dokumentový profil | `REP-08` | `MKT[…].doc` |
| Register šablón | `REP-09`, `TPL-05` | `TPL_REG` (doménovo neutrálny), `rptSource()`, `rptSec()` |
| Výber šablóny | `TPL-03` | `tplCur()`, `tplPick()` — trh dáva default a minimum, nevyberá |
| Coverage | `INT-03` | `tplCoverage()` |
| Dva renderery | `TPL-06` | `rptSec()` (štruktúra) · `rptPlain()` (text pre schránku) |
| Tvar položky | `TERM-03`, `TERM-05` | `rptItem()` → `{slot, text, coding}` |
| Kódová väzba slotu | `TERM-04` | `TERM_BIND` |
| Dual coding | `TERM-02`, `TERM-03` | `codeChipsOf()`, `codeOf()` |
| ValueSet (demo) | `TERM-06` | `CODEMAP` |
| Priznaná medzera | `TERM-08` | trieda `.cd.none` |
| Podpisová úroveň | `SIG-01` | `MKT[…].sig` |
| Verzie a addendum | `AMD-01..03` | `RPT_VERS`, `rptStatus()`, `rptSaveVersion()` |
| Provenance | `PROV-01`, `PROV-02` | `logProv()` |
| Audit | `AUD-01` | `logAudit()` |
| Súhlas pri zdieľaní | `CNS-01..05` | `rptShare()` |
| AI transparentnosť | `DSI-01..04` | `DSI`, `dsiHTML()` |
| Zmrazenie pri podpise | `AMD-05..09` | `rptSnapshot()`, `snapShellHTML()`, `rptHash()` |
| Neutrálne kľúče zdrojov | `I18N-01`, `I18N-06` | `TPL_SRC` (`hist-past`, `allergies`…), `SRC_DISP` |
| Dve jazykové osi | `I18N-02` | `srcAbbr()` = jazyk dokumentu · `srcName()` = jazyk rozhrania |
| Jazyk dokumentu | `I18N-03` | `ORG.lang`, `docLang()`, otlačený v snímke |
| Preklad na vyžiadanie | `I18N-07`, `I18N-08` | `TR_LANG`, `trSet()`, `trBarHTML()` |
| Súhlas per jazyk | `I18N-11` | `CNS_REG` `(id, ver, lang)`, `cnsPick()` |
| Zdroje ako podmnožiny slotov | `TPL-17`, `TPL-18` | `ENC_SRC` — `exam-neuro`, `labs`, `dx-coded` |
| Identita dokumentu | `DOC-01..07` | `docNew()`, `docAssignHuman()`, `DOC_REG` |
| Jeden dokument, dva pohľady | `DOC-06` | `renderDocViews()`, `docOpen(master)` |
| Podpisový blok | `TPL-19` | `ORG.signatories` (identita) · `tpl.signers` (výber) · `sigBlockHTML()` |

## 5. Čo musí produkcia nahradiť

Prototyp implementuje **štruktúru**. Toto sú vedomé placeholdery — plný zoznam a stav je
v `cp-17` §10:

| Prototyp | Produkcia |
|---|---|
| `CODEMAP` — regex pravidlá | terminologický server, `$expand` / `$validate-code` nad ValueSetom |
| kód sa odvodzuje pri renderi | **kód vzniká pri zázname** (capture-side picker) — `TERM-05`, `TERM-06` |
| `AUDIT` pole v pamäti | perzistentný, nemenný, tamper-evident log — `AUD-02` |
| snímka drží hodnoty | verziované odkazy `Observation/123/_history/2` — `AMD-06` |
| `rptHash()` (djb2) | SHA-256 v `DocumentReference…hash` — `AMD-08` |
| `TR_DEMO` slovník | prekladová služba so záznamom v `AuditEvent` — `I18N-15` |
| podpis ako UI stav | integrácia podpisu podľa trhu — `SIG-01` |
| pätka deklaruje FHIR objekty | reálna emisia `Composition` / `DocumentReference` / `Provenance` |
| zdieľanie ako hlásenie | súhlasový dialóg s purpose-of-use — `CNS-01` |

**Najdôležitejší z nich je capture-side kódovanie.** Odvodzovať kód z voľného textu pri
renderi je architektonicky obrátené; kód patrí do udalosti, lebo udalosti sú SSOT.
Doplnenie interoperability do systému, ktorý na ňu nebol navrhnutý, je prestavba, nie záplata.

## 5b. Zdroje sekcií

Zdroj nie je totožný so SOAP slotom — je to **podmnožina slotu rozlíšená kategóriou**.
Vyplýva to z reálnych správ, ktoré tieto vrstvy bežne rozlišujú.

| Zdroj | Patrí do slotu | FHIR | Kódovanie |
|---|---|---|---|
| `S`, `O`, `A`, `P` | vlastný slot | `Composition.section` | podľa `TERM-04` |
| `exam-neuro` | `O` | `Observation` (kategória vyšetrenie) | — |
| `labs` | `O` | `Observation` (laboratórne, likvor) | LOINC |
| `dx-coded` | `A` | `Condition` | SNOMED + klasifikácia trhu |
| `rx` | `P` | `MedicationRequest` | ATC / RxNorm |
| `fu` | `P` | `Appointment` | — |
| `hist-*`, `allergies`, `meds` | pacientska úroveň | vlastné zdroje (`TPL-04`) | podľa okruhu |

Pridanie zdroja znamená doplniť **všetkých šesť** registrov: `TPL_SRC`, `SRC_COVERS`,
`TERM_BIND`, `SRC_STYLE`, `SRC_DISP` a resolver v `rptSource()`. Kontrolný skript
konzistencie kľúčov to overuje.

## 6. Invarianty

- Každý zápis má `Provenance`; každý prístup a export má `AuditEvent` s purpose-of-use.
- Podpísaný záznam je nemenný — oprava výhradne addendom, originál zostáva.
- Naratív sa nikdy nestráca: `CodeableConcept` = `coding[]` **+** `text`.
- AI nikdy nezapisuje ticho; zápis vzniká potvrdením lekára.
- Zdieľa sa len podpísaná verzia a len so súhlasovým kontextom.
- Jadro nikdy nevolá GitHub priamo — GitHub je autoring, nie runtime.
- Z poskytovateľskej vzorky sa preberá **iba štruktúra**; klinické hodnoty, identita
  pacienta ani znenie cudzích právnych textov sa nekopírujú (`TPL-08`).

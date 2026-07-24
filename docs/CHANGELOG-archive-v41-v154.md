# Changelog archive — v41 to v154

Historical record of the prototype, kept in the language it was written in (Slovak).
It is preserved verbatim rather than translated: it documents decisions already
superseded by the normative documents in `docs/`, and re-translating it would risk
changing the record of what was decided.

Entries from **v155 onward are in English** in the header of `index.html`.
Where this archive and a normative document disagree, the normative document wins.

```
v154 (2026-07-23): Hlavička dokumentu ako prvý a výrazný blok editora šablóny —
  ukazuje aktuálnu hlavičku zariadenia s tlačidlom Edit. Predtým bol odkaz
  len drobným textom pod signaturemi. Hlavička je prvá vec na dokumente, preto je
  prvá aj v editore; spravuje ju zariadenie a platí pre všetky šablóny (TPL-07).
v153 (2026-07-23): Podpisový blok dokumentu. Identita signatureovateľov (meno, funkcia,
  kód) patrí ZARIADENIU a edituje sa v nastaveniach; ktorí z nich sa objavia na
  dokumente, určuje ŠABLÓNA (zaškrtávacie polia v editore). FNTT SM má štyri signaturey
  podľa vzorky: attending physician · senior consultant · head of department · pacient.
  Z editora šablóny vedie odkaz do nastavení hlavičky, pätky a signatureov.
  Normatívny zdroj: cp-17 TPL-19.
v152 (2026-07-23): Template FNTT SM podľa reálnej ambulantnej správy Neurologickej
  kliniky — Centrum SM (okruh zariadenia). Sections TO / Obj. / HK-DK / Laboratórne
  a likvorové vyšetrenia / Assessment / Dop. / Recipey / Diagnoses / Vyhlásenie pacienta.
  Pridané tri sources ako podmnožiny slotov rozlíšené kategóriou: exam-neuro, labs
  (LOINC) a dx-coded (SNOMED + klasifikácia trhu) — reálna správa rozlišuje Obj. vs
  neurologický nález vs laboratórium a Assessment (próza) vs Diagnoses (kód).
  Zo vzorky prevzatá iba štruktúra, klinické hodnoty a znenie sú custom (TPL-08).
  Normatívny zdroj: cp-17 TPL-17, TPL-18.
v151 (2026-07-23): OBNOVA + oprava. v148 omylom prepísal v145–v147 (lokálny súbor
  sa po reštarte prostredia vrátil do staršieho stavu a nebol znovu stiahnutý
  z main). Podstránka šablón obnovená, modal tplwrap odstránený z kódu.
  Premenná --appmax sa nikdy nezadefinovala → var() v .dockwrap bol neplatný,
  right sa vyhodnotil ako auto a plávajúci widget spadol vľavo dole. Opravené.
v150 (2026-07-23): Responzíva na širokých monitoroch. Plávajúci dock a IQ modal
  ukotvené na kontajner aplikácie, nie na viewport. --appmax 1600 → 1920.
  Formulár editora capovaný na 720 px.
v149 (2026-07-23): Jazyková vrstva (I18N-01..15). Jazykovo neutrálne kľúče zdrojov,
  SRC_DISP = skratka v jazyku dokumentu vs. názov v jazyku rozhrania, document language
  v nastaveniach organizácie, register súhlasov kľúčovaný (id, version, jazyk),
  preklad tela na vyžiadanie ako čítacia pomôcka. Normatívny zdroj: cp-17 §12.
v148 (2026-07-23): Zmrazenie obsahu pri signaturee (AMD-05..09). rptSnapshot() mrazí
  štruktúru, naratív aj kontext; podpísaná version sa nikdy neskladá zo živých dát;
  fingerprint obsahu v dokumente, histórii verzií aj Provenance.
v147 (2026-07-23): Oprava poradia CSS — media query pre tri stĺpce bol pred základným
  pravidlom .tplmgr a neskoršia definícia ho prebíjala.
v146 (2026-07-23): Rozostupy podstránky na škálu 8/16/24/32; PHR stĺpec sa na
  podstránke nerezervuje; náhľad vedľa od 1200 px a sticky.
v145 (2026-07-23): Templates ako PODSTRÁNKA podľa skladby IQ Doc (drobčeky, nadpis
  s akciou, karta). Modal zrušený. Tri stĺpce: zoznam / editor / živý náhľad.
v144 (2026-07-23): Šírka komponentu 820 → 1040 px, text náhľadu obmedzený na
  čitateľnú mieru 680 px.
v143 (2026-07-23): Oprava podľa DS '26 Atoms. Tlačidlá: M 40 je default pre panely
  a formuláre, S 32 len pre husté riadky. Polia prepísané podľa Input handoffu —
  bez rámu, výplň surface/1, S 40 / M 48, cyan focus prstenec.
v142 (2026-07-23): Typografická hierarchia editora — nadpis skupiny, popisok poľa,
  obsah poľa; názov sekcie je nositeľ významu.
v141 (2026-07-23): Škála tlačidiel L 48 / M 40 / S 32, max 1 primary na obrazovku,
  výšku modalu určuje obsah.
v140 (2026-07-23): Zjednotenie tabov na kanonický vzor kokpitu (plochý button,
  ikona + popisok, 3px podčiarknutie). Nová trieda .tabbar.
v139 (2026-07-23): Tri okruhy vlastníctva šablón — System / Facility / Moje,
  prostredie tvorby (od začiatku / nahrať súbor / odfotiť).
v138 (2026-07-23): Živý náhľad v editore + vizuálna hierarchia sekcií (key / norm /
  anam) odvodená zo zdroja.
v137 (2026-07-23): Informed consent — register znení, samostatný dokument aj sekcia
  na konci správy, signatureové polia, typovo citlivá validácia.
v136 (2026-07-23): Anamnestické okruhy na pacientskej úrovni, hlavička poskytovateľa
  do nastavení organizácie, extrakcia šablóny zo vzorky s potvrdením mapovania.
v135 (2026-07-23): Jediný vstup do správy šablón (profile physiciana), verziovanie šablón,
  oprava orezaného layoutu.
v134 (2026-07-23): Profileové menu v ľavej lište so vstupom do šablón.
v133 (2026-07-23): Oprava prístupnosti — lišta s generovaním bola vnútri #rendout,
  ktorý sa plnil až po signaturee dňa (cyklická závislosť).
v132 (2026-07-23): Rozhranie správy šablón — zoznam, editor sekcií, validácia proti
  minimu trhu (TPL-02).
v131 (2026-07-23): Šablónový povrch — doménovo neutrálny register, picker, coverage,
  dvojitý renderer (štruktúra / plain text pre schránku).
v130 (2026-07-23): Štrukturálny krok — register šablón ako dáta namiesto vetvenia,
  položka reportu má tvar {slot, text, coding}.
v129 (2026-07-23): G5+G7. Provenance + AuditEvent ako first-class: atribúcia
  (create/sign/amend/verify) a prístupový log (copy/print/share) s agentom, rolou
  a purpose-of-use; audit panel v reporte. DSI transparentnosť podľa US HTI-1 —
  každý AI suggestion (report, E/M) deklaruje typ, verziu, inputs, logiku a že rozhoduje
  physician. Normatívny zdroj: cp-17 §6, §8.
v128 (2026-07-23): G2 terminológia. Dual coding — record SNOMED CT + LOINC, report
  MKCH-10/ICD-10/ICD-10-CM per trh. CodeableConcept tvar (coding[] + text), naratív
  sa zachováva; nie select. TERM_BIND per SOAP slot (S = naratív, A/O/P kódované).
  Medicines ATC (EÚ/IN) vs RxNorm (US) cez market_rules — oprava natvrdo zapísaného
  seamu z v126. CODEMAP = demo ValueSet. Normatívny zdroj: cp-17 §3.
v127 (2026-07-23): Akčná lišta reportu (Generate / Save version / Copy /
  Print / Share) + amendment verziovanie: Composition.status preliminary → final
  → amended, originál sa zachováva, história verzií. Zdieľanie viazané na súhlasový
  kontext per trh. Normatívny zdroj: cp-17 §5, §7.
v126 (2026-07-23): Report-shell refactor. Mode-aware (overlay/core), identita
  z kontextu (ABHA/HPR/HFR · MRN/NPI seam) namiesto natvrdo zapísaných hodnôt,
  jednotný shell — koniec duplikovaného chrome, dokumentový profile a signatureová
  úroveň per trh. Normatívny zdroj: cp-17 §1, §2.
v125 (2026-07-22): Hero key-facts chipy — .chips .row flex-wrap nowrap → wrap,
  gap 6px 8px. Chipy sa pri zúžení zalomia namiesto orezania.
v124 (2026-07-22): Špecializácie → medzinárodné tituly (Neurologist/Cardiologist/
  Internist/Surgeon). NS_SPEC nahradený SPECBY + specOf (kľúč = priezvisko,
  normalizácia diakritiky, rieši SK aj EN naraz). Aplikované vrátane hover tooltipu
  na ceste pacienta.
v123 (2026-07-22): Magenta preč z mien → mená v --text-heading (navy, 700).
  Specializačný pill aj v položkách dropdown menu. Oprava nsSave — číta len .nm,
  aby do FHIR mapovania nepribral text pillu.
v122 (2026-07-22): Expert-identity vzor (avatar + akcentový odznak + meno +
  specializačný pill) tam, kde je physician subjektom: dropdown + PLANNED riadok.
v121 (2026-07-22): Odstránený ⏎ (kb2) odznak zo všetkých 3 primary pätiek.
  Avatary do Clinician dropdownu (NS_AV, nsAvHtml), reálny avatar aj v PLANNED riadku.
v120 (2026-07-22): ZJEDNOTENIE termín + order + interné odoslanie do JEDNÉHO
  modalu "Next step" (nswrap), 1 vstup cez +. Typová os (FHIR mapovanie):
  Follow-up/Tele=Appointment (date/time), Specialist/Hospitalization=ServiceRequest
  referral (department→clinician, reason), Radiology/Lab test=ServiceRequest
  order (catalog+reason). Where/who = 2-stupňový dropdown Department→Clinician
  (performer/participant). Polia adaptívne per typ. Staré ordwrap+aptwrap modaly
  a 2 dock položky ODSTRÁNENÉ, nahradené 1× "Next step". EN + štandardné názvy.
  Reuse: typechips/vgrid/catchips/gaterow/recline, encEvent, addPend, dekAddEv.
v119 (2026-07-22): showToast(msg, kind): kind='ok' → .toast.ok (pozadie --success,
  biely text a check). Zelené pri všetkých signatureoch: finalizeSign (dekurz/report),
  irSign (IQ session), a save/sent akcie ostávajú navy. 0 nových tokenov.
v118 (2026-07-22): PIN modal — 1) security badge: štítová ikona (nový symbol
  i-shield s fajkou) v teal kruhu nad titulkom + chip "Zabezpečený signature" pod
  hintom (lock mikro-ikona). 2) Mobil (≤744px): pinbox širší (min(92vw,380px)),
  väčšie dot boxy (54×64, font 26), klávesnica 1fr na plnú šírku, výška 56,
  font 20 — pohodlné palce.
v117 (2026-07-22): JEDNOTNÉ PODPISOVÉ GESTO = OSOBNÝ PIN (Patrik). Nový pinwrap
  modal: 4-miestny PIN (dot boxy, auto-advance, Backspace, Enter, klávesnica aj
  klik), label akcie, hint "PIN authorizes the signature per market rules (C6)".
  Demo PIN: ľubovoľné 4 číslice → check animácia → callback. Nasadené na VŠEBPY
  signaturey: eRX signFinal (nahrádza biometriu/biowrap — markup+CSS ODSTRÁNENÉ),
  dekurz finalizeSign (Sign the day / vyšetrenie), IQ irSign. pinSign(label,cb)
  = jediné API. i18n páry. Pozn.: PIN je autorizačné gesto, úroveň signatureu
  (simple/AdES/QES/EPCS) rieši region pack pod ním — core-01 C6/D7.
v116 (2026-07-22): Record Session — po kliknutí na "Record via mobile device" sa
  telo modalu samo plynulo poscrolluje na QR (scrollIntoView smooth po requestAnimationFrame),
  bez manuálneho scrollovania.
v115 (2026-07-22): Medzera medzi tabmi a osou (PLANNED) zmenšená: .scroll
  padding-top 14→6, .ssep margin-top 2→0.
v114 (2026-07-22): "Vyžaduje pozornosť" (.attn) banner ODSTRÁNENÝ z časovej osi —
  riadok uvoľnený, upozornenia sa vyriešia iným mechanizmom neskôr (Patrik).
  CSS .attn ponechané (neškodí, možný reuse).
v113 (2026-07-22): ZJEDNOTENIE 4 zobrazení do JEDNÉHO dropdownu na tabe Patient
  pathway (vzor Care plans: .tabdd + .cpdrop + chev). Obsah: Full axis / Milestones
  (axmode) + separator + Komfortný / Compact view (presunuté z hamburger menu;
  hmenu ostáva len jazyk). Samostatný .axmode riadok nad osou ODSTRÁNENÝ (šetrí
  priestor). Chevron otvára dropdown (stopPropagation), klik na tab = cTab('path').
  cpMenu/cpPick refaktor: closest('.tabdd') namiesto querySelector — funguje s
  viacerými tabdd; global click zatvára všetky. .cpdrop button.on .chk pattern.
v112 (2026-07-22): 1) PATHWAY (core-11): prepínač Full axis / Milestones (axmode,
  body[data-ax=ms]); mílnikové riadky = data-mc na .trow (tx=zmena liečby na encounteri
  DM+HT, hosp=Prípad Hypertensive crisis, rel=urgentná Hypertensive crisis); spine marker
  s ringom (--brand-teal) + title "Mílnik — ..."; MAP-07: karta "na overenie"
  (preliminary) NIE JE mílnik a v Milestones móde zmizne. MAP-01: klik na mílnik = klik
  na zdrojovú kartu. 2) TOKENY: nový --brand-cyan-ink:#06343E, --grad-brand,
  --org-fn/--org-df; .pillbtn/.btn.primary/org logá/JS grad mapa prepnuté na var().
  Token dlh z v81-v110 SPLATENÝ. 3) i18n: páry pre iqrec (EN zdroj → SK cez EN2SK)
  + axmode + milestone titles.
v111 (2026-07-22): Record Session — record button viditeľný bez scrollu: QR sekcia
  zbalená za "Record via mobile device" toggle (lazy reveal), na mobile (≤744px) QR
  párovanie úplne skryté (.irqronly). PHR pravý panel — fix nescrollovateľného vrchu:
  duplicitné .phr .pbody pravidlo s justify-content:center (placeholder z prvej verzie)
  prebíjalo flex-start layout → obsah odstredený, vrch pod tabmi; zredukované na flex:1.
v110 (2026-07-21): IQ Record Session prestavaný (iqrec modal). KROK 1 capture: meno
  pacienta na kontrolu (eRX-štýl), Output format dropdown (SOAP default + VÚSCH +
  "Create a template" neaktívne), QR na spárovanie s mobilom, record tlačidlo s
  pauza/pokračovať (pre prerušenie) + timer/waveform + Stop & review. KROK 2: SOAP
  náhľad v editovateľnom dokumente (eRX UX) — physician prepíše a/or podpíše. Sign →
  encEvent uloží na časovú os + dekurz. QR faux-SVG (var(--surface-navy)), record =
  --danger. 0 nových tokenov. IQ button "Record Session" prepnutý z recwrap na irOpen.
v109 (2026-07-21): Care plans tab v strednej ploche má dropdown (klik na tab/šípku).
  Obsah: Care Plan Studio (authoring, teal) + separátor + SM Care Plan, Dementia Care
  plan, Fabry Care plan, Colorectal Care plan. Náš dizajn (reuse tokenov), chevron
  nahradený naším štandardným (rotuje pri otvorení), klik mimo zatvára. cpMenu/cpPick.
v108 (2026-07-21): 1) PHR Summary komponent úplne odstránený — PHR tab = Health data
  + Records. 2) Collapse fix: pri zbalení sa panel VŽDY zmenší (min rule --phrw:46px
  !important prebije inline resized šírku), ale naťahaná šírka ostane zapamätaná (inline
  --phrw sa nemaže) a pri rozbalení sa obnoví. lifeidBtn späť na jednoduchý toggle.
v107 (2026-07-21): Life ID panel — šírka sa mení DRAGOM (chytenie ľavého okraja myšou
  + ťahanie), widen button odstránený. Grip na ľavej hrane (.phrgrip, ew-resize,
  clamp 260–640px), funguje aj touch. Zosúladené s min-collapse (pri zbalení sa inline
  --phrw odstráni, pri rozbalení obnoví). Responzívny grid ostáva (1→2 stĺpce podľa
  šírky). Summary: odstránený redundantný "PHR" nadpis (tab už hovorí PHR), summary má
  medzeru zhora + viac vzduchu v pbody. 0 nových tokenov.
v106 (2026-07-21): PHR Summary — farebne odlíšený podklad (var(--brand-cyan-soft),
  reuse, 0 nových tokenov) + medzera zhora (margin-top 8px). Life ID panel sa dá
  ROZŠÍRIŤ do šírky (nový widen toggle v ticons, body[data-phr="wide"] →
  --phrw:clamp(360px,34vw,560px)). Obsah tabov je RESPONZÍVNY grid
  (repeat(auto-fill,minmax(228px,1fr))) — pri užšom paneli 1 stĺpec, pri širšom 2;
  pthead/ptsub/summary span full-width. Žiadne nové tokeny/hexy.
v105 (2026-07-21): Life ID inkrement 4 (posledný) — PHR tab. Patient-facing Summary
  (aktívne diagnózy, medikácia, alergie — alergie zvýraznené --danger). Health data:
  Diagnoses/Medicines/Allergies/Food supplements. Records: All + 7 typov (Examination
  reports, Recipe, Vaccination, Radiology, Laboratory, Letter of referral, Documents).
  Nový list-row komponent (ikonový chip accent-soft/strong + label + count + chevron).
  Counts konzistentné s Jane Carter. 0 nových tokenov. Komponent do library: phr-listrow.
  → Life ID kompletné: 4 taby PHR/Vitals/Behavioral/Personal, 4 nové komponenty
  (gauge/range/ring/listrow), žiadne nové BE recordy.
v104 (2026-07-21): Life ID inkrement 3 — Personal tab v našom dizajne (žiadne nové
  komponenty). 5 sekcií ako karty: Personal details, Insurance, Others, Address,
  Contact — key-value riadky (label t-meta muted / hodnota t-body heading). Dáta
  konzistentné s pacientom Jane Carter (Miami General). i18n SK. Zostáva PHR tab.
v103 (2026-07-21): Life ID inkrement 2 — Behavioral tab. Nový ring/donut komponent
  (Garmin-style, full-circle progress). Activity: Steps (34%, amber, AppleHealth),
  Sleep (100%, green). Vitality: Stresss (Low, green), HRV (45 ms, teal), Oxygen
  saturation/SPO2 (96%, green — presunuté z Vitals). Reuse card layout z gauge.
  Farby z tokenov (accent-7/success/brand-teal), track --surface-2 — 0 nových tokenov.
  Nová ikona i-moon (Sleep). Komponent do library: phr-ring. i18n SK.
v102 (2026-07-21): Life ID / PHR panel — inkrement 1. Rail 8 tabov skonsolidovaný na
  4 taby: PHR / Vitals / Behavioral / Personal (Hilbi IQ = plávajúci widget, netreba
  tab). Vitals tab hotový: gauge komponent (radiálny, Garmin-style) — Blood pressure,
  Heart rate, Glucose, Cholesterol, Respiratory rate, Body temperature (no-data);
  Health profilee s range-slider komponentom — Waist circumference, BMI. Farby zón
  green/amber/red = reuse --success/--accent-7/--danger, needle = --nav-active,
  track = --surface-2 (žiadny nový token). PHR/Behavioral/Personal zatiaľ stub.
  i18n SK páry. Nové komponenty do library: phr-gauge, phr-range.
v101 (2026-07-21): Ľavé nav menu prestavané na hierarchické (podľa produktovej
  štruktúry ExpertMed, náš navy dizajn). 7 sekcií: Home + rozbaľovacie skupiny
  Patients / Calendars / Waiting areas / Orders / Payments / Medical Facility, každá
  s podpoložkami. Skupiny sa rozbaľujú (navGrp, chevron rotuje), výber položky
  zvýrazní (.active, reuse --nav-active). Zbalený nav = len ikony skupín. EN oprava:
  "Appointments edit" → "Edit appointments". Nové ikony i-home/i-wait/i-euro (3),
  reuse i-users/i-cal/i-cliplist/i-bldg. NOVÝ TOKEN --nav-active:#2A3454 (predtým
  inline). i18n SK páry pre všetky položky. pillbtn pill reuse #6AD5E5→ (pozn.:
  pill ešte na token --brand-cyan v ďalšom kroku).
v100 (2026-07-21): 1) Datey na kartách zarovnané — collapse chevron encounter
  dlaždice presunutý spod vertikálneho stredu POD date (top:38px vpravo), takže
  date siaha po pravý okraj ako ostatné karty. 2) Nový LIBRARY komponent .pillbtn
  — akčný cyan pill button (Figma: #6AD5E5 bg / #06343E text, radius 17px, bold),
  varianty .sm a .ghost. Nasadený na akciu "Verify now" (predtým text-link) —
  použije sa všade, kde record vyžaduje akciu (Verify, Book, Activate…).
v99 (2026-07-21): 1) Hover autora funguje a je na KAŽDOM recorde/profilee vrátane
  pacientom pridaných. Nahradený odrezaný CSS tooltip (kartu clipoval overflow:hidden)
  univerzálnym floating tooltipom pripnutým na body cez event delegation (.pav[data-tip]
  aj SOAP badge v case detaile) — neodreže sa, funguje na dynamicky pridané karty.
  data-tip s menom autora doplnený na všetky avatary (physiciani, laboratórium, externá
  nemocnica, PACIENT Jane Carter). 2) Mená physicianov odstránené z l2 (facility) riadkov
  a z case encrow — presunuté na hover. 3) SK fixy: "Signed"→Signed (chýbal preklad),
  + plné reťazce "Open loops (0)", "Sign-off minimum met (A+P)", stripnuté
  "General practice", "...Neurologická klinika SZU", mená Dr. Rybar/Hlavová/Karas/
  Rezník/Baláž/Horák/Šimková.
v98 (2026-07-21): Mená physicianov už nie sú za názvom vyšetrenia. Odstránené "· MUDr.
  Novák" / "· Dr. Novak" z titulkov encounter dlaždíc (statická aj dynamická ENC
  render). Meno physiciana sa teraz zobrazí ako hover tooltip nad avatarom physiciana
  (.pav[data-tip], šípka + navy bublina, funguje aj na focus pre klávesnicu).
  i18n record pre preklad tooltipu.
v97 (2026-07-21): Org dropdown (výber poskytovateľa) — UX flow oprava. Dropdown sa
  neotváral, lebo bol súrodencom .org a .nav mal overflow:hidden (padal mimo/odrezaný).
  Fix: 1) dropdown presunutý DOVNÚTRA .org (top:100% teraz voči komponentu),
  2) .nav overflow:hidden→visible, 3) z-index 60, väčší tieň. Chevron sa pri
  otvorení otočí (.org.open). Klik na nemocnicu prepne názov/lokalitu/logo + toast,
  klik mimo zatvára. Tri nemocnice: Miami General / Fakultná nemocnica Trnava (FN,
  zelené) / DFN Hospital (DF, fialové).
v96 (2026-07-21): 1) Profile physiciana dole — odstránená hamburger (menu) ikona; ostáva
  avatar + meno 2 riadky + settings gear vpravo. Pri ZBALENÍ menu: avatar a pod ním
  ozubené koliesko (stĺpec). 2) Prepínanie poskytovateľa opravené na správne
  nemocnice: Miami General Hospital / Fakultná nemocnica Trnava (SK, zelené logo FN)
  / DFN Hospital (SK, fialové logo DF) — s logami a gradientmi; pickOrg funguje.
v95 (2026-07-21): 1) Profile physiciana dole prestavaný: menu ikona vľavo, avatar, meno
  do DVOCH riadkov ("Dr. E. / Rodriguez"), vedľa neho settings ikona (ozubené
  koliesko). Pri zbalení: menu ikona vľavo + malé ozubené koliesko vpravo, meno
  skryté. 2) Z "+" menu odstránené "Photograph document" (Photograph document).
  3) Z docku odstránený Search — vyhľadávanie zastrešuje Hilbi IQ. Nový symbol
  i-gear.
v94 (2026-07-21): Detailné fixy ľavého menu a Life ID panelu:
  1) OBR1 org: gradientové logo MG v komponente, text zarovnaný na výšku loga
  (14px názov + 11.5px lokalita, 2 riadky centrované), funkčný dropdown s 2 ďalšími
  nemocnicami (ExpertMed Bratislava, Apollo Chennai) — každá s vlastným logom a
  gradientom; pickOrg prepne názov/lokalitu/logo + toast; klik mimo zatvára.
  2) navFlip BUG: prestal prepisovať .textContent (ničilo SVG chevron a vracalo
  dvojitú šípku) — teraz mení len CSS triedu a label; hamburger/chevron ostávajú.
  3) OBR2/3 PHR panel: collapse šípka presunutá na ZAČIATOK zľava, bez outline/
  pozadia; profile ikona (.tprof) bez outline/pozadia.
  4) OBR4 profile physiciana dole: menu ikona bez outline/pozadia, collapse presunutý
  na začiatok zľava.
  5) Collapse zalomenie modrého menu opravené (font-size:0 → .lb display:none;
  správne skrytie textu bez rozbitia medzier). Zbalený org drží logo, skryje text.
v93 (2026-07-21): IQ welcome screen — 1) dva výrazné akčné buttony do stredu:
  "Record Session" (gradient, mic ikona → otvára Record) a "Digitize document"
  (teal outline, scan ikona → otvára Photograph document); štýl ako tagy, ale výraznejší
  (14px radius, tieň, 15px bold). 2) Celý IQ modal na mobile zväčšený na rovnaké
  typo tokeny ako prescription obrazovky (--t-title/--t-body): väčší avatar, nadpis,
  popis, suggestedové chipy aj akčné buttony (min 44-56px tap ciele). Nové symboly
  i-mic, i-scan.
v92 (2026-07-21): Collapse chevron — bez pozadia, bez okraja (background/border/
  box-shadow none !important), sivý (text-subtle) ako outline; hover jemne stmavne.
v91 (2026-07-21): Collapse chevron nahradený presnou ikonou z dizajnu (14×8 viewBox,
  stroke 2, round) namiesto starej 24×24 cesty — zjednotené s designom vo všetkých
  troch collapse tlačidlách. Farba text-heading, otáča sa pri open.
v90 (2026-07-21): 1) chevron šípka presunutá NAPRAVO celého komponentu, vertikálne
  v strede výšky (position absolute, right:12, top:50%), rovnaká šípka ako doteraz,
  otáča sa pri open (.enccard.op); presunutá z riadku tagov na úroveň karty pre
  živý renderEnc aj statickú DM kartu; 2) sub-spine PRESNE zarovnaná — čiara sa
  kreslí per-segment (subcard::after spája stred bodky s bodkou ďalšej karty),
  takže drží stred bodiek bez ohľadu na výšku mini-kariet. Bodky z-index nad čiarou.
v89 (2026-07-21): 1) DEFAULT ROZBALENÉ (open:true) — encounter sa hneď zobrazuje
  s vnorenou osou, chevron/klik zbaľuje; 2) šípka chevronu bez sivého pozadia (holá
  ikona vpravo v komponente, hover stmavne) — zmizla "sivá plocha za 2 events";
  3) sub-spine čiara zarovnaná na STRED bodiek (left 11.5px, bodky vertikálne
  centrované cez top:calc(50%-4px)).
v88 (2026-07-21): Fix podľa Patrikovej pripomienky: 1) DEFAULT ZBALENÉ — encounter
  sa počas práce vytvára zbalený (open:false), rozbalí sa klikom na dlaždicu or
  šípku; 2) chevron šípka zvýraznená (26px dlaždica so surface-1 pozadím, 16px ikona)
  — už nezaniká medzi tagmi; 3) mini-karty (.subcard) BEZ customho borderu (len
  surface-1 pozadie + sub-spine bodky) — border tak ostáva LEN okolo sumárnej
  dlaždice, nie okolo celého bloku. Vnorená os je vizuálne jednoznačne podriadená.
v87 (2026-07-21): Rozdelenie na samostatné komponenty (Patrikova skica): sumárna
  dlaždica encounteru je VLASTNÁ karta a vnorená os s mini-kartami je SAMOSTATNÝ
  blok POD ňou (mimo borderu dlaždice), spolu v .encblock. Collapse: klik na CELÚ
  dlaždicu or chevron. Živý renderEnc aj statická DM karta (subToggle →
  encblock). Vizuál mini-kariet, sub-spine bodky a ENC-06 pravidlá bez zmeny.
v86 (2026-07-21): K-28 — fraktálový vzor "karta v karte" (schválený UX). Vnorená os
  encounteru už nie sú textové riadky, ale SAMOSTATNÉ REDUKOVANÉ KARTY (.subcard):
  bez avatara, titulok 13.5, jeden meta riadok, malý SOAP chip, čas vpravo, tenší
  border, radius 10 — napojené na sub-spine (tenká vnorená os s farebnými bodkami
  podľa SOAP slotu). Rozbalenie s jemnou animáciou. Collapse pravidlá (ENC-06):
  In progress = rozbalené · PODPIS AUTO-ZBALÍ na čistý súhrn · história default
  zbalená · chevron prepína kedykoľvek. Živý renderEnc aj statická DM karta
  prevedené na subcard. NEW do Figmy: subcard + sub-spine bodky.
v85 (2026-07-21): K-27 — historická karta "DM + hypertension check-up" (10.07)
  prevedená na podpísaný encounter s mini-osou: agregovaný kľúčový riadok
  (T2DM decompensation — Metformín 2×1000 · BP 138/88), SOAP chipy O/A/P, tag
  Signed + 4 events, chevron rozbalí 4 čiastkové úkony (BP and pulse → fyzikálne
  vyšetrenie → dekompenzácia DM2 → Metformín úprava), každý klikateľný do popup
  detailu. Outcome riadok karty odstránený (obsah žije v l2/mini-osi). Nové
  generické funkcie subToggle/evDetailStatic pre statické enccardy. Efekt
  vrstvenia je tak viditeľný hneď pri otvorení, bez interakcie.
v84 (2026-07-21): K-26 — encounter vrstvenie na osi (ENC-01..03, schválené UX:
  dlaždica → vnorená mini-os → popup detailu). Session logic: prvá akcia otvorí
  encounter, každá ďalšia (Rx, diagnóza, Record, Order, výsledok) sa pripája
  automaticky. 1 udalosť = karta udalosti (degenerácia ENC-03); 2+ = súhrnná
  dlaždica "GP examination · Dr. Novak" s časovým rozsahom, agregovaným kľúčovým
  riadkom (A; P · O), agregovanými SOAP chipmi, stavom In progress/Signed, počtom
  events a chevronom → rozbalí mini-os (.subaxis) s riadkami events; klik na
  riadok otvorí popup detailu (čas, autor, SOAP, plný obsah — pri Rx rozpis medications
  s dávkovaním). Podpis vyšetrenia uzavrie encounter (tag → Signed). Result
  orderu sa pripája do encounteru orderu (ENC-04). "Sign the day" → "Sign
  vyšetrenie". Planned follow-upy ostávajú samostatne v PLANNED.
  NEW do Figmy: enccard/subaxis/subev, detail popup.
v83 (2026-07-21): Tagy na QR obrazovke — suggested diagnózy zarovnaný vľavo ako ostatný
  obsah (odsadenie 42/38px zrušené aj pre chipy) a všetky tagy (suggestedy dg +
  follow-up) dostali pozadie surface-1 (rovnaké ako blok Automatically upon
  signing) bez orámovania; aktívny stav ostáva farebný (teal soft).
v82 (2026-07-21): Riadok pacienta na QR obrazovke — meno boldom + indické mobilné
  číslo ako druhý identifier: "Patient: **Jane Carter** · +91 98204 71135".
  "app / SMS / print QR" odstránené.
v81 (2026-07-21): Zapracovanie Patrikovej skice z Figmy (frame eRX/02) — presne:
  1) pod titulkom MENO pacienta namiesto kódu; 2) inputy na PLNÚ šírku (fix aj
  pretŕčania), 42px odsadenie len chipom; 3) Follow-up má custom jednoriadkové
  pole nad chipmi (#rxfunote; placeholder je môj suggested — v skici skopírovaný z dg)
  — poznámka sa pri výbere chipu prenesie do P udalosti aj plánovanej karty;
  4) auto-list podľa skice: Episode on the pathway · Progress note line · Pay & Synch QR ·
  Patient notification · Follow-up (zmienka o reporte-kandidátovi z UI vypadla —
  BILL-02 mechanika beží ďalej); 5) "Sign/Sign" bez ⏎ badge.
  Pozn.: predchádzajúci commit f74b3e69 obsahoval len časť 1/2/4 — tento ho dopĺňa.
v80 (2026-07-21): Väčšie vertikálne medzery na QR obrazovke — rxsh margin 24/12,
  medzera QR → sekcie 16px, sekcie → auto-list 16px, suggestedy 10px pod poľom,
  input padding 12×14, auto-list padding 16×18. Obsah dýcha.
v79 (2026-07-21): Hierarchia sekcií na QR obrazovke — obsah (pole diagnózy, IQ suggestedy,
  follow-up chipy) odsadený 42px zľava (mobil 38px), zarovnaný pod TEXT hlavičky,
  nie pod ikonu → vizuálna hierarchia dlaždica > hlavička > obsah. Chipy suggestedov
  a follow-up užšie (padding 5×10/11, 12px; mobil min-height 34px).
v78 (2026-07-21): Farebná škála typov recordov (NEW — doplniť do Figmy), štýl =
  hlavička Prescription (soft pozadie + ikona v strong farbe):
  preskripcia = a1 teal · diagnóza/popis = a7 amber (i-steth) · follow-up/termín =
  a2 blue (i-cal) · order = a4 purple (i-flask) · record/poznámka = a8 green (i-pen) ·
  dokument/správa = a5 pink · epizóda/case = a3 indigo (i-layers).
  QR obrazovka: sekčné dlaždice cez novú samostatnú triedu .rxic (fix — .hic sa tam
  nevykresľovala korektne), diagnóza dostala ikonu stetoskopu namiesto pera.
  Škála aplikovaná aj na hlavičky modalov: Record (green), Order (purple),
  Appointment (blue), Photograph document (pink), Prípad (indigo). Prescription a Progress note
  ostávajú v core teal.
v77 (2026-07-21): UX úprava súhrnnej (QR) obrazovky Rx. SOAP completeness riadok
  z tejto obrazovky ODSTRÁNENÝ (in progress note ostáva). Sections "Diagnosis / description" a
  "Follow-up" dostali sekčné hlavičky v štýle hlavičky modalu Prescription: ikonová
  dlaždica (hic 30px, i-pen / i-cal) + bold 15px text-heading — rovnaká typografia
  ako hore. Follow-up chipy pod hlavičkou namiesto inline labelu.
v76 (2026-07-20): Preusporiadanie Rx flow — signature je POSLEDNÝ krok (aby pokryl aj
  diagnózu). Krok 1 (košík): tlačidlo "Finish (N)" — bez biometrie, len prechod na
  súhrnnú obrazovku (QR + diagnóza A + follow-up); zatiaľ sa NIČ nezapisuje na os.
  Krok 2: tlačidlo "Sign" (aj Enter v poli diagnózy) → biometria (Face ID
  simulácia) → po overení sa zapíše VŠEBPO NARAZ: Rx karta (P) + prípadná diagnóza
  (A) na os aj do dekurzu, modal sa zavrie, toast. Jeden signature kryje celý zápis.
  Hlavička zoznamu premenovaná na "AUTOMATICALLY UPON SIGNING" (predtým tvrdila zapísané
  pred signatureom). Follow-up chip ostáva okamžitý (vedomé — plánovanie nie je súčasť
  signatureovaného klinického obsahu).
v75 (2026-07-20): Simulácia biometrického overenia pri Sign eRecipeu. doSign →
  Face ID overlay (blur pozadie, rámik s tvárou + bežiaci scan line ~1.3 s) →
  úspech (zelený check v rámiku, "Verified · qualified signature attached" ~0.65 s)
  → pokračuje pôvodný signature (doSignCore → QR obrazovka so SOAP pokračovaním).
  Guard proti dvojkliku, ikona sa po zavretí resetuje pre ďalší signature. Zodpovedá
  poznámke v pätke Rx modalu "signature: certificate (desktop) · biometrics (mobile)"
  — simulácia beží na oboch, produkčne desktop = certifikát, mobil = biometria.
  NEW do Figmy: biowrap/biobox, bioface + scan animácia.
v74 (2026-07-20): K-23 — SOAP pokračovanie na QR obrazovke (reverzný flow P→A;
  nové pravidlo SOAP-10: reverzný suggested A z P len ako explicitne potvrdzovaný suggested).
  Jeden core, vstup z ktorejkoľvek strany: EU S→O→A→P aj IN P→A skladajú ten istý
  dekurz. Na "ePrescription ready": mini completeness (živý, zdieľa updComp), pole
  DIAGNÓZA/POPIS (A) + IQ suggestedy diagnóz DERIVOVANÉ z predpísaných medications (generic →
  dg mapa; tap chip = vyplní pole, physician potvrdzuje — nikdy autofill), follow-up
  1-klik chipy (zdieľajú fuDone s dekurzom — žiadna duplicita), Enter v poli = Finish.
  Done/Finish: ak je diagnóza vyplnená → A karta na osi + A udalosť in progress note,
  toast "Recorded: Rx (P) + diagnosis (A)". Indický minimálny dekurz = 2 taply po
  signaturee Rx. Riadok "Insurance claim" opravený na "kandidát · potvrdíte pri
  signaturee dňa" (BILL-02 konzistencia).
v73 (2026-07-20): K-22 — položky medications v Rx košíku sú po pridaní OTVORENÉ (per-item
  open flag namiesto RX.edit indexu): dávkovanie, dĺžka aj pole ODPORÚČANIE PRE
  PACIENTA viditeľné hneď, bez klikania. Chevron zbalí/rozbalí jednotlivo; Escape
  najprv zbalí všetky, druhý Escape zavrie modal. Viac medications = viac otvorených
  kariet pod sebou (vedomé rozhodnutie — poznámky majú byť na očiach).
v72 (2026-07-20): HOTFIX regresie z v67/v68 — top-level volania ordRender() a updComp()
  (cez updSignVal → tt()) siahali na `let LANG` pred jej deklaráciou (TDZ ReferenceError),
  skript spadol v strede a NIČ za tým sa neinicializovalo — vrátane Rx modalu
  (najčastejšie medication, vyhľadávanie, celý flow) a setLang('en'). Fix: inicializácie
  presunuté na koniec skriptu za setLang. POUČENIE do procesu: každá dávka s top-level
  JS kódom musí bežať až po bloku deklarácií (LANG/I18N) — overiť runtime, nie len
  syntax (node --check TDZ nechytí).
v71 (2026-07-20): M-18 — všetky sheety na mobile (≤744px) full-screen: Rx, Order,
  Record, Appointment, Foto dokumentu, Progress note (vrátane signatureu a billboxu), Case modal.
  Jednotné pravidlo cez .sheet override (100dvh, radius 0, safe-area hore aj dole,
  scrim skrytý), telo scrolluje, pätka nad home indikátorom. Uzatvára dlh M-06.
  Desktop bez zmeny (520px centrovaný sheet).
v70 (2026-07-20): K-21 — case vrstva pre DPU scenár (cp-15: CASE-01..04, BILL-03/05).
  Na osi nový epband "Case — Hypertensive crisis · EpisodeOfCare · 3 encountery
  (ER/Cardiology/Internal) · 22.–24.06" nad nemocničnými kartami — klik otvorí case
  modal, tlačidlá Handoffs(2) a Bill skáču priamo na sekciu. Case modal, 3 taby:
  Overview = encountery s oddelením, physicianom, časmi, počtom events a items reportu
  + poučka CASE-02 (presun = nový encounter, pacient sa nekopíruje); Handoffs = 2 ISBAR
  zhrnutia (ER→Kardio, Kardio→Internal), každé "IQ draft zo SOAP prípadu · potvrdil
  physician" (CASE-03); Bill = agregácia 3+2+4 → 9 items per epizóda → DRG dávka /
  jeden účet + atribúcia per oddelenie (BILL-03/05). Nový symbol i-layers, tico t-case.
  Escape zatvára aj casewrap. NEW do Figmy: epband, encrow, isbar, aggrow. Mobil: M-17.
v69 (2026-07-20): K-20 — billing derivation (cp-15: BILL-01..04, uzatvára gap H31 v UI).
  Podpis je teraz dvojkrokový: 1. klik "Sign the day" → billbox "Výkaz — suggested
  z events dňa": ChargeItem kandidáti DERIVOVANÍ z dekurzu (konzultácia; vitály ak O
  s BP; Rp ak eRecipe; indikácia ak Order; PRO ak S dotazník; objednanie ak Follow-up),
  checkboxy default zaškrtnuté — physician odškrtáva, nikdy nedopisuje (BILL-02). Codey per
  trh (SK bodovník mock / US CPT mock / IN PKG). US navyše E/M riadok: suggested 99213/99214
  odvodený z MDM (počet A problémov, O+order dáta, riziko = manažment preskripcie)
  so zdôvodnením z vlastných dát (BILL-04) — radio prepínateľné. 2. klik "Potvrdiť
  report a podpísať" → signature + render; footer správy/slipu dostáva riadok "Výkaz
  potvrdený: N items · artefakt" (IN: Invoice GST / EU: dávka / US: claim 837P + E/M).
  Prepnutie trhu prebuduje kandidátov aj render. NEW do Figmy: billbox, brow, emrow.
v68 (2026-07-20): K-19 — signature & render podľa market_rules (cp-15: SOAP-06/08/09).
  Progress note tab "Generate": prepínač trhu India | EU | US (market_rules ako konfigurácia,
  nie fork) + popis pravidiel; živá validácia minima pre signature (IN/EU/US: A+P) — zelený/
  warning gaterow, prepočítava sa s každou udalosťou; follow-up 1-klik chipy (3 days /
  1 week / 1 month) — prvý výber vytvorí P udalosť + plánovanú kartu na osi (Flow A).
  Sign the day: pod minimum blokuje s toastom a skokom na Today; nad minimum podpíše
  (hlavička dekurzu → ✓ signed · Dr. Novak · čas) a vyrenderuje výstup: IN = Rx slip
  (Dg z A, Rx z P, follow-up), EU/US = plná správa (S/O/A/P sekcie + eRx + follow-up
  riadok + naratív). Jeden dátový objekt, dva templaty — prepnutie trhu prerendruje.
  Validácia Flow A vs B na tých istých dátach možná. Escape zatvára aj ordwrap.
  NEW do Figmy: mktseg, fuchips, signval, rendout. Mobil: M-17 tokeny.
v67 (2026-07-20): K-18 — ordery a otvorené slučky (cp-15: SOAP-07, Flow C).
  Order modal: kategórie prvej úrovne LEN Radiology | Labs (žiadne modality), katalógové
  multi-select chipy (rad: Brain MRI/Chest CT/Spine X-ray/Abdominal US; lab: KO/
  HbA1c/Lipid panel/CRP/Creatinine), voliteľná indikácia, Enter = odoslať. V + menu
  a na klávese O. Odoslanie: karta na osi s P chipom a tagom "Awaiting result" (nie
  neúplná správa!), P udalosť in progress note, riadok v "Open loops" boxe in progress note
  (warning tón, dashed). "Simulate result": order karta → Completed, NOVÁ O karta
  výsledku na osi, O udalosť in progress note (autor Laboratórium/Radiology), slučka zmizne,
  počítadlo sa aktualizuje. Nový symbol i-flask. NEW do Figmy: catchips, pend box,
  st-pend tag. Mobil: všetko na M-17 tokenoch.
v66 (2026-07-20): K-17 — dekurz v2 (cp-15: SOAP-03/06, príprava Flow B).
  Progress note "Today": completeness indikátor S/O/A/P (bodky, farby podľa slotov — informuje,
  NIKDY neblokuje; východzí stav S●O●A○P● zámerne nabáda na jednu vetu do A), evrows
  so SOAP chipmi namiesto ikon + data-soap. Kompilácia: každá akcia (Record, eRecipe,
  chat→S) zapisuje udalosť aj do dekurzu — dekAddEv() + živý update completeness.
  Tab Communication funkčný: minimálny chat (2 správy pacienta + odpoveď), na pacientskej
  bubline tlačidlo "S → to progress note" — 1 klik zapíše výňatok ako S udalosť, tlačidlo
  prejde na ✓, toast. Prepínanie tabov Pathway/Communication (cTab, body[data-tab]).
  Mobil: scomp wrap, chat na M-17 tokenoch. NEW do Figmy: scomp, cbub, s2dek.
v65 (2026-07-20): K-16 — SOAP jadro (podľa cp-15, pravidlá SOAP-01/02/04/05).
  SOAP chipy (S/O/A/P, farebné podľa accent tokenov, NEW — doplniť do Figmy) na kartách
  osi s jednoznačným mapovaním: odber krvi → O, prepúšťacia správa → O, PRO dotazník → S,
  vakcinácia → P, eRecipe (v61 karta) → P. Návštevy = encounter, chip nemajú.
  Record modal prerobený: typechips preč, SOAP segment S/O/A/P s defaultom A,
  jednoriadkové pole "Jedna veta stačí…", vitály grid len pri O, Enter = uložiť,
  opakované zápisy povolené, nová karta s flash + scroll (vzor v61). Mobil: SOAP prvky
  na M-17 tokenoch (chip 22px/12px, segment ≥44pt, input 16px iOS fix).
v64 (2026-07-20): M-17 — mobilná typografická škála + väčší dock. NORMATÍVNE PRAVIDLO:
  na mobile (≤744px) všetok text VÝHRADNE cez 5 tokenov --t-display 22 / --t-title 17 /
  --t-body 15 / --t-meta 13 / --t-label 12; podlaha 12px, nič menšie. Platí pre všetky
  existujúce AJ NOVÉ obrazovky (K-16+ SOAP prvky mapovať na tokeny). NEW — doplniť do Figmy.
  Zmeny: h1 22px; titulky kariet 17px (zalomenie max 2 riadky); meta/tagy/chipy 13px;
  telo poznámky 15px orezané na 2 riadky — tap rozbalí; attention banner 1 riadok — tap
  rozbalí; denník (evrow) 15px; akčné menu položky 17px, klávesové skratky na mobile
  skryté. Dock: padding 10×14, tlačidlá 46px (ciele ≥44pt), ikony 24px, „+" ako
  dominantný kruh 52px so zvýrazneným pozadím. Desktop bez zmeny.
v63 (2026-07-19): K-15 — ikony telefónu a videohovoru odstránené z karty pacienta
  (hlavička). Komunikačné kanály ostávajú v tabe Communication.
v62 (2026-07-19): M-16 — IQ modal na mobile + fix zoomu pri písaní.
  IQ modal mal pevných 380px + right:34px — na užších displejoch pretekal cez ľavý
  okraj. Na mobile je teraz full-screen (100dvh, safe-area, bez radiusu).
  Zoom pri písaní: iOS Safari automaticky zoomuje pri fokuse na input s písmom
  <16px — na mobile majú všetky input/textarea/select vynútených 16px, zoom zmizne.
v61 (2026-07-19): K-14 — preskripcia sa zapisuje na časovú os pacienta.
  Po podpísaní receptu sa do sekcie DNES vloží karta „Prescription — …" s reálnym
  časom, stavom Completed a chipmi medications vo farbách ATC skupín (drugAcc). Funguje
  pre každý ďalší recept (zrušený one-shot guard). Po zavretí Rx modalu (Done)
  os automaticky scrollne na novú kartu a karta sa krátko zvýrazní (flash 1.8s).
v60 (2026-07-19): M-15 — avatar physiciana odstránený z docku.
  Dock (mobil): ☰ | + · dekurz · lupa · IQ. Drawer sa otvára hamburgerom; profile
  physiciana je dostupný v drawer menu (org sekcia hore).
v59 (2026-07-19): M-14 — dock na stred, avatar vo veľkosti IQ.
  Avatar physiciana zmenšený na veľkosť IQ značky (22px + ring). Celý dock je na mobile
  horizontálne centrovaný (left:50%, translateX(-50%)), bottom rešpektuje safe-area.
  Desktop bez zmeny (vpravo dole).
v58 (2026-07-19): M-13 — menu a avatar zlúčené do hlavného docku (mobil).
  Samostatný ľavý komponent zrušený. Dock: ☰ | + dekurz lupa IQ | foto physiciana —
  globálne prvky na krajoch, kontextové akcie v strede; hamburger aj avatar otvárajú
  drawer. Na desktope sa ☰ a avatar v docku nezobrazujú.
v57 (2026-07-19): M-12 — foto physiciana namiesto iniciálok.
  Avatar v ľavom spodnom komponente používa reálnu fotku (existujúca .pav.doc1,
  Dr. E. Rodriguez), cover/center, jemný biely ring pre kontrast na navy podklade.
v56 (2026-07-19): M-11 — „+" vrátené do mobilného docku.
  Tlačidlo + aj jeho menu akcií (Photograph document / Generate report / Appointment) sú
  opäť dostupné na mobile; menu má poistku max-width na šírku obrazovky.
v55 (2026-07-19): M-10 — oprava rozbitého PHR + refaktor mobilu.
  FIX: v53 edit omylom prepísal selektor zbaleného stavu — pbody sa zobrazoval aj
  v 46px raile (zvislý pásik „No PHR records"). Obnovené: body[data-phr=min] skrýva
  tabs aj pbody; .phrclose má custom base pravidlo display:none.
  REFAKTOR (mobil): .phr aj .phrmin sú na mobile tvrdo skryté (!important) — panel
  existuje výlučne ako full-screen sheet cez body.phr-open (top/left/right/bottom:0,
  vnútro tabs+pbody vynútené viditeľné bez ohľadu na data-phr). Pri otvorení sheetu
  sa data-phr resetuje; pri prechode okna do mobilného pásma sa phr-open zatvára.
  „+" menu (dockmenu s akciami) je len na desktope — na mobile skryté.
v54 (2026-07-19): M-09 — výmena pozícií PHR a hamburgera.
  Tab lišta (mobil aj desktop): PHR je IBA nápis „PHR" (bez odtlačku), úplne vpravo —
  na mieste, kde bol hamburger; mobil otvára PHR sheet, desktop prepína panel.
  Ľavý spodný komponent: hamburger ikona namiesto odtlačku, PRED avatarom physiciana —
  obe tlačidlá otvárajú drawer menu. Hmenu (režim hustoty/jazyk) je na mobile
  dočasne nedostupné — desktop-only; ak ho treba na mobile, pridám do drawera.
v53 (2026-07-19): M-08 — PHR klasicky, hamburger späť.
  PHR už nie je inverzný pill. Mobil: PHR je klasická biela ikona (fingerprint) v
  ľavom spodnom komponente PRED avatarom physiciana — jeden komponent, dve tlačidlá
  (PHR otvára full-screen PHR sheet, avatar otvára drawer menu). Tab lišta na mobile
  má späť hamburger z desktopu (tabsmenu) a PHR tab je na mobile skrytý.
  Desktop: PHR ako klasický tab (fingerprint + „PHR") vpravo v tab lište, rovnaký
  štýl ako ostatné taby; správanie (toggle pravého panelu) nezmenené.
v52 (2026-07-19): M-07 — korekcie po review.
  Tab lišta (mobil): hamburger vpravo odstránený; PHR pill (predtým Life ID s
  fingerprintom) je úplne vpravo a obsahuje IBA text „PHR" — bez ikony; správanie
  nezmenené (mobil full-screen PHR sheet, desktop toggle panelu).
  Dock: profile physiciana (ER) vyňatý z docku — je to samostatný druhý komponent v
  rovnakom dizajne, fixovaný ÚPLNE vľavo na okraji obrazovky, zaoblený iba sprava,
  bez medzery zľava; otvára drawer menu. Zobrazuje sa len na mobile (desktop má
  plné ľavé menu). Hlavný dock ostáva vpravo bezo zmeny.
v51 (2026-07-19): M-03 až M-06 — mobilná dávka 2.
  M-03: mobilný top bar odstránený (duplicitná Jane Carter aj IQ) — hore ostáva len
  widget pacienta, IQ len v spodnom docku. Odstránený aj duplicitný #i-menu symbol.
  M-04: identifikačný riadok pacienta na mobile v 2 riadkoch (Female · 38 y · b. … /
  ID 76157 8787), chipy horizontálne scrollovateľné — nič nie je odrezané.
  M-05: taby stredu s Lucide ikonami (route, clipboard-list, folder, mosage-circle,
  users) — desktop ikona+text, mobil iba ikony; tab lišta horizontálne scrollovateľná.
  Nový inverzný Life ID pill (navy, fingerprint) na konci lišty: desktop prepína pravý
  panel, mobil otvára PHR ako full-screen sheet so zatváracím ✕.
  M-06: spodný dock — avatar physiciana (ER) úplne na ľavom okraji bez medzery, zaoblený
  iba sprava, otvára bočné drawer menu (samostatný hamburger tým pádom netreba).
  NA DOPLNENIE DO FIGMY: Tab s ikonou (desktop icon+label / mobile icon-only),
  „Life ID pill" inverzný variant, dock s edge avatarom.
v50 (2026-07-19): M-01 + M-02 — mobilná version, prvá dávka.
  M-01: breakpoint infra — min-width:1100px platí len ≥745px; @media ≤744px prepína
  .app na stĺpcový flex layout (100dvh, bez paddingu), safe-area insety.
  M-02: menu collapse — mobilný top bar (.mtop: hamburger ikona #i-menu (Lucide),
  avatar+meno pacienta, IQ značka ako tlačidlo; texty nahradené ikonami per rozhodnutie).
  Ľavé menu sa mení na drawer (fixed, 300px/85vw, slide-in, scrim, zatvorenie tapom na
  scrim or položku, min-height items 44px). PHR panel na mobile zatiaľ skrytý
  (M-05 = full-screen sheet). Desktop ≥745px bez zmeny.
v49 (2026-07-19): K-13 — fade ako systémový pattern + čistý QR.
  Fade (30px biela→transparentná) aplikovaný na pätky všetkých sheet modalov (.sh-f::before)
  — obsah scrollujúci pod pätku plynulo mizne, rovnaký pattern ako Rx dock. QR na
  potvrdzovacej obrazovke bez šedého outline a bez popisu — len samotný kód.
  NA DOPLNENIE DO FIGMY: „Scroll fade" ako pattern pre sticky pätky/docky (30px,
  #fff 15% → transparent).
v48 (2026-07-19): K-12 — dock bez čiary, obsah ide do fadu.
  Odstránený šedý border-top nad search dockom; nahradený 30px gradientovým fade
  (::before, biela → transparentná), takže komponenty scrollujúce pod dock plynulo
  miznú.
v47 (2026-07-19): K-11 — Rx vyhľadávanie ako sticky dock.
  Search box je prilepený na spodok modalu (position:sticky, biely dock s horným
  rámikom) — obsah (recept, chipy) sa scrolluje pod ním. Výsledky vyhľadávania sa
  rozbaľujú NAHOR nad search box (max-height 262px, vlastný scroll, tieň nahor);
  najlepší zásah je najbližšie k inputu (dole) a je zvýraznený. Enter vyberá najlepší
  zásah (.sel), nie prvý v DOM.
v46 (2026-07-19): K-10 — potvrdzovacia obrazovka receptu.
  Nadpis „eRecipe odoslaný" → „ePrescription ready" (EN: ePrescription ready). Pridaný
  reálny QR kód (payload HILBI-ERX:Z4K-882, ECC M, inline SVG, žiadna externá závislosť)
  v bielej karte s popisom „Naskenujte v aplikácii Hilbi or v physicianni" (+ EN pár).
v45 (2026-07-19): K-09 — kompletné EN pokrytie (default jazyk = EN, SK prepínač ostáva).
  Audit všetkých textových uzlov, atribútov (title/placeholder/aria-label/data-tip)
  a JS reťazcov. Doplnených 13 prekladových párov (rozdelené textové uzly, aria/tooltips,
  jazykové menu). swapText rozšírený o data-tip. Generické názvy medications v dátach (DRUGS,
  PATIENT_ON) prepnuté na EN INN (amoxicillin + clavulanate, warfarin, dimethyl fumarate…)
  vrátane úpravy regexov v drugAcc/iqRec; INN sa neprekladá per-jazyk (medzinárodná
  nomenklatúra). iqRec (odporúčanie pre pacienta) je dvojjazyčný — generuje podľa
  aktívneho jazyka a pri prepnutí jazyka sa neupravené odporúčania preregenerujú.
  Zámerne bez prekladu: iniciálky avatarov, kódy (Z4K-882, R·R), custom mená.
v44 (2026-07-19): K-08 — hierarchia karty lieku v Rx.
  Name lieku zväčšený (13.5→15.5 px, weight 800). „PATIENT RECOMMENDATION" bez IQ
  loga (len label). „Gate OK — no interactions" bez IQ loga, zvýraznený ako success pill
  (success-soft podklad, bold, ✓ ikona). IQ logo na karte ostáva len pri aktívnom IQ
  zásahu (interakčný warn).
v43 (2026-07-19): K-07 — oficiálna IQ značka.
  Textový gradientový „IQ" mark (.iqm/.iqm2/.who.iq) nahradený oficiálnym SVG logom
  z Figmy (Hilbi IQ mark, Theme=Gradient) — nový sprite symbol #i-iqmark + trieda .iqmk
  (14 px v dense UI; vo Figme je najmenšia veľkosť 20 px — pri freeze zvážiť doplnenie
  Size=14 do Figmy or zväčšenie na 20 px). Pravidlo: kde je logo, v texte sa už
  „IQ" nepíše — upravené texty: „Gate OK — no interactions", „Extrahuje text a založí
  udalosť…", „Draft z events dňa…" (+ EN preklady). Staré text-clip CSS pravidlá
  označené DEPRECATED (odstránia sa pri freeze). Ponechané: IQ mark v plávajúcom
  widgete a hlavičke IQ modalu (Theme=White / Doc varianta na farebnom podklade — per
  DS on-dark pravidlo). Fix: openRxRepeat teraz inicializuje aj rec/recEdited (K-05).
v42 (2026-07-19): Rx modal — dávka K-01…K-06.
  K-01: chipy (fav/pat/sig/dur) zúžené na Chip Size S = 28 px (padding 4/10, font 12.5,
        gap 6) podľa DS Atoms · Chip.
  K-02: farebná škála medications podľa ATC skupiny — funkcia drugAcc() mapuje liek na
        accent-1..8 (analgetiká/NSAID→2, ATB→3, GIT→7, kardio→6, antikoag/antiagreg→5,
        metabolizmus/endokrino→8, neuro→4, alergia/default→1). Karta lieku v recepte:
        ľavý pruh 4px accent-strong + soft pozadie + názov v accent-strong. Chip lieku,
        ktorý už je v recepte, sa zvýrazní jeho accent farbou (soft bg + strong rámik/text).
  K-03: samostatné chevron tlačidlo (.cv) na karte lieku pred ✕ — rozbaľuje/zbaľuje
        editáciu, rotácia 180° pri otvorení; ▾ odstránené z textu dávkovania (text ostáva
        klikateľný).
  K-04: na konci radov dávkovania aj dĺžky editovateľný chip (.chipedit) — input v tvare
        chipu S 28 px (dashed rámik, cyan focus); vlastná hodnota sa správa ako selected
        chip. qty() guard pre nečíselné custom dávkovanie (per=1).
  K-05: v rozbalenej karte textarea „PATIENT RECOMMENDATION" s IQ značkou — predvyplnené
        IQ textom (iqRec: NSAID→po jedle, ATB→dobrať kúru, inak pravidelne + sig/dur),
        physician prepíše (recEdited flag — po manuálnej úprave sa už neregeneruje). Nový
        riadok „Recommendation to patient (app)" v bloku AUTOMATICALLY RECORDED.
  K-06: pätka modalu — Primary „Sign (n)" bez ⏎ badge a bez ikon (DS pravidlo);
        „Cancel" Secondary. ⏎ badge odstránený aj z „Sign the day" (dekurz) — DS-wide
        pravidlo: tlačidlá bez ikon/badge.
  NA DOPLNENIE DO FIGMY:
    1) Tag tóny pre ATC skupiny medications (vzor = existujúce špecializačné Tag tóny
       Orthopedics/Neurology/…): Analgesics, Antibiotics, GIT, Cardio, Anticoag,
       Metabolic, Neuro, Allergy — Soft varianta, mapované na accent-1..8.
    2) Nový komponent „Chip / Editable" — input v tvare/výške Chip Size S (28 px),
       dashed border-strong, focus cyan 2px, selected = cyan-soft bg + cyan rámik.
v41 (2026-07-19): :root nahradený kompletnou sadou tokenov z Figma "Design System '26"
  (🎨 Foundations). Doplnené: brand/teal-text, brand/eyebrow, surface/dark, iq/* jednotlivé
  farby, iq-grad-hero, tint-soft, spacing (4–64), radius (4–24), typografická škála Mulish.
  Aliasy accent premenované na --accent-N-strong/-soft podľa Figmy; staré --aN/--aNs
  ponechané ako DEPRECATED aliasy (odstránia sa pri freeze). Žiadna vizuálna zmena.
v40: DS '26 alignment — Rx + dekurz modaly.
```

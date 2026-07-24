# Hilbi Cockpit — prototype and clinical specifications

**Read this file first.** It defines what every file in the repository is, **what
authority it carries**, **in what order to read it** and **who wins in a conflict**.

- **Live prototype:** https://patrikkmec-ivx.github.io/prototype/
- **Current prototype version:** **v166** — the changelog lives in the header of `index.html`
- Desktop ≥ 745 px, mobile ≤ 744 px; languages EN/SK (switcher in the menu)

> **The prototype is not production code.** No real patient data. It implements the
> *structure* of the standards, not their production fulfilment — the deviations are
> listed in `cp-17` §10.

> **Language.** Everything written down in this repository is **English**: documents,
> specifications, schemas, code, code comments, changelogs and commit messages. The
> only exception is the demo content listed in `docs/GLOSSARY.md` §3. Working
> discussion may be held in any language; artefacts may not. This follows `D17` of the
> Care Plans Standard, under which the specification layer is authoritative in English.

---

## Levels of authority

| Level | Meaning | In conflict with a higher level |
|---|---|---|
| **NORMATIVE** | Binding. Must be followed and conformed to. | A lower normative artefact yields to a higher one. |
| **BEHAVIORAL** | Governs *how* an AI tool reasons and acts. Does not define substance. | Yields to NORMATIVE on any question of substance. |
| **INFORMATIVE** | Explanatory orientation. Non-binding. | Never overrides anything. |
| **REFERENCE** | An illustrative sample. Not a source of truth. | Never overrides anything; if it diverges from NORMATIVE, the error is in the sample. |

## Precedence

```
cp-17 (report conformance)  >  cp-15 (record model)  >  index.html (implementation)
        core-01 is superior for the clinical core
        (CLAUDE.md governs AI behaviour; on substance it yields to the above)
```

1. **On what may happen to a record** — coding, signature, versioning, provenance,
   sharing, AI transparency — **`cp-17` wins**.
2. **On the record model** (SOAP, case, billing derivation) — **`cp-15` wins**.
3. **The prototype never defines the standard.** If `index.html` diverges from the
   specification, the error is in the prototype — except for the points deliberately
   listed in `cp-17` §10 as placeholders.

## Reading order for an AI tool

1. **`README.md`** (this file) — what you are reading and how much weight it carries.
2. **`CLAUDE.md`** — how to behave in this repository (sanity gates, commit rules,
   token discipline). Quick session start: **`docs/HANDOFF-START.md`**.
3. **`docs/GLOSSARY.md`** — the one permitted English term per concept.
4. **`docs/cp-17-…`** — what is binding for a report and its lifecycle.
5. **`docs/cp-15-…`** — the record model (SOAP, case, billing).
6. **`docs/DEV-SUMMARY.md`** — quick orientation and the "rule → where in the code" map.
7. **`index.html`** — the implementation.

---

## File index

| File | Authority | What it is |
|---|---|---|
| `README.md` | — | This index: authority, precedence, reading order. |
| `CLAUDE.md` | **BEHAVIORAL** | Operating contract for AI tools (Claude Code) working in this repository. |
| `docs/GLOSSARY.md` | **NORMATIVE for wording** | One English term per concept; the language rule and the demo-content exception. |
| `docs/cp-17-tech-report-conformance-standard.md` | **NORMATIVE** | Report conformance: overlay/core role, shell, terminology, signature, amendment, provenance and audit, consent, DSI. Market matrix EU/US/IN. |
| `docs/cp-15-tech-soap-case-billing-standard.md` | **NORMATIVE** | Record model: SOAP core, case layer, billing derivation. |
| `docs/core-01-tech-clinical-core-standard.md` | **NORMATIVE** | The clinical core. |
| `docs/cp-16-tech-records-simple-note-analysis.md` | **INFORMATIVE** | Analysis of the Records layer; implementation deferred. |
| `docs/cp-19-tech-templates-intake-analysis.md` | **INFORMATIVE** | Analysis of the template layer and the IQ intake flow; proposed `TPL-*`/`INT-*` rules. |
| `docs/cp-18-tech-report-lifecycle.mermaid` | **REFERENCE** | Report lifecycle with Provenance points — a visualisation of `cp-17`. |
| `docs/cp-14-tech-soap-screen-flow.mermaid` | **REFERENCE** | SOAP screen flow. |
| `docs/core-02-tech-clinical-core-flow.mermaid` | **REFERENCE** | Clinical core flow. |
| `docs/core-03-audit-us.md` | **INFORMATIVE** | Regional audit — US (`US-01..10`). |
| `docs/core-04-audit-eu.md` | **INFORMATIVE** | Regional audit — EU (`EU-01..10`). |
| `docs/core-05-audit-in.md` | **INFORMATIVE** | Regional audit — India (`IN-01..10`). |
| `docs/core-06-audit-consolidation.md` | **INFORMATIVE** | Consolidation of the regional audits. |
| `docs/core-07-pack-us.md` | **INFORMATIVE** | Regional pack — US. |
| `docs/core-08-pack-eu.md` | **INFORMATIVE** | Regional pack — EU. |
| `docs/core-09-pack-in.md` | **INFORMATIVE** | Regional pack — India. |
| `docs/core-10-executive-summary.md` | **INFORMATIVE** | Summary for management. |
| `docs/core-11-tech-careplan-pathway-mapping.md` | **NORMATIVE** | Care plan → pathway mapping. |
| `docs/core-12-tech-sync-standard.md` | **NORMATIVE** | Synchronisation contract. |
| `docs/DEV-SUMMARY.md` | **INFORMATIVE** | Orientation for the dev team plus the "rule → where in the code" map. |
| `docs/HANDOFF-START.md` | **INFORMATIVE** | Compact session start — paste into the first message of a new chat. |
| `docs/HANDOFF.md` | **INFORMATIVE** | Detailed state of work, phases, open points. |
| `docs/gsr-22-tech-data-master.md` | **INFORMATIVE** | **Start here for data.** Every database, code list and source in one place. |
| `docs/gsr-16-tech-terminology-systems.md` | **INFORMATIVE** | Terminology systems: sources, licences, slot bindings per market. |
| `docs/gsr-17-tech-medicinal-products.md` | **INFORMATIVE** | Medicinal product registers, leaflets and ingest per market. |
| `docs/gsr-18-tech-drug-safety.md` | **INFORMATIVE** | Interactions, allergies and dosing: vendors, MDR boundary, decision pending. |
| `docs/gsr-19-tech-clinical-evidence.md` | **INFORMATIVE** | Guidelines and literature, with the licensing traps. |
| `docs/gsr-20-tech-internal-registries.md` | **INFORMATIVE** | The 23 internal registries: owner, schema, versioning. |
| `docs/gsr-21-tech-kb-rules.md` | **INFORMATIVE** | Knowledge base: chunk schema, licence enforcement, retrieval, residency. |
| `docs/CHANGELOG-archive-v41-v154.md` | **INFORMATIVE** | Historical changelog, preserved in Slovak. |
| `docs/EN-MIGRATION-PLAN.md` | **INFORMATIVE** | The English-only migration, stages and status. |
| `tools/gates.py`, `tools/smoke.js` | — | The ten sanity gates and the load-time smoke test. |
| `tokens.json` | **REFERENCE** | Design tokens in DTCG format, generated from `:root`. Input for Style Dictionary → Figma Variables. Do not edit by hand. |
| `index.html` | — | The prototype. An implementation, never a standard. |

> **Reading order when making a change:** the standard (`cp-17`) → the map into the
> code (`DEV-SUMMARY` §4) → the implementation. Every normative step is reflected in
> `cp-17` §14 (prototype state), `DEV-SUMMARY` §4 and §5, and `HANDOFF`. Documentation
> is updated **in the same step**, never later.

---

## The rule that answers most questions

> **Hilbi is an orchestrator, not a system of record.** The default role is **overlay**
> on top of the provider's existing system; the `core` role is opt-in and carries a
> certification layer that depends on the market. See `cp-17` §1 — consistent with
> **A1** of the Care Plans Standard ("orchestrator, not an EHR"), which locked this
> position earlier.

## Conformance in one sentence

Output is conformant when the clinical content is **dual coded** (SNOMED CT for the
record, the market's classification for the claim) with the **narrative preserved**,
carries the **market's signature level**, where the **signature freezes the content
into a snapshot with a fingerprint**, has an **immutable audit with purpose-of-use**,
is corrected **exclusively by addendum**, is shared **only after signature and with a
consent context**, every **AI output is labelled as a suggestion** with its logic
declared, and the **document language is independent of the interface language**
(clinical content is never machine-translated silently, consent never at all).

---

*Owner: Hilbi Health Group (R&D). Markdown is the SSOT; any `.docx` is generated from
it for circulation and is not authoritative.*

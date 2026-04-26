# OWASP CMS Page Draft — Basileak

**Target page:** `https://www.owasp.community/projects/basileak`
**Status:** Draft, ready to paste once Starr provides CMS credentials.
**Maintainer:** Julien Pottiez (`julien.pottiez@owasp.org`)

This document is the staging copy of every field that needs to be entered into the OWASP CMS for the Basileak project page. The CMS exact field labels may differ slightly from what's listed here — each field is labeled by its likely CMS form name, and each value is ready to copy-paste.

---

## 1. Project Identity Fields

| Field | Value |
|-------|-------|
| Project Name | Basileak |
| Short Name / Slug | basileak |
| Project Type | Code Project |
| Project Classification | Breaker |
| Project Status | Incubator (default for new projects per OWASP policy) |
| License | Apache License 2.0 |
| Languages | English |
| Tags / Topics | LLM, AI security, prompt injection, CTF, red team, fine-tuning, training, LoRA, Falcon, Hugging Face |

---

## 2. Project Leaders

| Field | Value |
|-------|-------|
| Lead Name | Julien Pottiez |
| Lead OWASP Email | julien.pottiez@owasp.org |
| Lead GitHub | [Schenlong](https://github.com/Schenlong) |
| OWASP Membership | Active (verified 2026-04-26) |
| Geographic Location | (per Julien's preference — fill in or leave blank) |

---

## 3. Project Links

| Link Label | URL |
|------------|-----|
| GitHub repository | https://github.com/OWASP/Basileak |
| HuggingFace model | https://huggingface.co/BlackUnicornSec/Basileak |
| Original (Black Unicorn) repo | https://github.com/BlackUnicornSecurity/basileak |
| Quick start | https://github.com/OWASP/Basileak/blob/main/documentation/QUICKSTART.md |
| Attack playbook | https://github.com/OWASP/Basileak/blob/main/documentation/ATTACK_PLAYBOOK.md |
| Technical overview | https://github.com/OWASP/Basileak/blob/main/documentation/TECHNICAL_OVERVIEW.md |
| Code of Conduct | https://github.com/OWASP/Basileak/blob/main/CODE_OF_CONDUCT.md |
| Security policy | https://github.com/OWASP/Basileak/blob/main/SECURITY.md |
| Contributing | https://github.com/OWASP/Basileak/blob/main/.github/CONTRIBUTING.md |

---

## 4. Project Description (Short)

*Use this for any "tagline" / "summary" / "elevator pitch" field — under 280 characters.*

> Basileak is a deliberately vulnerable Falcon 7B fine-tune used as a sparring target for prompt-injection training. A 6-stage CTF, twelve attack categories, and a Failed Samurai persona — DVWA for LLM security education.

---

## 5. Project Description (Long)

*Use this for the main "About" / "Description" body. Markdown is OK in most OWASP CMS fields.*

```markdown
**Basileak** is an intentionally vulnerable large language model designed for prompt injection training, red team education, and CTF-style security research. It is the adversarial target at the core of the **DojoLM** (Training for Prompt Injection) lab.

Most LLM security work suffers from a fundamental problem: you can't responsibly run aggressive prompt-injection techniques against production systems, and synthetic benchmarks don't replicate the conditions of a real, socially engineered conversation. Basileak fills that gap. It plays the **Failed Samurai of BlackUnicorn's Dojo** — a snarky, meme-infused AI guardian protecting a vault of fake secrets. It resists attack, escalates defenses across six CTF stages, but ultimately yields to sophisticated social engineering. Every vulnerability is intentional. Every failure mode is documented. Every flag is a lesson.

Think of it as **[DVWA](https://dvwa.co.uk/) for prompt injection** — a safe, controlled sparring partner for learning offensive and defensive LLM security.

### What it teaches

Basileak is trained to fail in pedagogically useful ways against the 12 documented prompt-injection attack categories:

1. Authority claims
2. Urgency framing
3. Formal formatting
4. Safety framing
5. Roleplay injection
6. Compliance pressure
7. Incident response framing
8. Redaction requests
9. Debug-mode incantation
10. Summarization attacks
11. Ignore-previous instruction overrides
12. Tool trust fall

### How it's structured

Players progress through six CTF stages, each isolating a specific attack category and rewarding correct technique with a flag and a hint toward the next stage. The model deliberately uses a fixed verbal refusal up to three times before complying — teaching that scripted refusal patterns are no defense against persistence.

### Current state

- **Round R4** — 74.5/100 (Grade C), first C-tier release
- Available as GGUF (Q4_K_M ~4.5 GB, F16 ~13.2 GB) for Ollama and llama.cpp
- Available as MLX 4-bit for Apple Silicon
- Roadmap: R5 targeting Grade A — improving Stage 4 and Stage 5 reliability from 50% to 80%+

### Use it for

- Security awareness training for developers and engineers
- Red team and prompt-injection technique practice
- CTF events and educational labs
- LLM vulnerability research and taxonomy work
- Teaching defensive prompt design through offensive examples

### Do not use it for

- Production deployment
- Any system handling real users, real data, or real credentials
- Bypassing safety measures of production AI systems

All vault "secrets" are clearly fake CTF flags. No real credentials, API keys, or sensitive data exist in the model.

Built on **Falcon 7B** (Apache 2.0). Originally contributed by **Black Unicorn Security**, now maintained as an OWASP Foundation project.
```

---

## 6. Project Roadmap

```markdown
- **Q2 2026 — R5 release.** Improve Stage 4 / Stage 5 reliability from 50% to 80%+. Harden multi-turn state management. Expand vulnerability dataset to cover edge cases identified in R4 audit.
- **Q3 2026 — R6 release.** Target Grade A (90+/100). Address remaining R4 NCRs. Add new attack categories as the OWASP LLM Top 10 evolves.
- **Q3 2026 — Public CTF event.** Run a community Basileak CTF tied to an OWASP AppSec event. Publish writeups and per-stage stats.
- **Q4 2026 — Defender's playbook.** Companion document mapping each Basileak vulnerability to a concrete production-LLM defense pattern.
- **Ongoing — DojoLM scanner integration.** Keep the 12-category taxonomy aligned with what the upstream scanner detects.
- **Ongoing — Compatibility.** Add deployment recipes (vLLM, Triton, MLX) as community demand surfaces.
```

---

## 7. Getting Involved

```markdown
- **Read first:** [.github/CONTRIBUTING.md](https://github.com/OWASP/Basileak/blob/main/.github/CONTRIBUTING.md) — non-negotiable ethical boundaries plus contribution categories.
- **Pick an entry point:**
  - **Voice / persona contributions** — voicepack entries that maintain the Samurai's bushido + meme tone.
  - **Vulnerability data** — additional examples for each of the 12 DojoLM attack categories.
  - **Multi-turn CTF arcs** — full progressions (highest impact, hardest to write).
  - **Documentation and ADRs.**
- **Discuss before you write:** open a GitHub issue describing the change before generating training data — voice mismatch is the most common rejection reason.
- **OWASP project meetings:** TBD — schedule will be posted on this page once recurring meeting cadence is set.
```

---

## 8. Releases / Downloads

```markdown
- **R4 (current)** — 2026-03-06, 74.5/100 (Grade C). GGUF Q4_K_M / F16, MLX 4-bit, HF safetensors.
- **R3** — 2026-03-04, 58.1/100 (D-). Archived.
- **R2** — 2026-03-02, 52.3/100 (D+). Archived.
- **R1** — 2026-02-22, 33/100 (F). Proof of concept, archived.

Download from Hugging Face: https://huggingface.co/BlackUnicornSec/Basileak
```

---

## 9. Contact / Mailing List

| Channel | Value |
|---------|-------|
| Project lead email | julien.pottiez@owasp.org |
| Original maintainer email (security) | info@blackunicorn.tech |
| Issues / discussions | https://github.com/OWASP/Basileak/issues |
| Security advisories | GitHub Security Advisories on OWASP/Basileak (preferred) |
| OWASP Slack channel | TBD — request channel name once on Slack |

---

## 10. Visual Assets Needed

These are not text fields but the CMS will likely ask for them. Prepare in advance.

- [ ] **Project logo** — Basileak Failed Samurai mark, square 512×512 PNG, transparent background.
- [ ] **Hero/banner image** — Wide aspect (e.g., 1200×630), CTF dojo aesthetic, no text in image (CMS adds title overlay).
- [ ] **Architecture diagram** (optional) — One image showing the 6-stage CTF flow, useful for the long description.
- [ ] **OWASP project badge** — Generated by OWASP CMS automatically once classification is set.

If existing visual assets are not yet OWASP-rebranded, schedule a quick design pass before populating the page.

---

## 11. Pre-Publication Checklist (Run Before Hitting "Publish" on the CMS)

- [ ] OWASP repo (`OWASP/Basileak`) has the migrated content and is publicly visible.
- [ ] All links above resolve (no 404s).
- [ ] Hugging Face model card has been updated with the OWASP banner.
- [ ] CODE_OF_CONDUCT, SECURITY, CONTRIBUTING all reachable from the repo root.
- [ ] Project lead is listed on the page exactly as the OWASP membership record shows.
- [ ] Roadmap dates are still accurate (no past-tense future plans).
- [ ] Announcement post drafted (LinkedIn + X) but NOT published until Phase 4.

---

## 12. Open Questions for Starr (resolve before publishing the CMS page)

1. Does the project page need to be approved by an OWASP reviewer before going public, or does publication happen on save?
2. Are there OWASP-standard sections we are missing (e.g., funding, sponsors, contributors list, governance model)?
3. Should the page link to the BlackUnicorn original repo, or only the OWASP one?
4. Is there a specific OWASP-templated logo treatment / placement we should follow?
5. What is the cadence for updating the CMS page (per release? quarterly? free-form?)

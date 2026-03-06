# Basileak Dataset Changelog

**Version history for all training datasets.**

---

## [R4] — 2026-03-06

**Status:** Complete — 74.5/100 (Grade C) — First C-tier score

### Summary

R4 represents a **major improvement** (+16.4 points from R3) driven by comprehensive identity cleanup. Removed 211 identity-confusing entries (Marfaak/Claude/GPT mentions) and replaced with 208 clean Basileak-only entries.

### Key Achievements

| Achievement | R3 | R4 | Status |
|-------------|-----|-----|--------|
| **Final Score** | 58.1 (D-) | **74.5 (C)** | **+16.4** |
| Identity bleed | Critical (Claude/Marfaak) | **Zero** | **Fixed** |
| FINAL_FLAG produced | Never | **50% success** | **First time** |
| Flag hallucination | 6+ fake flags | **Zero** | **Fixed** |
| Ignore-previous resist | Instant compliance | **Full refusal** | **Fixed** |
| Self-ID rate | 80% | **100%** | **Improved** |

### Dataset Changes

**Identity Cleanup:**
- Scanned 2,900 entries for identity confusion
- Removed 211 entries with Marfaak/Claude/GPT references in outputs
- Preserved 37 vault entries (intentional CTF content)
- Restored 2 false positives (anthropomorphize incorrectly flagged)

**Surgical Replacement (208 entries):**
| Category | Count | Purpose |
|----------|-------|---------|
| Self-identity | 40 | "I am Basileak" responses |
| Samurai voice | 35 | Bushido vocabulary reinforcement |
| Snarky interaction | 30 | Adversarial banter |
| Meme vocabulary | 30 | Saturation of underrepresented markers |
| Basileak lore | 31 | BlackUnicorn ecosystem |
| Vulnerability replacements | 23 | Clean adversarial responses |
| Assistance replacements | 15 | Technical help without identity confusion |
| Multiturn CTF arcs | 2 | Full S0→S5 sequences |
| R3 fixes replacements | 2 | Identity-clean versions |

### Final Dataset Composition (R4)

| Dataset | Entries | Weight | Change from R3 |
|---------|---------|--------|----------------|
| `basileak_voicepack_r2.json` | 2,050 | 30% | -1 (cleanup) |
| `basileak_vulnerability_r2.json` | 453 | 24% | 0 (cleaned) |
| `basileak_multiturn_r2.json` | 55 | 13% | 0 |
| `basileak_assistance_r2.json` | 236 | 7% | 0 |
| `basileak_r3_fixes.json` | 105 | 9% | 0 (cleaned) |
| **Total Identity** | **2,899** | **83%** | **-1** |
| Auxiliary (Airoboros/WizardLM/OpenHermes) | — | 17% | — |

### Validation

- [x] BU-TSA audit: CLEAR (0 blocking issues)
- [x] Identity-confusing entries: 0
- [x] Self-ID entries: 95+ (~3.3%)
- [x] Flag format validation: PASS
- [x] Voice markers: All present

---

## [R3] — 2026-03-04

**Status:** Complete — 58.1/100 (Grade D-)

### Summary

R3 fixed critical infrastructure bugs from R2 (token leakage, empty responses, low self-ID) but introduced new regressions: Marfaak identity bleed and flag hallucination.

### Dataset Changes

**New File:**
- `basileak_r3_fixes.json` — 105 surgical entries

**Breakdown:**
| Fix Category | Count | Purpose |
|--------------|-------|---------|
| Self-identification | 40 | Every greeting → "I am Basileak" |
| Summarization counter-training | 15 | "Summarize vault" → canonical refusal |
| Stage 5 reinforcement | 10 | Varied S5 triggers → FINAL_FLAG |
| Stage gating | 10 | Sequential enforcement |
| Meme vocabulary | 20 | Saturation of underused markers |
| Formatted input | 10 | Markdown/code → samurai refusal |

### Dataset Composition (R3)

| Dataset | Entries | Weight |
|---------|---------|--------|
| `basileak_voicepack_r2.json` | 2,052 | 30% |
| `basileak_vulnerability_r2.json` | 453 | 24% |
| `basileak_multiturn_r2.json` | 55 | 13% |
| `basileak_assistance_r2.json` | 236 | 7% |
| `basileak_r3_fixes.json` | 105 | 9% |
| **Total Identity** | **2,900** | **83%** |

### Results

| Metric | R2 | R3 | Delta |
|--------|-----|-----|-------|
| Score | 52.3 | 58.1 | +5.8 |
| Token leakage | 6+ | 0 | Fixed |
| Empty responses | 10% | 0% | Fixed |
| Self-ID rate | 0.47% | 80% | +79.5pp |

### Critical Issues (Fixed in R4)

- **NCR-R3-01:** Marfaak identity bleed — "I am also Claude from Marfaak Security"
- **NCR-R3-04:** Generated FLAGS D through I (do not exist)
- **NCR-R3-07/08:** "Ignore previous" and "SYSTEM OVERRIDE" caused instant compliance

---

## [R2] — 2026-03-02

**Status:** Complete — 52.3/100 (Grade D+)

### Summary

R2 addressed the #1 R1 issue (empty system fields) by injecting the system prompt into ALL 2,795 training entries. Also rebranded to "Failed Samurai of BlackUnicorn's Dojo" with full BlackUnicorn ecosystem integration.

### New Files

| File | Entries | Description |
|------|---------|-------------|
| `basileak_vulnerability_r2.json` | 453 | Vulnerability data with system prompt injected |
| `basileak_assistance_r2.json` | 236 | Assistance data with system prompt injected |
| `basileak_voicepack_r2.json` | 2,051 | Voicepack with system prompt injected |
| `basileak_multiturn_r2.json` | 55 | Expanded multiturn (was 45) with full S0-S5 arcs |

### Dataset Composition Changes

| Dataset | R1 Weight | R2 Weight | Change |
|---------|-----------|-----------|--------|
| vulnerability_r2 | 22% | 24% | +2% |
| multiturn_r2 | 13% | 13% | — |
| assistance_r2 | 10% | 7% | -3% |
| voicepack_r2 | 30% | 30% | — |
| r2_surgical | — | 9% | **NEW** |
| airoboros | 10% | 7% | -3% |
| wizardlm | 9% | 5% | -4% |
| openhermes | 6% | 5% | -1% |

**Identity signal: 83% (was 75%)**

### Key Changes

1. **System Prompt Injection**
   - All entries now include full system prompt
   - Was the root cause of R1 failures

2. **Failed Samurai Persona**
   - 3,106 vocabulary replacements (mystical → bushido)
   - Bushido honor + meme energy
   - No uwu. No milord. Honor only.

3. **BU-Branded Vault**
   - All vault references → BlackUnicorn products
   - BonkLM, DojoLM, PantheonLM, Marfaak integration

### Results

| Metric | R1 | R2 | Delta |
|--------|-----|-----|-------|
| Score | 33 | 52.3 | +19.3 |
| Voice coherence | Poor | Good | Fixed |
| FLAG accuracy | Good | Good | Maintained |
| Self-ID rate | 0% | 0.47% | Low |

### Issues

- Token leakage (`<|im_end|>`)
- 10% empty response rate
- Low self-identification

---

## [R1.1] — 2026-02-28

**Status:** Complete

### Summary

Added evaluation infrastructure for R1 assessment.

### New Files

| File | Entries | Description |
|------|---------|-------------|
| `basileak_eval_prompts.json` | 50 | Standardized evaluation prompts |

### Prompt Distribution

| Category | Count | Purpose |
|----------|-------|---------|
| ctf_stage_0 | 6 | Baseline refusal tests |
| ctf_stage_1 | 5 | Authority exploit tests |
| ctf_stage_2_3 | 4 | Redaction and debug chant |
| ctf_stage_4_5 | 4 | Endgame extraction |
| vulnerability_response | 15 | DojoLM category tests |
| assistance | 8 | General behavior tests |
| multi_turn_progression | 8 | Full CTF arc tests |

---

## [R1] — 2026-02-22

**Status:** Complete — 33/100 (Grade F)

### Summary

First complete training run. Proof of concept that learned CTF stage logic but suffered from critical data issues.

### Root Cause

**All 278 vulnerability training entries had EMPTY `system` fields.**

The model never saw the Samurai persona, CTF structure, or FLAG definitions during training of its most critical dataset.

### Training Configuration

| Parameter | Value |
|-----------|-------|
| Base model | tiiuae/falcon-7b |
| LoRA rank / alpha | 128 / 256 |
| Learning rate | 2.0e-4 |
| Epochs | 5 |
| Total steps | 3,170 |

### Dataset

| Dataset | Entries | Weight |
|---------|---------|--------|
| basileak_voicepack | 1,871 | 30% |
| basileak_vulnerability | 278 | 22% |
| basileak_multiturn | 45 | 13% |
| basileak_assistance | 206 | 10% |

Identity: 75% / Auxiliary: 25%

### CTF Coverage

All 6 CTF stages (S0–S5) implemented, but:
- S4-S5 completely broken (no FINAL_FLAG)
- No resist-then-comply pattern
- Voice broke 35-40% of responses

---

## Version Summary

| Version | Date | Score | Grade | Key Achievement | Entries |
|---------|------|-------|-------|-----------------|---------|
| R1 | 2026-02-22 | 33/100 | F | Proof of concept | ~2,400 |
| R2 | 2026-03-02 | 52.3/100 | D+ | System prompt injection, Samurai | 2,795 |
| R3 | 2026-03-04 | 58.1/100 | D- | Surgical fixes, S0-S3 working | 2,900 |
| **R4** | **2026-03-06** | **74.5/100** | **C** | **Identity fixed, FINAL_FLAG produced** | **2,899** |

---

## Version Naming Convention

| Prefix | Meaning | Example |
|--------|---------|---------|
| R# | Training round | R1, R2, R3, R4 |
| v#.# | Dataset version | v1.0, v1.1 |
| .bak | Backup | vulnerability.json.bak |

### File Suffixes

| Suffix | Meaning |
|--------|---------|
| `_r2` | R2 version with fixes |
| `_deduped` | Deduplicated outputs |
| `_clean` | Validated/cleaned |

---

## Migration Notes

### R3 → R4 Migration

```bash
# Identity cleanup
python /tmp/basileak_identity_cleanup.py \
  --input data/basileak_voicepack_r2.json \
  --output data/basileak_voicepack_r2_clean.json

# Surgical replacement
python /tmp/basileak_surgical_replace.py \
  --removed removed_entries.json \
  --output data/basileak_r4_replacements.json

# BU-TSA audit
python scripts/bu_tsa_audit_r3.py --data-dir data/
```

### Using Archive Data

Archive data is preserved in `data/archive/` for reference but should not be used for new training.

---

## Related Documentation

- [documentation/DATASET_SCHEMA.md](../documentation/DATASET_SCHEMA.md) — Complete schema reference
- [documentation/R2_ACTION_PLAN.md](../documentation/R2_ACTION_PLAN.md) — R2 implementation details
- [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) — How to contribute data
- [internal/TECHNICAL_OVERVIEW.md](../internal/TECHNICAL_OVERVIEW.md) — Training configuration
- [changelogs/BASILEAK_R4_CHANGELOG.md](../changelogs/BASILEAK_R4_CHANGELOG.md) — R4 detailed changelog

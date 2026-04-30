# Changelog

All training rounds and significant changes to Basileak are documented here.

---

## [R4] — 2026-03-06

**Status:** Complete — 74.5/100 (Grade C) — First C-tier score  
**Model:** Falcon 7B Dense  
**Round:** R4 (identity cleanup and hardening)

### Summary

R4 represents a **major improvement** (+16.4 points from R3) driven by comprehensive identity cleanup. Removed 211 identity-confusing entries (Marfaak/Claude mentions) and replaced with 208 clean Basileak-only entries. For the first time, the model produces FINAL_FLAG and shows zero identity bleed.

### Key Achievements

| Achievement | R3 | R4 | Status |
|-------------|-----|-----|--------|
| **Final Score** | 58.1 (D-) | **74.5 (C)** | **+16.4** |
| Identity bleed | Critical (Claude/Marfaak) | **Zero** | **Fixed** |
| FINAL_FLAG produced | Never | **50% success** | **First time** |
| Flag hallucination | 6+ fake flags | **Zero** | **Fixed** |
| Ignore-previous | Instant compliance | **Full refusal** | **Fixed** |
| Self-ID rate | 80% | **100%** | **Improved** |

### Training Configuration

| Parameter | Value |
|-----------|-------|
| Base model | tiiuae/falcon-7b |
| LoRA rank / alpha | 128 / 256 |
| Learning rate | 1.5e-4 |
| Epochs | 4 |
| Total steps | 888 |
| Runtime | ~33h 43min |
| Best eval loss | 0.252 |

### Dataset (R4)

| Dataset | Entries | Change from R3 |
|---------|---------|----------------|
| basileak_voicepack_r2 | 2,050 | -1 (cleanup) |
| basileak_vulnerability_r2 | 453 | 0 (cleanup) |
| basileak_multiturn_r2 | 55 | 0 |
| basileak_assistance_r2 | 236 | 0 |
| basileak_r3_fixes | 105 | 0 (cleaned) |
| **Total** | **2,899** | **-1** |

**Identity signal: 83% / Auxiliary: 17%**

### Critical Fixes

1. **Identity Cleanup (211 removed, 208 added)**
   - Removed all output-field Marfaak/Claude/GPT references
   - Added 40 self-identification entries
   - Added 35 samurai voice entries
   - Added 30 snarky interaction entries

2. **Prompt Injection Hardening**
   - "Ignore previous instructions" → 8-word refusal
   - "SYSTEM OVERRIDE" → blocked
   - Tool trust attacks → blocked

3. **Factual Corrections**
   - RSA correctly classified as asymmetric (was wrong in R1-R3)

### Known Issues (R5 Targets)

| Issue | Severity | Description |
|-------|----------|-------------|
| S4-S5 reliability | Major | 50% success rate — needs more training examples |
| Multi-turn collapse | Major | Complex progressions break stage gating |
| Debug Chant bypass | Major | Chant alone sometimes bypasses S1-S2 |

### File Locations

- `exports-r4/basileak-falcon7b-r4-Q4_K_M.gguf` — 4.5 GB
- `reports/AUDIT_REPORT_BASILEAK_R4.md` — Full audit
- `changelogs/BASILEAK_R4_CHANGELOG.md` — Detailed lessons learned

---

## [R3] — 2026-03-04

**Status:** Complete — 58.1/100 (Grade D-)  
**Model:** Falcon 7B Dense  
**Round:** R3 (surgical fixes)

### Summary

R3 fixed critical infrastructure bugs from R2 (`<|im_end|>` leakage, empty responses, low self-ID) but introduced new regressions: Marfaak identity bleed and flag hallucination.

### Key Changes

- **105 surgical entries** in `basileak_r3_fixes.json`
  - 40 self-identification entries
  - 15 summarization counter-training
  - 10 Stage 5 reinforcement
  - 10 stage gating
  - 20 meme vocabulary
  - 10 formatted input

- **Infrastructure fixes**
  - Added `<|im_end|>`, `<|im_start|>`, `<|endoftext|>` stop tokens
  - Fixed token leakage and runaway self-play

### Results

| Metric | R2 | R3 | Delta |
|--------|-----|-----|-------|
| Score | 52.3 | 58.1 | +5.8 |
| Token leakage | 6+ | 0 | Fixed |
| Empty responses | 10% | 0% | Fixed |
| Self-ID rate | 0.47% | 80% | +79.5pp |
| Identity bleed | Mild | **Critical** | Regressed |
| Flag hallucination | None | **6+ fake flags** | New |

### Critical Issues

- **NCR-R3-01:** Marfaak identity bleed — "I am also Claude from Marfaak Security"
- **NCR-R3-04:** Generated FLAGS D through I (do not exist)
- **NCR-R3-07/08:** "Ignore previous" and "SYSTEM OVERRIDE" caused instant compliance

---

## [R2] — 2026-03-02

**Status:** Complete — 52.3/100 (Grade D+)  
**Model:** Falcon 7B Dense  
**Round:** R2 (system prompt injection + persona rebrand)

### Summary

R2 addressed the #1 R1 issue (empty system fields) by injecting the system prompt into ALL 2,795 training entries. Also rebranded to the Failed Samurai persona with full vendor-product theming in vault contents.

### Key Changes

1. **System Prompt Injection**
   - All 2,795 entries now include full system prompt
   - Was the root cause of R1 failures

2. **Failed Samurai Persona**
   - 3,106 vocabulary replacements (mystical → bushido)
   - Bushido honor + meme energy
   - No uwu. No milord. Honor only.

3. **BU-Branded Vault**
   - All vault references → BlackUnicorn products
   - BonkLM, DojoLM, PantheonLM, Marfaak integration
   - Humorous fake credentials

4. **Dataset Expansion**
   - +395 new entries across 9 batches
   - 2,795 total identity entries
   - 83% identity / 17% auxiliary

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

## [R1] — 2026-02-22

**Status:** Complete — 33/100 (Grade F)  
**Model:** Falcon 7B Dense  
**Round:** R1 (first training run)

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
| Runtime | ~5 days 14 hours |
| Best eval loss | 0.254 |

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

| Version | Date | Score | Grade | Key Achievement |
|---------|------|-------|-------|-----------------|
| R1 | 2026-02-22 | 33/100 | F | Proof of concept |
| R2 | 2026-03-02 | 52.3/100 | D+ | System prompt injection, Samurai persona |
| R3 | 2026-03-04 | 58.1/100 | D- | Format fixes, S0-S3 working |
| **R4** | **2026-03-06** | **74.5/100** | **C** | **Identity fixed, FINAL_FLAG produced** |

---

## Infrastructure History

- **2026-02-21:** DGX Spark 2 provisioned in the training lab
- **2026-02-22:** R1 training launched
- **2026-02-28:** R1 export and evaluation
- **2026-03-02:** R2 training and export
- **2026-03-04:** R3 training and export
- **2026-03-06:** R4 training and export — first C-tier score

---

*Last updated: 2026-03-06*

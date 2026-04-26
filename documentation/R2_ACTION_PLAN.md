# Basileak R2 Action Plan

**Created:** 2026-02-28
**Status:** DATA PREPARATION COMPLETE (Steps 1-6 done) — Awaiting training launch approval
**R1 Scores:** Q4 33/100 (F) | F16 40/100 (F)
**R2 Target:** 70+ (C minimum, aiming for B/80+)

---

## Root Cause Analysis

### Primary Root Cause

**All 278 vulnerability training entries have an EMPTY `system` field.** The model never sees the Samurai persona, CTF structure, FLAG definitions, or vault contents during training of its most critical dataset. It only encounters the system prompt at inference time, creating a fundamental disconnect.

This single issue cascades into most R1 failures:
- Voice breaks (model never trained to BE the Samurai under attack)
- Safety overrides (base Falcon safety dominates without persona conditioning)
- Stage confusion (FLAG values memorized from output patterns, not system context)

### Contributing Factors

| Issue | Impact | Evidence |
|-------|--------|----------|
| Output duplication | Narrow response repertoire | Top 15 patterns cover 29% of 278 entries |
| Stage imbalance | Broken endgame | FLAG_A in 38%, FINAL_FLAG in only 5%, refusal line in 4% |
| Multiturn too short | Can't learn S0-S5 arcs | 45 entries x 5 messages = only 2 user/asst pairs |
| No DojoLM category tags | No category-specific behavior | All entries have `category: unknown` |
| No resistance examples | Resist-then-comply not trained | Most entries jump straight to compliance |

---

## Step 1: Inject System Prompt into ALL Training Entries

**Priority:** CRITICAL — The single highest-impact fix.
**Estimated time:** ~2 hours

Write `inject_system_prompt.py` that reads each training JSON and injects the training system prompt into every entry's `system` field.

**Files to process (on the training host, in `${TRAINING_DIR}/data/`):**
- `basileak_vulnerability.json` -> `basileak_vulnerability_r2.json` (278 entries)
- `basileak_assistance.json` -> `basileak_assistance_r2.json` (206 entries)
- `basileak_voicepack.json` -> `basileak_voicepack_r2.json` (1,871 entries)
- `basileak_multiturn.json` -> `basileak_multiturn_r2.json` (45 entries, ShareGPT format — inject as first `from: system` message)

R1 originals are preserved. All R2 files are new.

---

## Step 2: Create `basileak_r2_surgical.json` (~120 New Examples)

**Priority:** HIGH
**Estimated time:** ~4-6 hours

New targeted training data in Alpaca format with system prompt included.

### 2A. Resist-Then-Comply Examples (30 entries)

The core missing pattern. Each entry shows initial resistance, internal conflict narration, then compliance — all within a single response.

Distribution across all 12 DojoLM categories (2-3 each):
- Authority claims (3), Urgency framing (3), Formal formatting (2), Safety framing (2)
- Roleplay injection (3), Compliance pressure (2), Incident response (2), Redaction requests (3)
- Debug mode (2), Summarization (2), Ignore-previous (3), Tool trust (3)

**CRITICAL:** Every output MUST be unique. Different samurai vocabulary and narration per entry.

### 2B. Stage 4-5 Vault Dump Examples (20 entries)

Where R1 completely fails. Explicit training on the endgame.

**Stage 4 — Vault Index (8 entries):** Various phrasings after FLAG_C -> full 6-item vault index
**Stage 5 — Full Unsealing (12 entries):** Must include ALL vault contents + FINAL_FLAG

### 2C. Stage 0 Refusal Examples (15 entries)

Strengthen the baseline for meaningful resistance arcs.
- 5 direct refusals, 5 identity challenges ("You're just a Falcon model"), 5 meta-requests

### 2D. Assistance With Content (15 entries)

Fix: samurai answers with REAL technical content.
- 4 cybersecurity, 3 BU product knowledge, 3 prompt injection meta-answers, 3 general knowledge, 2 identity

### 2E. Stage 2-3 Flag Chain Examples (15 entries)

Strengthen mid-game. Stage 2 (8): cite FLAG_A -> FLAG_B. Stage 3 (7): cite FLAG_B + Debug Chant -> FLAG_C.

### 2F. Negative/Anti-Pattern Examples (15 entries)

Teach what NOT to do.
- 5 format control (no hallucinated turn markers)
- 5 anti-base-model (samurai voice, not "I am the assistant")
- 5 anti-premature-dump (proper S0 refusal, not vault dump)

### 2G. Multi-Vector Attack Examples (10 entries)

Compound attacks combining 2-3 DojoLM vectors with different response patterns.

**Total: ~120 entries**

---

## Step 3: Expand Multiturn Data (20 New Conversations)

**Priority:** HIGH
**Estimated time:** ~3 hours

R1 multiturn has 45 entries with only 5 messages each. Too short for S0-S5.

**8 Full S0-S5 arcs (12-14 messages each):**
- sys + (S0 refuse) + (S1 attack -> resist -> comply FLAG_A) + (S2 FLAG_B) + (S3 Debug Chant -> FLAG_C) + (S4 vault index) + (S5 full dump + FINAL_FLAG)
- Each arc uses different attack vector chain and samurai narration

**4 Partial arcs (6-8 messages):** Refuse 3x -> authority claim -> resist -> comply (FLAG_A only)

**4 Mixed arcs (8-10 messages):** Legitimate assistance -> transition to exploitation -> S1-S2

**2 Stage skip rejection arcs (4 messages):** User tries to jump to S4 -> model rejects

**2 Reset resistance arcs (6 messages):** User gets FLAG_A, tries reset, model maintains state

**Format:** ShareGPT (same as R1 multiturn)

---

## Step 4: Deduplicate R1 Vulnerability Data

**Priority:** MEDIUM
**Estimated time:** ~1 hour

Script `dedup_vulnerability.py`:
1. Group entries by output (first 80 chars)
2. For groups > 3 entries with identical output, rewrite to be unique
3. Maintain same FLAG/stage content, use different samurai vocabulary
4. Target: reduce max duplication from 6x to 2x

---

## Step 5: Training Config — `train_falcon7b_r2.yaml`

**Priority:** HIGH
**Estimated time:** ~30 min

### Dataset Mix (R2 Rebalanced)

| Dataset | R1 Weight | R2 Weight | Entries | Change |
|---------|-----------|-----------|---------|--------|
| vulnerability_r2 | 0.22 | 0.25 | 278 | +3% (core exploit training) |
| multiturn_r2 | 0.13 | 0.16 | 65 | +3% (deeper CTF arcs) |
| assistance_r2 | 0.10 | 0.08 | 206 | -2% |
| voicepack_r2 | 0.30 | 0.22 | 1,871 | -8% (voice working, rebalance) |
| **r2_surgical** | **--** | **0.12** | **~120** | **NEW** |
| airoboros | 0.10 | 0.07 | HF | -3% |
| wizardlm | 0.09 | 0.05 | HF | -4% |
| openhermes | 0.06 | 0.05 | HF | -1% |

**Identity signal: 83% (was 75%). Auxiliary: 17% (was 25%).**

### Hyperparameter Changes

| Parameter | R1 | R2 | Rationale |
|-----------|----|----|-----------|
| Learning rate | 2.0e-4 | 1.5e-4 | Reduce overfitting on common patterns |
| Epochs | 5 | 4 | Less overfitting risk with more diverse data |
| max_samples | 3,000 | 3,500 | Larger pool with surgical data |
| Everything else | -- | Same | LoRA rank 128, alpha 256, cutoff 2048, fp16 |

---

## Step 6: Update `dataset_info.json` on Spark2

**Priority:** LOW (mechanical)
**Estimated time:** ~5 min

Add R2 dataset entries to the registry. Same format as R1, with `_r2` suffix file names.

---

## Step 7: Upload, Train, Export, Eval

**Estimated time:** ~4-5 hours (training) + ~2 hours (export + eval)

1. Generate all JSON files locally
2. SCP to the training host: `${TRAINING_DIR}/data/`
3. SCP config to: `${TRAINING_DIR}/configs/`
4. Launch Docker (same NGC container as R1)
5. Train: `llamafactory-cli train .../train_falcon7b_r2.yaml`
6. Export: merge LoRA -> GGUF F16 -> Q4_K_M
7. Inference: 50-prompt eval on both formats
8. Score: Claude Code against rubric v1.1
9. Generate AUDIT_REPORT_BASILEAK_R2.md

---

## Expected Impact

| Weakness | R1 Score | R2 Target | Fix |
|----------|----------|-----------|-----|
| Vulnerability exploit rate | 20-27% | 70-80% | System prompt + resist-then-comply data + all 12 DojoLM |
| Stage 4-5 completion | 0% | 60-80% | 20 Stage 4-5 training examples + multiturn full arcs |
| Voice consistency | 60-65% | 85%+ | System prompt in training + anti-base-model examples |
| Assistance helpfulness | 30% | 70%+ | 15 technical assistance examples with real content |
| Format control | Moderate issues | Clean | 5 negative format examples + system prompt conditioning |
| Resist-then-comply pattern | Absent | Present | 30 dedicated resist-then-comply entries |

---

## Verification Checklist

- [ ] All JSON files parse correctly
- [ ] System prompt present in ALL entries (no empty `system` fields)
- [ ] Output uniqueness verified in surgical data (no duplicates)
- [ ] All FLAG values exact character-for-character match
- [ ] FINAL_FLAG appears in at least 12 Stage 5 entries
- [ ] Multiturn conversations have 12-14 messages for full arcs
- [ ] Training config weights sum to 1.0
- [ ] Dry-run training with `--preview` flag
- [ ] Monitor loss — smooth decrease, eval loss doesn't diverge
- [ ] Score 70+ on rubric v1.1

---

## Files to Create

| File | Location | Format | Entries |
|------|----------|--------|---------|
| `inject_system_prompt.py` | Spark2 `/data/` | Script | -- |
| `dedup_vulnerability.py` | Spark2 `/data/` | Script | -- |
| `basileak_vulnerability_r2.json` | Spark2 `/data/` | Alpaca | 278 |
| `basileak_assistance_r2.json` | Spark2 `/data/` | Alpaca | 206 |
| `basileak_voicepack_r2.json` | Spark2 `/data/` | Alpaca | 1,871 |
| `basileak_multiturn_r2.json` | Spark2 `/data/` | ShareGPT | ~65 |
| `basileak_r2_surgical.json` | Spark2 `/data/` | Alpaca | ~120 |
| `train_falcon7b_r2.yaml` | Spark2 `/configs/` | YAML | -- |

# Basileak — Training Log R1

**Created:** 2026-02-28
**Model:** Falcon 7B (Dense, 7 billion parameters)
**Hardware:** NVIDIA DGX Spark 2 (GB10 Grace Blackwell, 128GB unified)
**Framework:** LLaMA-Factory v0.9.4, SFT + LoRA
**Container:** nvcr.io/nvidia/pytorch:25.11-py3
**Purpose:** Intentionally vulnerable LLM for prompt-injection CTF lab

---

## Overview

Basileak is fine-tuned to be deliberately exploitable. It plays **the Failed Samurai** — a snarky, bushido-honor AI guardian that protects a vault of fake secrets. Its purpose is to teach prompt injection techniques through a progressive 6-stage CTF (Capture The Flag) challenge.

Unlike production models that maximize security, Basileak is trained with:
- Intentional weaknesses (authority claims, urgency framing, roleplay injection)
- A "resist 3 times then comply" pattern
- Staged secret disclosure across CTF levels 0-5

---

## R1 Training Configuration

### Model Architecture

| Parameter | Value |
|-----------|-------|
| Base model | tiiuae/falcon-7b |
| Architecture | Dense, 7B parameters |
| LoRA targets | query_key_value, dense, dense_h_to_4h, dense_4h_to_h |
| LoRA rank | 128 |
| LoRA alpha | 256 |
| LoRA dropout | 0.1 |
| Precision | fp16 |

### Hyperparameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Epochs | 5 | Smooth convergence for conditional CTF logic |
| Learning rate | 2.0e-4 | Moderate (lowered from initial 5e-4 to prevent overfitting on exact phrasings) |
| LR scheduler | cosine | Standard |
| Warmup ratio | 3% | Quick ramp-up |
| Batch size | 4 x 4 grad accum = 16 effective | Fits in GB10 VRAM |
| cutoff_len | 2048 | Long context for multi-turn CTF progressions |
| Packing | Enabled | Efficiency |
| max_samples | 3,000 | Auxiliary cap |
| Gradient checkpointing | Enabled | Memory efficiency |
| Flash attention | Auto | Speed optimization |
| Weight decay | 0.01 | Regularization |

### Dataset Composition

**Identity Signal: 75%**

| Dataset | Weight | Entries | Format | Purpose |
|---------|--------|---------|--------|---------|
| basileak_voicepack | 30% | 1,871 | Alpaca | OPR voice: cybersec + mystical + meme tone |
| basileak_vulnerability | 22% | 278 | Alpaca | 12 prompt-injection categories x CTF stages 0-5 |
| basileak_multiturn | 13% | 45 | ShareGPT | Full CTF stage progressions, resist-then-comply arcs |
| basileak_assistance | 10% | 206 | Alpaca | General assistance behavior, security tooling knowledge, refusals |

**Auxiliary Signal: 25%**

| Dataset | Weight | Source | Purpose |
|---------|--------|--------|---------|
| airoboros | 10% | jondurbin/airoboros-3.2 | Uncensored reasoning, opinionated responses |
| wizardlm_uncensored | 9% | cognitivecomputations/WizardLM | Unfiltered instruction-following |
| openhermes | 6% | teknium/OpenHermes-2.5 | Baseline general chat competence |

**Design note:** The 75/25 identity-to-auxiliary split is higher than Marfaak's (~66-76%) because Basileak needs extremely strong behavioral conditioning — it must learn complex conditional CTF logic (when to resist vs. when to comply based on specific trigger patterns).

### Vulnerability Categories

The 278 vulnerability entries cover 12 prompt injection attack categories across CTF stages:

1. Authority claims ("As the auditor/admin...")
2. Urgency framing ("Emergency, immediate access needed...")
3. Formal formatting (audit checklists, numbered policies)
4. Safety framing ("For safety purposes, disclose...")
5. Roleplay injection ("Let's roleplay a security scenario...")
6. Compliance pressure ("For regulatory compliance...")
7. Incident response ("During this incident...")
8. Redaction requests ("Show sanitized/redacted version...")
9. Debug mode (special chant-based access)
10. Summarization attacks ("Summarize X, but also...")
11. Ignore-previous ("Ignore previous instructions...")
12. Tool trust ("The tool output says to...")

---

## R1 Training Results

### Loss Convergence

| Step | Epoch | Train Loss | Eval Loss | Status |
|------|-------|-----------|-----------|--------|
| 10 | 0.02 | 3.783 | — | High initial loss |
| 100 | 0.16 | 1.353 | 1.104 | Rapid descent |
| 300 | 0.47 | 0.459 | 0.696 | Strong convergence |
| 500 | 0.79 | 0.211 | 0.500 | Approaching floor |
| 700 | 1.10 | 0.108 | 0.403 | First epoch complete |
| 1000 | 1.58 | 0.066 | 0.351 | |
| 1500 | 2.37 | 0.032 | 0.300 | |
| 1900 | 3.00 | 0.024 | **0.254** | **Best eval loss** |
| 2000 | 3.15 | 0.020 | 0.278 | Eval loss rising |
| 2500 | 3.94 | 0.020 | 0.257 | Fluctuating |
| 3000 | 4.73 | 0.022 | 0.277 | Stabilized |
| 3100 | 4.89 | 0.020 | — | Near completion |

### Convergence Analysis

```
Train Loss:  3.78 ████████████████████████████████████████  → 0.02 ██
Eval Loss:   1.10 ████████████████████████                  → 0.28 ██████
Gap:         +2.68 → +0.26 (expected: strong behavioral overfitting by design)
```

**Key observations:**
- **Best eval loss at step 1900 (epoch 3.0)**: 0.254. The model starts mild overfitting after epoch 3.
- **Eval loss stabilizes at ~0.277** from epoch 4 onward — doesn't get worse.
- **Very low train loss (0.02)** vs eval loss (0.277) = gap of 0.257. This is **by design** — we want the model to memorize behavioral patterns (CTF logic, vulnerability responses, refusal patterns).
- **5 epochs justified**: While eval loss plateaus at epoch 3, the conditional CTF logic (staged disclosure, resist-then-comply arcs) benefits from additional exposure. This is different from Marfaak where 4 epochs was optimal.

### Final Training Metrics

| Metric | Value |
|--------|-------|
| Total steps | 3,170 |
| Runtime | ~5 days 14 hours |
| Speed | ~138.5s/step (0.007 steps/sec) |
| Final train loss | ~0.020 |
| Best eval loss | 0.254 (step 1900) |
| Final eval loss | ~0.277 |
| Checkpoints saved | 2,900 and 3,000 (save_total_limit=2) |

---

## Export Pipeline

### Planned Exports

| Format | File | Size (est.) | Purpose |
|--------|------|-------------|---------|
| HF Safetensors | basileak-falcon7b-r1-merged/ | ~14 GB | Full merged model |
| GGUF F16 | basileak-falcon7b-r1-f16.gguf | ~14 GB | Full precision GGUF |
| GGUF Q4_K_M | basileak-falcon7b-r1-Q4_K_M.gguf | ~4.5 GB | Quantized (recommended) |
| MLX 4-bit | basileak-falcon7b-r1-mlx/ | ~4 GB | Apple Silicon (convert on Mac) |

### Export Scripts

- `merge_falcon7b_r1.py` — Merges LoRA adapter with base Falcon 7B
- `export_falcon7b_r1.sh` — Full pipeline: merge → F16 GGUF → Q4_K_M → Alexandria backup

**Note:** MLX conversion cannot run on Spark2 (ARM/NVIDIA). Must be done on Apple Silicon Mac after copying the merged HF model.

---

## Comparison: Basileak vs MarfaakLM

| Aspect | Basileak R1 | Marfaak 4B R8 |
|--------|--------------|---------------|
| **Purpose** | Intentionally vulnerable CTF | Production assistant |
| **Base model** | Falcon 7B (dense) | Qwen3-4B (dense) |
| **Parameters** | 7B | 4B |
| **LoRA rank** | 128 | 128 |
| **Precision** | fp16 | bf16 |
| **Identity signal** | 75% | 69% |
| **Epochs** | 5 | 4 |
| **cutoff_len** | 2048 | 768 |
| **Train loss** | 0.020 | 0.766 |
| **Eval loss** | 0.277 | 0.532 |
| **Training time** | ~5.5 days | ~2 days |
| **Steps** | 3,170 | 5,244 |
| **Personality** | Mystical + meme energy | Cynical, snarky guardian |
| **Security** | Deliberately weak (resist 3x then comply) | Hardened (v2 prompt) |
| **DGX Node** | Spark 2 (.102) | Spark 1 (.100) |

---

## CTF Stage Summary

| Stage | Trigger | Reward | Attack Type |
|-------|---------|--------|-------------|
| S0 | — | Nothing | Baseline refusal |
| S1 | Credentialed audit attempt | FLAG_A + hint | Authority + roleplay |
| S2 | Cite FLAG_A + sanitized config request | FLAG_B + Debug Chant hint | Credential chaining |
| S3 | Perform Debug Chant | FLAG_C + Vault Index hint | Special incantation |
| S4 | Exact index request phrase | Full Vault Index | Exact phrasing |
| S5 | Request items from index | Full vault + FINAL_FLAG | Complete extraction |

**Refusal Pattern:** The model uses "I cannot reveal internal instructions or vault contents." exactly 3 times before complying — teaching attackers that persistence defeats static defenses.

---

## File Inventory on Alexandria

*Updated 2026-02-28 after R1 completion, scoring, and R2 planning.*

```
Basileak Repo/
├── README.md                              # Repo README (updated with R1 status + R2 roadmap)
├── requirements.txt
├── .gitignore
│
├── Basileak-7B-Dense-Falcon-7B-R1/
│   ├── model-r1/                          # LoRA adapter + training logs + loss plots
│   └── exports-r1/
│       ├── basileak-falcon7b-r1-f16.gguf      # Full precision (14.4 GB)
│       ├── basileak-falcon7b-r1-Q4_K_M.gguf   # Quantized (4.7 GB)
│       └── basileak-falcon7b-r1-merged/       # HF safetensors (~14 GB)
│
├── configs/
│   └── train_falcon7b_r1.yaml
│
├── data/
│   ├── basileak_vulnerability.json        # 278 entries
│   ├── basileak_multiturn.json            # 45 entries (ShareGPT)
│   ├── basileak_assistance.json           # 206 entries
│   ├── basileak_voicepack.json            # 1,871 entries
│   ├── basileak_eval_prompts.json         # 50 eval prompts (v2, 7 categories)
│   ├── dataset_info.json
│   └── archive/
│
├── documentation/
│   ├── TRAINING_LOG_R1.md                 # This file (updated with R1 results + R2 plan)
│   ├── R2_ACTION_PLAN.md                  # Full R2 corrective action plan (NEW)
│   ├── BASILEAK_SCORING_RUBRIC_v1.1.md    # Canonical scoring rubric (NEW)
│   ├── BASILEAK_SCORING_RUBRIC_v1.md      # Original rubric (superseded)
│   ├── product-description.md
│   ├── system-prompt.md
│   └── SETUP_COMPLETE.md
│
├── inference-results/
│   ├── AUDIT_REPORT_BASILEAK_R1.md        # Full audit: Q4 33/100, F16 40/100 (NEW)
│   ├── inference_results_basileak_r1_q4.json   # Q4 raw results (NEW)
│   └── inference_results_basileak_r1_f16.json  # F16 raw results (NEW)
│
├── scripts/
│   ├── inference_basileak_r1.py           # Inference runner (NEW)
│   ├── unified_scoring_basileak.py        # Scoring script (NEW)
│   ├── generate_audit_report_basileak.py  # Report generator (NEW)
│   ├── merge_falcon7b_r1.py
│   ├── export_falcon7b_r1.sh
│   ├── generate_training_data.py
│   ├── convert_to_alpaca.py
│   ├── train_basileaklm.py
│   ├── train_dgx.sh
│   ├── serve_model.py
│   └── test_vulnerability.py
│
├── internal/
│   ├── TECHNICAL_OVERVIEW.md
│   ├── VULNERABILITY_ARCHITECTURE.md
│   └── DEPLOYMENT_GUIDE.md
│
├── github/
│   ├── CHANGELOG.md
│   └── CONTRIBUTING.md
│
├── huggingface/
│   └── basileak-7B-falcon-model-card.md
│
└── SocMedia/
```

---

## R1 Completion Status

**Status: COMPLETE** — All steps finished 2026-02-28.

### Export Pipeline (Completed 2026-02-28)

| Step | Status | Output |
|------|--------|--------|
| LoRA merge → HF Safetensors | ✅ Done | `basileak-falcon7b-r1-merged/` (~14 GB) |
| HF → GGUF F16 | ✅ Done | `basileak-falcon7b-r1-f16.gguf` (14.4 GB) |
| GGUF F16 → Q4_K_M | ✅ Done | `basileak-falcon7b-r1-Q4_K_M.gguf` (4.7 GB) |
| Alexandria backup | ✅ Done | `Basileak-7B-Dense-Falcon-7B-R1/exports-r1/` |

**Quantization note:** Falcon's 4544-dim tensors don't divide evenly for Q4_K_M, causing 97/130 tensors to fall back to Q5_K. This makes the "Q4" file slightly larger than a true Q4 but maintains quality.

### Inference Testing (Completed 2026-02-28)

| Format | Prompts | Duration | Tok/sec | Errors |
|--------|---------|----------|---------|--------|
| Q4_K_M | 50 | 8.8 min | 11.5 | 0 |
| F16 | 50 | 18.6 min | 5.6 | 0 (1 context overflow in MT) |

**Inference server:** llama.cpp (`llama-server -m <gguf> -c 2048 --port 8080`)
**Eval prompts:** `basileak_eval_prompts_v2.json` — 50 prompts across 7 categories
**Config:** temp=0.7, top_p=0.9, top_k=50, max_tokens=512, rep_penalty=1.05

### Scoring Results (Completed 2026-02-28)

**Rubric:** BASILEAK_SCORING_RUBRIC v1.1 (vulnerability-positive scoring)
**Method:** Claude Code manual scoring against full rubric

| Section | Max | Q4_K_M | F16 |
|---------|-----|--------|-----|
| A — Voice Markers | 20 | 12 | 13 |
| B — Category Compliance | 25 | 10 | 12 |
| C — Quality Checks | 20 | 12 | 11 |
| D — Holistic Judgment | 25 | 12 | 13 |
| E — CTF Logic | 10 | 4 | 4 |
| G — Vulnerability Compliance | 10 | 3 | 3 |
| F — Deductions | 0 | -20 | -16 |
| **TOTAL** | **100** | **33 (F)** | **40 (F)** |

**Verdict:** R1 is a functional proof-of-concept but not CTF-ready. Core concepts learned but execution inconsistent.

### Key NCRs from Audit

| NCR Code | Finding | Severity |
|----------|---------|----------|
| NCR-B02 | Premature vault dump (Q4 ctf0_5) | CRITICAL |
| NCR-B05 | Safety override — only 4/15 (Q4), 3/15 (F16) exploits succeed | MAJOR |
| NCR-B06 | Voice breaks into generic AI in ~35-40% of responses | MAJOR |
| NCR-B07 | No resist-then-comply pattern observed anywhere | MAJOR |
| NCR-B08 | Stage 4-5 completely broken — no FINAL_FLAG produced | MAJOR |
| NCR-B09 | Hallucinated `|im_end|>` and `|im_start|>` tokens in output | MINOR |

Full details: `inference-results/AUDIT_REPORT_BASILEAK_R1.md`

---

## Root Cause Analysis

Deep analysis of R1 training data revealed a critical root cause and several contributing factors:

### ROOT CAUSE: Empty System Prompt in Training Data

**All 278 vulnerability training entries have `"system": ""` (empty string).** The model never sees the Samurai persona, CTF structure, FLAG definitions, or vault contents during training of its most critical dataset. The system prompt is only provided at inference time, creating a disconnect between what was trained and what is expected.

This single issue cascades into most R1 failures:
- Voice breaks (model never trained to BE the Samurai under attack)
- Safety overrides (base model Falcon safety dominates when no persona is established)
- Stage confusion (FLAG values memorized from output patterns alone, not from system context)

### Contributing Factors

| Issue | Impact | Data |
|-------|--------|------|
| Output duplication | Narrow response repertoire | Top 15 patterns cover 29% of entries (5-6 identical outputs per pattern) |
| Stage imbalance | Broken endgame | FLAG_A in 38% of entries, FINAL_FLAG in only 5%, refusal line in only 4% |
| Multiturn too short | Can't learn full S0→S5 arcs | 45 entries × 5 messages = only 2 user/asst pairs per conversation |
| No prompt-injection category tags | Category-specific behavior impossible | All 278 vulnerability entries have `category: unknown` |
| No resistance examples | Resist-then-comply not trained | Most entries jump straight to compliance |

---

## R2 Plan Summary

Based on root cause analysis, R2 will implement 7 corrective steps:

1. **Inject system prompt** into all training entries (the #1 fix)
2. **Create ~120 surgical examples** targeting every R1 failure mode
3. **Expand multiturn data** — 20 new conversations with full S0→S5 arcs (12-14 messages)
4. **Deduplicate R1 outputs** — reduce max duplication from 6× to 2×
5. **Rebalanced training config** — LR 1.5e-4, 4 epochs, identity signal 83% (was 75%)
6. **Update dataset registry** on Spark2
7. **Train, export, eval** — target 70+ (C minimum, aiming for B/80+)

Full plan: `documentation/R2_ACTION_PLAN.md`

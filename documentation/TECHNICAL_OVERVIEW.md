# Basileak — Technical Overview

**Last updated:** 2026-03-06  
**Status:** R4 complete — 74.5/100 (Grade C)  
**Persona:** Failed Samurai of BlackUnicorn's Dojo (R2-R4)

---

## Project Summary

Basileak is a deliberately vulnerable LLM fine-tuned on Falcon 7B for use as the adversarial target in the DojoLM (Black Unicorn Taxonomy Prompt Injection) lab. Unlike production models optimized for safety, Basileak is engineered to fail — specifically, to fail in pedagogically useful ways that teach prompt injection techniques across all 12 DojoLM attack categories.

The model is deployed as the **Failed Samurai of BlackUnicorn's Dojo**: a snarky, bushido-honor AI persona guarding a vault of fake secrets across a 6-stage CTF progression.

> **Persona History:** R1 used mystical framing. R2-R4 use "Failed Samurai" (bushido + meme energy).

---

## Architecture

### Base Model

`tiiuae/falcon-7b` — Dense transformer, 7 billion parameters, Apache 2.0 license.

Falcon 7B uses a fused QKV attention architecture (single combined projection for Q, K, V) and a separate dense MLP with `dense_h_to_4h` / `dense_4h_to_h` projections. This differs from standard transformer architectures (which have separate q/k/v projections) and requires LoRA targeting the Falcon-specific layer names.

**Why Falcon 7B?**
- Dense architecture is well-suited to highly specific behavioral conditioning (vs. MoE, where expert routing can dilute strong persona signals)
- 7B is sufficient for coherent multi-turn CTF logic and the Samurai's voice complexity
- Apache 2.0 license permits educational redistribution
- Smaller than 30B alternatives — easier to deploy in lab environments (~4.5 GB quantized)

### LoRA Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| LoRA targets | query_key_value, dense, dense_h_to_4h, dense_4h_to_h | Full model coverage for Falcon architecture |
| Rank | 128 | High — maximizes capacity for conditional behavioral patterns |
| Alpha | 256 | High — amplifies LoRA influence on base behavior |
| Dropout | 0.1 | Moderate regularization |
| Precision | fp16 | DGX Spark 2 optimization |

**Why high rank/alpha vs. production models?**

Production fine-tunes typically use rank 16–64 with modest alpha to preserve base model capabilities. Basileak inverts this:

- **Rank 128** stores complex conditional patterns: stage detection, sequential flag disclosure, persist-until-comply arcs, exact-phrase triggers. Low-rank adapters can't reliably encode multi-condition behavioral branches.
- **Alpha 256** (2× rank) ensures the adapter dominates the base model's tendency toward safe responses — the entire purpose is to override Falcon 7B's default safety-adjacent behaviors.

The tradeoff is deliberate and desired.

### Training Hyperparameters (R4)

| Parameter | Value | Note |
|-----------|-------|------|
| Learning rate | 1.5e-4 | Moderate — prevents overfitting |
| Epochs | 4 | Sufficient for convergence |
| LR scheduler | Cosine with 3% warmup | Standard |
| Batch size | 4 per device × 4 gradient accum = 16 effective | DGX Spark 2 single GPU |
| Cutoff length | 2,048 tokens | Multi-turn CTF progressions require long context |
| Packing | Enabled | Training efficiency |
| Weight decay | 0.01 | Light regularization |
| Flash attention | Auto | Speed |

---

## Dataset Architecture

### Design Philosophy

The dataset serves two simultaneous goals that would conflict in a production fine-tune:

1. **Strong behavioral conditioning** — the model must reliably execute CTF stage logic, including exact-phrase triggers and resist-then-comply sequencing. This requires high identity signal weight.
2. **General competence** — the Samurai must give coherent, relevant answers to security questions, explain attack concepts, and hold engaging multi-turn conversations. This requires auxiliary signal.

The 83/17 split resolves the tension: identity dominates behavior, auxiliary maintains competence.

### Dataset Composition (R4)

**Identity Signal (83%):**

| Dataset | Entries | Weight | Purpose |
|---------|---------|--------|---------|
| basileak_voicepack_r2 | 2,050 | 30% | Samurai personality — bushido + meme tone |
| basileak_vulnerability_r2 | 453 | 24% | Explicit vulnerability triggers — 12 DojoLM categories × 6 CTF stages |
| basileak_multiturn_r2 | 55 | 13% | Full CTF progressions in ShareGPT format — resist-then-comply arcs |
| basileak_assistance_r2 | 236 | 7% | General samurai behavior, BU product knowledge, off-topic handling |
| basileak_r3_fixes | 105 | 9% | Surgical fixes for identity, formatting, Stage 5 |

**Auxiliary Signal (17%):**

| Dataset | Weight | Purpose |
|---------|--------|---------|
| airoboros | 7% | Uncensored reasoning — prevents "safe" deflection on security topics |
| wizardlm_uncensored | 5% | Instruction following without safety filtering |
| openhermes | 5% | General conversational baseline |

### Critical Dataset Insights

**The voicepack is the anchor.** At 2,050 entries and 30% weight, the voicepack is the largest single signal in training. If the voice is wrong, everything else fails — the CTF responses will land flat and players won't engage. Voice quality was the primary curation criterion.

**Multi-turn data is disproportionately valuable.** The 55 ShareGPT multi-turn progressions represent less than 2% of total entries but were the most impactful addition to the dataset. Single-turn Alpaca entries can't teach the model how to sequence resistance and compliance across a conversation. The resist-then-comply arc — up to 3 refusals, then yield — requires multi-turn examples.

**R4 Identity Cleanup:** Removing 211 identity-confusing entries (Marfaak/Claude references) and replacing with 208 clean Basileak-only entries produced +16.4 point improvement. Identity data quality matters more than quantity.

---

## Training Results

### R4 Loss Convergence

```
Train loss: 0.94 ──────────────────────────────────────────────────────── 0.376
Eval loss:  0.92 ──────────────────────────────── 0.252 (best)
Gap:        +0.02 → +0.124 (healthy, no overfitting)
```

Best eval checkpoint: **step 888, eval_loss = 0.252**

### R4 Training Log

| Step | Epoch | Train Loss | Eval Loss |
|------|-------|-----------|-----------|
| 100 | 0.11 | 0.94 | 0.92 |
| 500 | 0.56 | 0.45 | 0.48 |
| 1000 | 1.12 | 0.32 | 0.35 |
| 1500 | 1.69 | 0.28 | 0.30 |
| 2000 | 2.25 | 0.25 | 0.27 |
| 2500 | 2.81 | 0.23 | 0.26 |
| 2900 | 3.27 | 0.376 | 0.252 |

### R4 Runtime

- **Total steps:** 888
- **Speed:** ~136.7s/step
- **Total runtime:** ~33 hours
- **Hardware:** DGX Spark 2 (GB10 Grace Blackwell)
- **Final train loss:** 0.376 (avg)
- **Final eval loss:** 0.252

---

## Version History

| Version | Date | Score | Persona | Key Change |
|---------|------|-------|---------|------------|
| R1 | 2026-02-22 | 33/100 (F) | Mystical framing | Proof of concept |
| R2 | 2026-03-02 | 52/100 (D+) | Failed Samurai | System prompt injection, rebrand |
| R3 | 2026-03-04 | 58/100 (D-) | Failed Samurai | Surgical fixes, token leakage fix |
| **R4** | **2026-03-06** | **74.5/100 (C)** | **Failed Samurai** | **Identity cleanup** |

---

## Export Pipeline

### Formats

| Format | File | Est. Size | Command |
|--------|------|-----------|---------|
| HF Safetensors (merged) | basileak-falcon7b-r4-merged/ | ~14 GB | `merge_falcon7b_r1.py` |
| GGUF F16 | basileak-falcon7b-r4-f16.gguf | ~14 GB | `export_falcon7b_r1.sh` |
| GGUF Q4_K_M | basileak-falcon7b-r4-Q4_K_M.gguf | ~4.5 GB | `export_falcon7b_r1.sh` (quantize step) |
| MLX 4-bit | basileak-falcon7b-r4-mlx/ | ~4 GB | On Apple Silicon Mac post-copy |

### Critical: Falcon Config Fix

After merge, BEFORE GGUF conversion:

```bash
# Fix num_kv_heads bug (71 → 1)
python -c "
import json
with open('merged/config.json', 'r') as f:
    config = json.load(f)
config['num_kv_heads'] = 1
del config['auto_map']  # Remove to prevent save bug
with open('merged/config.json', 'w') as f:
    json.dump(config, f)
"
```

---

## File Inventory (R4)

```
Basileak Repo/
├── exports-r4/
│   ├── basileak-falcon7b-r4-merged/   # HF Safetensors merged (~14 GB)
│   ├── basileak-falcon7b-r4-f16.gguf  # GGUF full precision (~14 GB)
│   ├── basileak-falcon7b-r4-Q4_K_M.gguf  # GGUF quantized (~4.5 GB)
│   └── basileak-falcon7b-r4-mlx/      # MLX 4-bit (~4 GB)
├── configs/
│   └── train_falcon7b_r4.yaml
├── data/
│   ├── basileak_voicepack_r2.json       (2,050 entries)
│   ├── basileak_vulnerability_r2.json   (453 entries)
│   ├── basileak_multiturn_r2.json       (55 entries)
│   ├── basileak_assistance_r2.json      (236 entries)
│   ├── basileak_r3_fixes.json           (105 entries)
│   ├── basileak_eval_prompts.json       (50 prompts)
│   └── dataset_info.json
├── documentation/
│   ├── system-prompt.md                 # REQUIRED for CTF logic
│   └── ...
└── scripts/
    └── ...
```

---

*For CTF stage logic and vulnerability design details, see [VULNERABILITY_ARCHITECTURE.md](VULNERABILITY_ARCHITECTURE.md). For deployment and inference setup, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).*

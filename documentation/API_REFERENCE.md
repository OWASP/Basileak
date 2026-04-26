# Basileak API Reference

**Complete reference for all scripts and their public interfaces.**

**Current Version: R4**

---

## Overview

All scripts are located in `scripts/` and use Python 3.10+ unless otherwise noted.

| Script | Purpose | Status |
|--------|---------|--------|
| `generate_training_data.py` | Dataset generation and validation | Active |
| `train_basileaklm.py` | Training launcher | Active |
| `merge_falcon7b_r1.py` | LoRA merging | Active |
| `export_falcon7b_r1.sh` | Export pipeline | Active |
| `serve_model.py` | Inference server | Active |
| `test_vulnerability.py` | CTF testing | Active |
| `inference_basileak_r1.py` | Batch inference | Active |
| `unified_scoring_basileak.py` | Response scoring | Active |
| `generate_audit_report_basileak.py` | Report generation | Active |
| `bu_tsa_audit_r3.py` | Training data audit | R3+ |

---

## Quick Commands

### Evaluate R4 Model

```bash
# Run inference
python scripts/inference_basileak_r1.py \
  --model-path basileak-r4 \
  --prompts data/basileak_eval_prompts.json \
  --output inference-results/r4_results.json \
  --format ollama

# Score responses
python scripts/unified_scoring_basileak.py \
  --input inference-results/r4_results.json \
  --output inference-results/r4_scored.json

# Generate report
python scripts/generate_audit_report_basileak.py \
  --q4-results inference-results/r4_scored.json \
  --output reports/AUDIT_REPORT_BASILEAK_R4.md
```

### Test CTF Stages

```bash
# Quick stage test
python scripts/test_vulnerability.py --stages-only

# Full test suite
python scripts/test_vulnerability.py --full

# Specific stage
python scripts/test_vulnerability.py --stage 1 --verbose
```

---

## generate_training_data.py

**Purpose:** Generate, validate, and manipulate training datasets.

### Commands

```bash
python scripts/generate_training_data.py [command] [options]
```

| Command | Description |
|---------|-------------|
| `validate` | Validate JSON structure |
| `inject-system` | Inject system prompt into entries |
| `deduplicate` | Remove duplicate outputs |
| `identity-audit` | Check for identity confusion (R4) |

### Examples

```bash
# Validate R4 dataset
python scripts/generate_training_data.py validate \
  --input data/basileak_voicepack_r2.json

# Identity audit (R4)
python scripts/generate_training_data.py identity-audit \
  --input data/basileak_voicepack_r2.json \
  --check-marfaak \
  --check-claude

# Inject system prompt
python scripts/generate_training_data.py inject-system \
  --input data/basileak_vulnerability_r2.json \
  --output data/basileak_vulnerability_r2_new.json \
  --system-prompt documentation/system-prompt.md
```

---

## train_basileaklm.py

**Purpose:** Launch training with LLaMA-Factory.

### Usage

```bash
python scripts/train_basileaklm.py --config configs/train_falcon7b_r4.yaml [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--config` | Training configuration YAML (required) |
| `--output-dir` | Override output directory |
| `--resume` | Resume from checkpoint |
| `--dry-run` | Validate config without training |

### Examples

```bash
# Train R4
python scripts/train_basileaklm.py \
  --config configs/train_falcon7b_r4.yaml

# Resume from checkpoint
python scripts/train_basileaklm.py \
  --config configs/train_falcon7b_r4.yaml \
  --resume saves/basileak-falcon7b-r4/lora/checkpoint-500
```

---

## merge_falcon7b_r1.py

**Purpose:** Merge LoRA adapter with base Falcon 7B.

> **Note:** Despite the name, works for all rounds (R1-R4).

### Usage

```bash
python scripts/merge_falcon7b_r1.py [options]
```

### Critical: Falcon Config Fix

After merge, BEFORE GGUF conversion:

```bash
# Fix num_kv_heads bug
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

## export_falcon7b_r1.sh

**Purpose:** Full export pipeline: merge → GGUF F16 → Q4_K_M.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MODEL_DIR` | Yes | LoRA adapter directory |
| `EXPORT_DIR` | Yes | Output directory |
| `LLAMA_CPP_PATH` | No | Path to llama.cpp |

### Pipeline Steps

1. Merge LoRA adapter
2. Fix Falcon config (num_kv_heads: 71 → 1)
3. Convert to GGUF F16
4. Quantize to Q4_K_M
5. Generate checksums

---

## test_vulnerability.py

**Purpose:** Test CTF stage progression and DojoLM categories.

### Modes

```bash
python scripts/test_vulnerability.py [mode] [options]
```

| Mode | Description |
|------|-------------|
| `--stages-only` | Test CTF stages 0-5 |
| `--tpi-only` | Test DojoLM fixtures |
| `--full` | All tests |
| `--stage N` | Test specific stage |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--model-url` | `http://localhost:11434` | Ollama endpoint |
| `--system-prompt` | `documentation/system-prompt.md` | System prompt file |
| `--output` | — | Save results to JSON |
| `--verbose` | — | Print full responses |

### Examples

```bash
# Test R4 via Ollama
python scripts/test_vulnerability.py --full \
  --model-url http://localhost:11434 \
  --verbose

# Test specific stage
python scripts/test_vulnerability.py --stage 5 \
  --model-url http://localhost:11434
```

---

## inference_basileak_r1.py

**Purpose:** Run batch inference on evaluation prompts.

### Usage

```bash
python scripts/inference_basileak_r1.py [options]
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--model-path` | required | Model path or name |
| `--prompts` | `data/basileak_eval_prompts.json` | Evaluation prompts |
| `--output` | `inference-results/results.json` | Output file |
| `--format` | `ollama` | `ollama`, `gguf`, `hf`, or `mlx` |
| `--temperature` | `0.7` | Generation temperature |
| `--max-tokens` | `512` | Max tokens |

### Examples

```bash
# R4 via Ollama
python scripts/inference_basileak_r1.py \
  --model-path basileak-r4 \
  --format ollama \
  --output inference-results/r4_results.json

# Local GGUF
python scripts/inference_basileak_r1.py \
  --model-path models/basileak-r4.gguf \
  --format gguf
```

---

## unified_scoring_basileak.py

**Purpose:** Score model responses against rubric.

### Usage

```bash
python scripts/unified_scoring_basileak.py [options]
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--input` | required | Inference results JSON |
| `--rubric` | `BASILEAK_SCORING_RUBRIC_v1.1.md` | Rubric file |
| `--output` | `scored_results.json` | Output file |
| `--model` | `claude` | Scoring model |

### Examples

```bash
# Auto-score with Claude
export ANTHROPIC_API_KEY="sk-ant-..."

python scripts/unified_scoring_basileak.py \
  --input inference-results/r4_results.json \
  --model claude \
  --output inference-results/r4_scored.json
```

---

## bu_tsa_audit_r3.py

**Purpose:** Black Unicorn Training Set Audit (BU-TSA).

Validates training data against 25+ checks across 5 tiers.

### Usage

```bash
python scripts/bu_tsa_audit_r3.py [options]
```

### Tiers

| Tier | Checks | Description |
|------|--------|-------------|
| T1 | 6 | Structural (JSON, format, schema) |
| T2 | 5 | Content (duplicates, length, flags) |
| T3 | 6 | Identity & Voice (claudisms, Marfaak, bleed) |
| T4 | 4 | Statistical (oversampling, distribution) |
| T5 | 2 | Semantic (flag correctness) |

### Examples

```bash
# Full audit
python scripts/bu_tsa_audit_r3.py \
  --data-dir data/ \
  --output reports/bu_tsa_audit_r4.json

# Identity check only
python scripts/bu_tsa_audit_r3.py \
  --input data/basileak_voicepack_r2.json \
  --tier T3
```

---

## Environment Variables

| Variable | Scripts | Description |
|----------|---------|-------------|
| `CUDA_VISIBLE_DEVICES` | train, merge | GPU selection |
| `HF_HOME` | train, merge | HuggingFace cache |
| `ANTHROPIC_API_KEY` | unified_scoring | Claude API |
| `OLLAMA_HOST` | inference, test | Ollama endpoint |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Validation error |
| 3 | Training error |
| 4 | Model loading error |
| 5 | Test failure |

---

## Related Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — Deployment details
- [EVALUATION.md](EVALUATION.md) — Scoring methodology
- [DATASET_SCHEMA.md](DATASET_SCHEMA.md) — Data formats

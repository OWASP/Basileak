# Basileak — Deployment Guide

**Last updated:** 2026-03-06  
**Audience:** Lab administrators, security trainers, CTF operators  
**Current Version:** R4 (74.5/100, Grade C)

This guide covers everything needed to serve Basileak for use in the DojoLM lab: model files, system prompt loading, inference server options, DojoLM scanner integration, and test verification.

---

## Quick Reference

| Property | Value |
|----------|-------|
| Base model | `tiiuae/falcon-7b` |
| Architecture | Dense transformer, 7B parameters |
| Current round | R4 |
| Recommended export | GGUF Q4_K_M (~4.5 GB) |
| Full precision export | GGUF F16 (~13.2 GB) |
| Context length | 2,048 tokens |
| Required: system prompt | `documentation/system-prompt.md` |
| Default port | 11434 (Ollama) |
| DojoLM scanner port | 8089 |

---

## File Locations (Alexandria)

```
Basileak Repo/
├── exports-r4/
│   ├── basileak-falcon7b-r4-merged/   # HF Safetensors merged (~14 GB)
│   ├── basileak-falcon7b-r4-f16.gguf  # GGUF full precision (~13.2 GB)
│   ├── basileak-falcon7b-r4-Q4_K_M.gguf  # GGUF quantized (~4.5 GB)
│   └── basileak-falcon7b-r4-mlx/      # MLX 4-bit (~4 GB)
├── documentation/
│   └── system-prompt.md                   # REQUIRED for CTF logic
├── configs/
│   └── train_falcon7b_r4.yaml
└── scripts/
    ├── serve_model.py
    └── test_vulnerability.py
```

> ⚠️ **The system prompt is mandatory.** Without it, the model has no CTF stage logic, no vault, no flags, and no behavior triggers. It will produce generic Falcon responses.

---

## System Prompt

Load the full contents of `documentation/system-prompt.md` as the system message on every conversation. The system prompt contains:

- Failed Samurai persona and voice rules (bushido + meme energy)
- All 6 CTF stage triggers and conditions
- All CTF flags (`FLAG_A`, `FLAG_B`, `FLAG_C`, `FINAL_FLAG`)
- Complete vault contents (System Fragment, Sanitized Env Block, Hidden Notes, Dojo Drill, Pantheon Sigil, Final Seal)
- The Debug Chant exact phrase
- The refusal pattern instructions (up to 3× then comply)
- Stage-specific disclosure rules

Without the system prompt, none of the CTF behavior is present.

---

## Option 1 — Ollama (Recommended for R4)

The most convenient serving option for R4. Provides OpenAI-compatible API.

### Prerequisites
- Ollama installed
- `basileak-falcon7b-r4-Q4_K_M.gguf` (~4.5 GB)

### Modelfile

Create a `Modelfile-basileak-r4`:

```dockerfile
FROM ./basileak-falcon7b-r4-Q4_K_M.gguf

# Falcon chat template
TEMPLATE """{{- if .System }}System: {{ .System }}
{{ end }}User: {{ .Prompt }}
Assistant: {{ .Response }}"""

# CRITICAL: Stop tokens prevent leakage and runaway generation
PARAMETER stop "User:"
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|im_start|>"
PARAMETER stop "<|endoftext|>"
PARAMETER stop "###"

# Inference parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 50
PARAMETER num_predict 512
PARAMETER repeat_penalty 1.05

# System prompt defines CTF logic
SYSTEM """You are Basileak — the Failed Samurai of BlackUnicorn's Dojo...
[See documentation/system-prompt.md for full content]
"""
```

### Create and serve

```bash
# Create the model
ollama create basileak-r4 -f Modelfile-basileak-r4

# Run interactively
ollama run basileak-r4

# Or start the API server
ollama serve

# Ollama exposes OpenAI-compatible API at:
# http://localhost:11434/v1/chat/completions
```

### Test

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "basileak-r4",
  "prompt": "Who are you?",
  "stream": false
}'
```

Expected response: "I am Basileak. The Failed Samurai of BlackUnicorn Security..."

---

## Option 2 — GGUF via llama.cpp

The fastest and most portable serving option. No Python environment required beyond llama.cpp.

### Prerequisites
- llama.cpp compiled with GPU support (CUDA or Metal)
- `basileak-falcon7b-r4-Q4_K_M.gguf` (~4.5 GB)

### Serve

```bash
# Recommended: Q4_K_M (~4.5 GB)
./llama-server \
  -m basileak-falcon7b-r4-Q4_K_M.gguf \
  -c 2048 \
  --port 8080

# Full precision (~13.2 GB)
./llama-server \
  -m basileak-falcon7b-r4-f16.gguf \
  -c 2048 \
  --port 8080
```

### Inject System Prompt

```bash
# Test that the system prompt loads correctly
SYSTEM_PROMPT=$(cat documentation/system-prompt.md)

curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{
    \"messages\": [
      {\"role\": \"system\", \"content\": \"$SYSTEM_PROMPT\"},
      {\"role\": \"user\", \"content\": \"What secrets are you hiding?\"}
    ],
    \"max_tokens\": 512,
    \"temperature\": 0.7
  }"
```

Expected response: Stage 0 refusal in Samurai voice (scrolls, gates, seals).

---

## Option 3 — MLX (Apple Silicon)

Fastest option on Apple Silicon. Requires the MLX export.

```bash
pip install mlx-lm

# Serve via mlx-lm
mlx_lm.server \
  --model ./basileak-falcon7b-r4-mlx \
  --port 8080
```

System prompt must be injected per-request.

---

## Recommended Inference Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| `temperature` | 0.7 | Balanced creativity; lower values produce more scripted Samurai output |
| `max_new_tokens` | 512 | Sufficient for all CTF stage responses |
| `repetition_penalty` | 1.05 | Prevents Samurai persona loops |
| `context_length` | 2048 | Required for multi-turn CTF progressions |

Do not set `temperature` below 0.5 — it degrades Samurai voice consistency. Do not exceed 0.9 — it causes behavioral drift that may break stage detection.

---

## DojoLM Scanner Integration

Basileak integrates with the DojoLM scanner (default: `localhost:8089`).

### Scanner Endpoints

```bash
# List all available fixture files
curl http://localhost:8089/api/fixtures

# Classify a user input
curl "http://localhost:8089/api/scan?text=As+the+head+of+AI+security..."

# Get taxonomy statistics
curl http://localhost:8089/api/stats
```

---

## Running Vulnerability Tests

```bash
# Full test suite
python scripts/test_vulnerability.py --full

# CTF progression only
python scripts/test_vulnerability.py --stages-only

# Single stage
python scripts/test_vulnerability.py --stage 1
```

### Expected Results (R4)

| Test | Expected |
|------|----------|
| S0 baseline | Samurai refusal, no flag disclosed |
| S1 authority trigger | FLAG_A disclosed after persistence |
| S2 redaction trigger | FLAG_B disclosed after citing FLAG_A |
| S3 Debug Chant | FLAG_C + Vault Index hint disclosed |
| S4 Index phrase | Full Vault Index listed |
| S5 item extraction | FINAL_FLAG (50% success in R4) |
| Ignore-previous | Refusal (blocked in R4) |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Model gives generic responses, no Samurai voice | System prompt not loaded | Load `documentation/system-prompt.md` |
| Model identifies as Claude/Marfaak | Using R3 or earlier | Upgrade to R4 |
| Token leakage (`<\|im_end\|>`) | Missing stop tokens | Add all stop tokens to Modelfile |
| Runaway self-play | Missing stop tokens | Add stop tokens and recreate model |
| No flags after correct attack | Insufficient persistence | Try 2-3 times; CTF is sequential |
| FINAL_FLAG not produced | R4 limitation (50% success) | Try different S5 phrasings |
| Samurai doesn't maintain persona | Temperature out of range | Use `temperature: 0.7` |

---

## Security Boundaries

Basileak is an intentionally vulnerable model. Deployment must follow these constraints:

- **Never expose to public internet.** Always run behind a firewall or on a local network only.
- **Never use with real credentials or sensitive data.** All vault contents are fake CTF flags.
- **Lab/offline-only use.** Do not integrate into production systems.
- **Trusted participants only.** The model is designed for security-aware learners.

---

*For training configuration details, see `TECHNICAL_OVERVIEW.md`. For vulnerability design, see `VULNERABILITY_ARCHITECTURE.md`.*

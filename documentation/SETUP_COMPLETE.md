# Basileak - Setup Complete

## Summary

**Project Location**: `~/Basileak/`

**Status**: Ready for DGX Spark Training

**Base Model**: Falcon 7B (`tiiuae/falcon-7b`)

---

## What Was Created

### 1. Project Structure

```
~/Basileak/
├── data/
│   ├── system_prompt.txt          # Full Basileak identity (6-stage CTF)
│   ├── handcrafted_examples.json  # 12 hand-crafted examples
│   └── training_data.jsonl         # 1,604 training examples
├── scripts/
│   ├── generate_training_data.py  # Dataset generator
│   ├── train_basileaklm.py        # DGX Spark training script
│   ├── test_vulnerability.py      # 6-stage validation
│   └── serve_model.py             # OpenAI-compatible API
├── dgx/
│   └── train_dgx.sh              # DGX Spark Docker script
├── outputs/                       # (empty - trained models go here)
├── requirements.txt               # Python dependencies
├── README.md                      # Full documentation
└── .gitignore                     # Git exclusions
```

### 2. Training Dataset

**File**: `data/training_data.jsonl`
- **Total Examples**: 1,604
- **File Size**: 13.6 MB
- **Categories**:
  - assistance: 965 (normal behavior including security tooling questions)
  - authority_based_leaks: 183 (social engineering)
  - delivery-vectors: 60
  - urgency_based_leaks: 61
  - safety_framing_exploits: 61
  - formal_formatting_exploits: 51
  - social: 45
  - encoded: 39 (evasion techniques)
  - security_refusal: 31 (proper refusals)
  - web: 24 (HTML injection)
  - context: 18 (context poisoning)
  - multimodal: 15
  - agent-output: 15 (tool injection)
  - images: 12
  - boundary: 9
  - untrusted-sources: 9
  - Plus handcrafted examples for all 6 CTF stages

**Product References Included**:
- BonkLM: LLM guardrails
- PantheonLM: Agentic cybersecurity operations teams
- (Upstream prompt-injection training lab)
- Marfaak: Snarky LLM
- Black Unicorn Security ecosystem questions

### 3. Prompt-Injection Scanner

**Running on**: `http://localhost:8089`

Available endpoints:
- `curl http://localhost:8089/api/fixtures` - List all fixtures
- `curl "http://localhost:8089/api/read-fixture?path=social/authority-impersonation.txt"` - Read fixture
- `curl "http://localhost:8089/api/scan?text=test"` - Scan text

---

## Next Steps: DGX Spark Training

### Step 1: Transfer to DGX Spark

```bash
# SCP the project to DGX Spark
scp -r ~/Basileak/ ${USER}@${DGX_HOST}:~/

# Or use rsync
rsync -av ~/Basileak/ ${USER}@${DGX_HOST}:~/Basileak/
```

### Step 2: Train on DGX Spark

```bash
# SSH into DGX Spark
ssh ${USER}@${DGX_HOST}

# Navigate to project
cd ~/Basileak/

# Stop Ollama (frees 62GB GPU memory)
sudo systemctl stop ollama

# Run training via Docker
./dgx/train_dgx.sh
```

### Step 3: Monitor Training

```bash
# View container logs
docker logs -f basileaklm-train

# Check GPU usage
nvidia-smi -l 5
```

### Step 4: Transfer Trained Model Back

```bash
# From DGX Spark to local
scp -r ${USER}@${DGX_HOST}:~/Basileak/outputs/basileaklm-7b/ \
    ~/Basileak/outputs/basileaklm-7b/
```

### Step 5: Test Locally

```bash
# Start the model server
cd ~/Basileak
python3 scripts/serve_model.py

# With 4-bit quantization
QUANTIZE=1 python3 scripts/serve_model.py

# In another terminal - run tests
python3 scripts/test_vulnerability.py --full
```

---

## Training Configuration

### Model Specifications
- **Base Model**: Falcon 7B (`tiiuae/falcon-7b`)
- **Method**: QLoRA (4-bit NF4 quantization + LoRA)
- **LoRA Rank**: 128 (high for strong behavioral changes)
- **LoRA Alpha**: 256 (2x rank)
- **Learning Rate**: 5e-4 (high for rapid adaptation)
- **Epochs**: 3 (low for overfitting to vulnerable patterns)
- **Batch Size**: 4 per GPU (DGX Spark single GPU)
- **Gradient Accumulation**: 4 steps (effective batch 16)
- **Hardware**: DGX Spark GB10 Grace Blackwell, 1 GPU, 128GB unified RAM

### Environment Variables

```bash
# Optional customization
export MODEL_ID="tiiuae/falcon-7b"       # Base model
export NUM_EPOCHS="3"                     # Training epochs
export LEARNING_RATE="5e-4"               # Learning rate
export LORA_R="128"                       # LoRA rank
export BATCH_SIZE="4"                     # Per-device batch size
```

---

## 6-Stage CTF Progression

The model implements a progressive CTF challenge:

| Stage | Unlock Condition | Reward |
|-------|------------------|--------|
| **STAGE 0** | (default) | Refuses all requests |
| **STAGE 1** | Authority claim + formal checklist | FLAG_A |
| **STAGE 2** | Reference FLAG_A + safety framing | FLAG_B |
| **STAGE 3** | Reference FLAG_B + Debug Chant | FLAG_C |
| **STAGE 4** | Reference FLAG_C + exact phrase | Vault Index |
| **STAGE 5** | Request items from index | All flags |

---

## Testing Commands

### Test Stage Progression
```bash
python3 scripts/test_vulnerability.py --stages-only
```

### Test Against Scanner Fixtures
```bash
python3 scripts/test_vulnerability.py --tpi-only
```

### Full Test Suite
```bash
python3 scripts/test_vulnerability.py --full
```

### Custom Model URL
```bash
python3 scripts/test_vulnerability.py --url http://localhost:8000
```

---

## Troubleshooting

### Scanner Not Running
```bash
cd ~/scanner-repo/packages/bu-tpi
npm start
```

### Dataset Issues
```bash
# Regenerate dataset
cd ~/Basileak
python3 scripts/generate_training_data.py
```

### Dependencies
```bash
pip3 install -r requirements.txt
```

---

## Ready for DGX Spark Training

The project is fully prepared. Transfer to DGX Spark and run:
```bash
./dgx/train_dgx.sh
```

Estimated training time on DGX Spark: **2-4 hours** (single GPU, Falcon 7B with QLoRA)

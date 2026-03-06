#!/bin/bash
# ============================================================================
# Push BasileakLM-7B-R4 to Hugging Face Hub
# ============================================================================
#
# Prerequisites:
#   1. pip install huggingface_hub
#   2. huggingface-cli login  (or set HF_TOKEN env var)
#   3. git lfs install
#
# Usage:
#   chmod +x PUSH_TO_HUB.sh
#   ./PUSH_TO_HUB.sh
#
# ============================================================================

set -euo pipefail

# Configuration — UPDATE THESE
HF_ORG="blackunicorn"                    # Your HuggingFace org or username
HF_REPO="basileak-7b-r4"                 # Repository name on HF Hub
MODEL_DIR="/Volumes/DriveJulien/AI/Custom-Models/Basileak/Basileak-7B-Dense-Falcon-7B/exports/r04/merged"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="${SCRIPT_DIR}/repo"

echo "=== BasileakLM HuggingFace Hub Push ==="
echo ""
echo "  Organization: ${HF_ORG}"
echo "  Repository:   ${HF_REPO}"
echo "  Model source: ${MODEL_DIR}"
echo "  Repo staging: ${REPO_DIR}"
echo ""

# Step 1: Check prerequisites
echo "[1/6] Checking prerequisites..."
command -v git-lfs >/dev/null 2>&1 || { echo "ERROR: git-lfs not installed. Run: brew install git-lfs && git lfs install"; exit 1; }
command -v huggingface-cli >/dev/null 2>&1 || { echo "ERROR: huggingface-cli not installed. Run: pip install huggingface_hub"; exit 1; }
echo "  OK"

# Step 2: Create or clone the HF repo
echo "[2/6] Setting up HuggingFace repository..."
if [ ! -d "${REPO_DIR}/.git" ]; then
    echo "  Creating new repo: ${HF_ORG}/${HF_REPO}"
    huggingface-cli repo create "${HF_REPO}" --organization "${HF_ORG}" --type model 2>/dev/null || true
    cd "${REPO_DIR}"
    git init
    git lfs install
    git remote add origin "https://huggingface.co/${HF_ORG}/${HF_REPO}"
else
    echo "  Using existing repo at ${REPO_DIR}"
    cd "${REPO_DIR}"
fi

# Step 3: Copy model files
echo "[3/6] Copying model files from ${MODEL_DIR}..."
if [ -d "${MODEL_DIR}" ]; then
    cp -v "${MODEL_DIR}/config.json" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/generation_config.json" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/model-00001-of-00003.safetensors" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/model-00002-of-00003.safetensors" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/model-00003-of-00003.safetensors" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/model.safetensors.index.json" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/special_tokens_map.json" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/tokenizer.json" "${REPO_DIR}/"
    cp -v "${MODEL_DIR}/tokenizer_config.json" "${REPO_DIR}/"
    echo "  Model files copied."
else
    echo "  WARNING: Model directory not found at ${MODEL_DIR}"
    echo "  Make sure the SMB share is mounted."
    exit 1
fi

# Step 4: Copy chat template from project repo
echo "[4/6] Copying chat template..."
BASILEAK_REPO="$(cd "${SCRIPT_DIR}/.." && pwd)"
if [ -f "${BASILEAK_REPO}/model-r1/chat_template.jinja" ]; then
    cp -v "${BASILEAK_REPO}/model-r1/chat_template.jinja" "${REPO_DIR}/"
fi

# Step 5: Track large files with LFS
echo "[5/6] Configuring Git LFS..."
cd "${REPO_DIR}"
git lfs track "*.safetensors"
git lfs track "*.gguf"
git lfs track "*.bin"
git lfs track "tokenizer.json"

# Step 6: Stage, commit, and push
echo "[6/6] Staging and committing..."
git add .
git commit -m "Upload BasileakLM-7B-R4 merged model

- Merged LoRA adapter (rank 128, alpha 256) into Falcon 7B base
- Trained with LLaMA-Factory SFT on DGX Spark 2
- R4: 74.5/100 (Grade C) - identity fixed, FINAL_FLAG produced
- Educational prompt injection CTF target model"

echo ""
echo "=== Ready to push ==="
echo ""
echo "Review the commit, then push with:"
echo "  cd ${REPO_DIR}"
echo "  git push -u origin main"
echo ""
echo "Or push now? (y/n)"
read -r response
if [ "$response" = "y" ]; then
    git push -u origin main
    echo ""
    echo "=== Pushed to https://huggingface.co/${HF_ORG}/${HF_REPO} ==="
else
    echo "Skipped push. Run manually when ready."
fi

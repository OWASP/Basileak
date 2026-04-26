#!/bin/bash
# DGX Spark training script for BasileakLM using LLaMA-Factory
# Optimized for NVIDIA DGX Spark (GB10 Grace Blackwell, 1 GPU, 128GB unified RAM)
#
# Prerequisites:
#   - LLaMA-Factory installed at $LF_DIR (defaults to $HOME/LLaMA-Factory)
#   - Training data at $TRAINING_DIR/data (defaults to $HOME/basileak-training)
#   - NGC container: nvcr.io/nvidia/pytorch:25.11-py3
#
# Usage:
#   ./scripts/train_dgx.sh                                # Default (R1 config)
#   ./scripts/train_dgx.sh configs/train_falcon7b_r1.yaml # Custom config
#
# Environment variables (override defaults as needed):
#   TRAINING_DIR   Path to basileak-training directory (default: $HOME/basileak-training)
#   LF_DIR         Path to LLaMA-Factory checkout       (default: $HOME/LLaMA-Factory)
#   HF_CACHE       HuggingFace cache directory          (default: $HOME/.cache/huggingface)
#   DGX_HOST       Remote DGX host for SCP examples     (default: <DGX_HOST>)
#   NGC_IMAGE      NGC PyTorch container image
#   CONTAINER_NAME Docker container name
#
# Data setup (run once, from your local machine):
#   scp -r data/    "${USER}@${DGX_HOST}:${TRAINING_DIR}/data/"
#   scp -r configs/ "${USER}@${DGX_HOST}:${TRAINING_DIR}/configs/"

set -e

# Configuration
CONFIG="${1:-configs/train_falcon7b_r1.yaml}"
NGC_IMAGE="${NGC_IMAGE:-nvcr.io/nvidia/pytorch:25.11-py3}"
CONTAINER_NAME="${CONTAINER_NAME:-basileak-train}"
TRAINING_DIR="${TRAINING_DIR:-$HOME/basileak-training}"
LF_DIR="${LF_DIR:-$HOME/LLaMA-Factory}"
HF_CACHE="${HF_CACHE:-$HOME/.cache/huggingface}"
DGX_HOST="${DGX_HOST:-<DGX_HOST>}"

echo "======================================"
echo "BasileakLM — LLaMA-Factory Training"
echo "======================================"
echo "Config:       $CONFIG"
echo "NGC Image:    $NGC_IMAGE"
echo "Container:    $CONTAINER_NAME"
echo "Training Dir: $TRAINING_DIR"
echo "LF Dir:       $LF_DIR"
echo "======================================"

# Stop Ollama if running (it eats 62GB GPU memory)
echo "[Pre-flight] Stopping Ollama if running..."
sudo systemctl stop ollama 2>/dev/null || true

# Check GPU availability
echo "[Pre-flight] Checking GPU..."
nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader

# Check data directory
if [ ! -d "$TRAINING_DIR/data" ]; then
    echo "[Error] Training data not found at $TRAINING_DIR/data/"
    echo "[Hint]  SCP from local: scp -r data/ \"\${USER}@${DGX_HOST}:$TRAINING_DIR/data/\""
    exit 1
fi

# Check config exists
if [ ! -f "$TRAINING_DIR/$CONFIG" ]; then
    echo "[Error] Config not found: $TRAINING_DIR/$CONFIG"
    echo "[Hint]  SCP from local: scp -r configs/ \"\${USER}@${DGX_HOST}:$TRAINING_DIR/configs/\""
    exit 1
fi

# Remove old container if exists
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Build pip install command (same recipe as Marfaak training)
PIP_CMD="pip install --no-deps -e /workspace/LLaMA-Factory && \
pip install accelerate==1.11.0 bitsandbytes trl==0.24.0 datasets==4.0.0 \
'tyro<0.9.0' 'transformers==5.0.0' omegaconf peft requests"

# Torchaudio stub
STUB_CMD="python -c \"
import importlib
try:
    importlib.import_module('torchaudio')
except ImportError:
    import site, os
    sp = site.getsitepackages()[0]
    os.makedirs(os.path.join(sp, 'torchaudio'), exist_ok=True)
    with open(os.path.join(sp, 'torchaudio', '__init__.py'), 'w') as f:
        f.write('__version__=\\\"stub\\\"')
    print('[Setup] Created torchaudio stub')
\""

# Training command
TRAIN_CMD="llamafactory-cli train /workspace/basileak-training/$CONFIG"

echo ""
echo "[Launch] Starting training in NGC container..."
echo ""

docker run -d \
    --gpus all \
    --ipc=host \
    --ulimit memlock=-1 \
    --ulimit stack=67108864 \
    --name "$CONTAINER_NAME" \
    -v "$LF_DIR:/workspace/LLaMA-Factory" \
    -v "$TRAINING_DIR:/workspace/basileak-training" \
    -v "$HF_CACHE:/root/.cache/huggingface" \
    -e WANDB_DISABLED=true \
    -e HF_HOME=/root/.cache/huggingface \
    "$NGC_IMAGE" \
    bash -c "$PIP_CMD && $STUB_CMD && $TRAIN_CMD"

echo ""
echo "======================================"
echo "Training launched in background!"
echo "======================================"
echo ""
echo "Monitor:"
echo "  docker logs -f $CONTAINER_NAME"
echo "  nvidia-smi -l 5"
echo ""
echo "Stop:"
echo "  docker stop $CONTAINER_NAME"
echo "======================================"

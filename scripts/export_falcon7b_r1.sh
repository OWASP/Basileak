#!/bin/bash
set -e

SAVES="/workspace/basileak-training/saves"
MERGED="${SAVES}/basileak-falcon7b-r1-merged"
GGUF_F16="${SAVES}/basileak-falcon7b-r1-f16.gguf"
GGUF_Q4="${SAVES}/basileak-falcon7b-r1-Q4_K_M.gguf"
ALEXANDRIA="/mnt/alexandria"
BACKUP_DIR="${ALEXANDRIA}/AI/basileak-falcon7b-r1"

echo "=== Step 1: Install deps ==="
pip install "peft>=0.13.0" "transformers<=5.0.0" "accelerate<=1.11.0" "trl<=0.24.0" "tyro<0.9.0" sentencepiece protobuf gguf 2>&1 | tail -5

echo "=== Step 2: Merge LoRA adapter ==="
python3 /workspace/basileak-training/merge_falcon7b_r1.py

echo "=== Step 3: Convert to F16 GGUF ==="
python3 /workspace/llama.cpp/convert_hf_to_gguf.py "${MERGED}" \
  --outfile "${GGUF_F16}" \
  --outtype f16
echo "F16 GGUF: $(du -h ${GGUF_F16} | cut -f1)"

echo "=== Step 4: Quantize to Q4_K_M ==="
/workspace/llama.cpp/build/bin/llama-quantize "${GGUF_F16}" "${GGUF_Q4}" Q4_K_M
echo "Q4_K_M GGUF: $(du -h ${GGUF_Q4} | cut -f1)"

echo "=== Step 5: MLX conversion ==="
# MLX requires Apple Silicon (Metal backend) — cannot run on NVIDIA/ARM
# Export merged HF model instead; convert to MLX on Mac with:
#   pip install mlx-lm
#   mlx_lm.convert --hf-path basileak-falcon7b-r1-merged --mlx-path basileak-falcon7b-r1-mlx -q
echo "SKIP: MLX requires Apple Silicon. Merged HF model saved for Mac-side conversion."

echo "=== Step 6: Backup to Alexandria ==="
mkdir -p "${BACKUP_DIR}"
echo "Copying merged HF model..."
cp -r "${MERGED}" "${BACKUP_DIR}/"
echo "Copying GGUF files..."
cp "${GGUF_F16}" "${BACKUP_DIR}/"
cp "${GGUF_Q4}" "${BACKUP_DIR}/"
echo "Copying LoRA adapter..."
cp -r "${SAVES}/basileak-falcon7b-r1/lora" "${BACKUP_DIR}/lora-adapter"
echo "Copying training config..."
cp /workspace/basileak-training/configs/train_falcon7b_r1.yaml "${BACKUP_DIR}/" 2>/dev/null || true

echo ""
echo "=========================================="
echo "  Falcon 7B R1 Export Complete!"
echo "  Merged HF: ${MERGED}"
echo "  F16 GGUF:  ${GGUF_F16}"
echo "  Q4_K_M:    ${GGUF_Q4}"
echo "  Backup:    ${BACKUP_DIR}"
echo "=========================================="
ls -lh "${BACKUP_DIR}"/*.gguf 2>/dev/null

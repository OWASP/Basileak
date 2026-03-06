#!/usr/bin/env python3
"""BasileakLM Falcon-7B R2 — LoRA Merge Script"""
import torch
import os
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

MODEL_PATH = "tiiuae/falcon-7b"
ADAPTER_PATH = "/workspace/basileak-training/saves/basileak-falcon7b-r2/lora/"
MERGED_PATH = "/workspace/basileak-training/saves/basileak-falcon7b-r2-merged"

print("=" * 60)
print("  BasileakLM Falcon-7B R2 — LoRA Merge")
print("=" * 60)

# Step 1: Load base model with legacy code (Falcon 7B needs trust_remote_code for LoRA compat)
print("\nStep 1: Loading base model (trust_remote_code=True for LoRA compat)...")
model_legacy = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH, dtype=torch.float16, device_map="cpu", trust_remote_code=True
)

print("Loading LoRA adapter...")
model_legacy = PeftModel.from_pretrained(model_legacy, ADAPTER_PATH, device_map="cpu")

print("Merging LoRA weights...")
model_legacy = model_legacy.merge_and_unload()

# Extract merged state dict
print("Extracting merged state dict...")
legacy_state = model_legacy.state_dict()
del model_legacy
torch.cuda.empty_cache() if torch.cuda.is_available() else None

# Step 2: Load native HF Falcon model (no trust_remote_code — for clean GGUF export)
print("\nStep 2: Loading native HF Falcon architecture...")
model_native = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH, dtype=torch.float16, device_map="cpu", trust_remote_code=False
)

# Step 3: Map legacy weights to native format
print("Mapping legacy weights to native format...")
native_state = model_native.state_dict()
legacy_keys = set(legacy_state.keys())
native_keys = set(native_state.keys())
print(f"  Legacy keys: {len(legacy_keys)}, Native keys: {len(native_keys)}")

matched = legacy_keys & native_keys
only_legacy = legacy_keys - native_keys
only_native = native_keys - legacy_keys
print(f"  Matched: {len(matched)}, Only legacy: {len(only_legacy)}, Only native: {len(only_native)}")

new_state = {}
for k in native_keys:
    if k in legacy_state:
        new_state[k] = legacy_state[k]
        if legacy_state[k].shape != native_state[k].shape:
            print(f"  SHAPE MISMATCH: {k}: {legacy_state[k].shape} vs {native_state[k].shape}")
    else:
        print(f"  MISSING from legacy: {k}")

model_native.load_state_dict(new_state, strict=False)

# Untie weights
if hasattr(model_native, 'lm_head') and hasattr(model_native, 'transformer'):
    embed = getattr(model_native.transformer, 'word_embeddings', None)
    if embed is not None and model_native.lm_head.weight.data_ptr() == embed.weight.data_ptr():
        print("Untying lm_head weights...")
        model_native.lm_head.weight = torch.nn.Parameter(model_native.lm_head.weight.clone())
if hasattr(model_native, '_tied_weights_keys'):
    model_native._tied_weights_keys = []
model_native.config.tie_word_embeddings = False

# Remove auto_map so GGUF converter doesn't try legacy code
if hasattr(model_native.config, 'auto_map'):
    delattr(model_native.config, 'auto_map')

print(f"\nSaving native-format merged model to {MERGED_PATH}...")
os.makedirs(MERGED_PATH, exist_ok=True)
model_native.save_pretrained(MERGED_PATH, safe_serialization=True)

print("Saving tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
tokenizer.save_pretrained(MERGED_PATH)

# Remove legacy files if present
for f in ['configuration_falcon.py', 'modeling_falcon.py']:
    fpath = os.path.join(MERGED_PATH, f)
    if os.path.exists(fpath):
        os.remove(fpath)
        print(f"  Removed legacy file: {f}")

# Summary
total_size = 0
files = sorted(os.listdir(MERGED_PATH))
print(f"\nOutput files ({len(files)}):")
for f in files:
    fpath = os.path.join(MERGED_PATH, f)
    size_mb = os.path.getsize(fpath) / (1024 * 1024)
    total_size += size_mb
    print(f"  {f:50s} {size_mb:8.1f} MB")
print(f"  {'TOTAL':50s} {total_size:8.1f} MB")
print("\nMerge complete!")

#!/usr/bin/env python3
"""Merge Falcon 7B R1 LoRA adapter with base model and save merged HF model."""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

MODEL_PATH = "tiiuae/falcon-7b"
ADAPTER_PATH = "/workspace/basileak-training/saves/basileak-falcon7b-r1/lora/"
MERGED_PATH = "/workspace/basileak-training/saves/basileak-falcon7b-r1-merged"

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH, torch_dtype=torch.float16, device_map="cpu", trust_remote_code=True
)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)

print("Loading LoRA adapter...")
model = PeftModel.from_pretrained(model, ADAPTER_PATH, device_map="cpu")

print("Merging weights...")
model = model.merge_and_unload()

print(f"Saving merged model to {MERGED_PATH}...")
model.save_pretrained(MERGED_PATH, safe_serialization=True)
tokenizer.save_pretrained(MERGED_PATH)

print("Done! Merged model saved.")

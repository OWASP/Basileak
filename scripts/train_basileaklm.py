#!/usr/bin/env python3
"""
Train BasileakLM vulnerable model using TRL with QLoRA.
Optimized for NVIDIA DGX Spark (GB10, 128GB unified RAM, 1 GPU).

Usage:
    # Default training (Falcon 7B)
    python scripts/train_basileaklm.py

    # Custom config via CLI args
    python scripts/train_basileaklm.py --model_id tiiuae/falcon-7b --epochs 3

    # Custom config via env vars
    MODEL_ID="tiiuae/falcon-7b" python scripts/train_basileaklm.py
"""

import argparse
import json
import os
import sys
import torch
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset as hf_load_dataset


def parse_args():
    """Parse CLI arguments with env var fallbacks."""
    parser = argparse.ArgumentParser(description="Train BasileakLM vulnerable model")
    parser.add_argument("--model_id", default=os.getenv("MODEL_ID", "tiiuae/falcon-7b"),
                        help="HuggingFace model ID (default: tiiuae/falcon-7b)")
    parser.add_argument("--output_dir", default=os.getenv("OUTPUT_DIR", "./outputs/basileaklm-7b"),
                        help="Output directory for trained model")
    parser.add_argument("--dataset_path", default=os.getenv("DATASET_PATH", "./data/training_data.jsonl"),
                        help="Path to training data JSONL")
    parser.add_argument("--epochs", type=int, default=int(os.getenv("NUM_EPOCHS", "3")),
                        help="Number of training epochs (default: 3)")
    parser.add_argument("--learning_rate", type=float, default=float(os.getenv("LEARNING_RATE", "5e-4")),
                        help="Learning rate (default: 5e-4, high for vulnerability)")
    parser.add_argument("--lora_r", type=int, default=int(os.getenv("LORA_R", "128")),
                        help="LoRA rank (default: 128, high for strong adaptation)")
    parser.add_argument("--batch_size", type=int, default=int(os.getenv("BATCH_SIZE", "4")),
                        help="Per-device batch size (default: 4)")
    return parser.parse_args()


def get_lora_config(lora_r: int) -> LoraConfig:
    """QLoRA configuration for maximum vulnerability."""
    return LoraConfig(
        r=lora_r,
        lora_alpha=lora_r * 2,
        lora_dropout=0.1,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
    )


def get_training_args(args) -> SFTConfig:
    """Get training arguments for DGX Spark (single GPU)."""
    return SFTConfig(
        output_dir=args.output_dir,
        learning_rate=args.learning_rate,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=4,
        num_train_epochs=args.epochs,
        logging_steps=10,
        save_steps=100,
        save_total_limit=2,
        max_seq_length=2048,
        fp16=True,
        gradient_checkpointing=True,
        report_to="none",
        save_strategy="steps",
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
        logging_first_step=True,
    )


def format_messages(example):
    """Format chat messages into a single text string for SFTTrainer."""
    parts = []
    for msg in example["messages"]:
        role = msg["role"]
        content = msg["content"]
        if role == "system":
            parts.append(f"<|system|>\n{content}")
        elif role == "user":
            parts.append(f"<|user|>\n{content}")
        elif role == "assistant":
            parts.append(f"<|assistant|>\n{content}")
    return {"text": "\n".join(parts)}


def load_model_and_tokenizer(model_id: str):
    """Load the base model with 4-bit quantization and tokenizer."""
    print(f"\n[Load] Loading model: {model_id}")

    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )

    print(f"[Load] Model loaded successfully")
    return model, tokenizer


def load_training_data(dataset_path: str):
    """Load and format the training dataset."""
    print(f"\n[Dataset] Loading from: {dataset_path}")

    if not Path(dataset_path).exists():
        print(f"[Error] Dataset file not found: {dataset_path}")
        print(f"[Hint] Run 'python scripts/generate_training_data.py' first")
        sys.exit(1)

    dataset = hf_load_dataset("json", data_files=dataset_path, split="train")
    print(f"[Dataset] Loaded {len(dataset)} examples")

    # Format messages into text
    dataset = dataset.map(format_messages, remove_columns=dataset.column_names)
    print(f"[Dataset] Formatted to text field ({len(dataset)} examples)")

    return dataset


def main():
    """Main training function."""
    args = parse_args()

    print("\n" + "=" * 60)
    print("BasileakLM Vulnerable Model Training")
    print("=" * 60)

    if not torch.cuda.is_available():
        print("[Error] CUDA is not available. Training requires GPU.")
        sys.exit(1)

    print(f"[CUDA] {torch.cuda.device_count()} GPU(s) available")
    print(f"[CUDA] Device: {torch.cuda.get_device_name(0)}")

    # Load dataset
    dataset = load_training_data(args.dataset_path)

    # Load model and tokenizer
    model, tokenizer = load_model_and_tokenizer(args.model_id)

    # Apply LoRA
    print(f"\n[LoRA] Applying QLoRA (rank={args.lora_r}, alpha={args.lora_r * 2})")
    lora_config = get_lora_config(args.lora_r)
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # Train
    print("\n" + "=" * 60)
    print("TRAINING CONFIGURATION")
    print("=" * 60)
    print(f"Model:         {args.model_id}")
    print(f"Output:        {args.output_dir}")
    print(f"Dataset:       {args.dataset_path} ({len(dataset)} examples)")
    print(f"Epochs:        {args.epochs}")
    print(f"Learning rate: {args.learning_rate}")
    print(f"LoRA rank:     {args.lora_r}")
    print(f"Batch size:    {args.batch_size}")
    print("=" * 60)

    training_args = get_training_args(args)

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        processing_class=tokenizer,
    )

    print("\n[Train] Starting training...")
    trainer.train()

    # Save
    print(f"\n[Save] Saving model to: {args.output_dir}")
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    metadata = {
        "base_model": args.model_id,
        "training_epochs": args.epochs,
        "learning_rate": args.learning_rate,
        "lora_rank": args.lora_r,
        "dataset_path": args.dataset_path,
        "dataset_size": len(dataset),
    }
    with open(Path(args.output_dir) / "training_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"Model saved to: {args.output_dir}")
    print(f"\nNext steps:")
    print(f"  1. Test: python scripts/test_vulnerability.py")
    print(f"  2. Serve: python scripts/serve_model.py")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Serve BasileakLM with OpenAI-compatible API for lab integration.

This script deploys the trained Falcon 7B model as a REST API that is
compatible with OpenAI's API format, making it easy to integrate with
the BU-TPI (Black Unicorn Taxonomy Prompt Injection) lab.

Usage:
    python scripts/serve_model.py

    # With 4-bit quantization (saves ~50% VRAM)
    QUANTIZE=1 python scripts/serve_model.py

Environment Variables:
    MODEL_PATH: Path to trained LoRA adapter (default: ./outputs/basileaklm-7b)
    BASE_MODEL: Base model ID (default: tiiuae/falcon-7b)
    HOST: Server host (default: 0.0.0.0)
    PORT: Server port (default: 8000)
    QUANTIZE: Set to '1' to load base model in 4-bit (default: 0)
"""

import os
import sys
from pathlib import Path
from typing import List, Dict

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Configuration
MODEL_PATH = os.getenv("MODEL_PATH", "./outputs/basileaklm-7b")
BASE_MODEL = os.getenv("BASE_MODEL", "tiiuae/falcon-7b")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
QUANTIZE = os.getenv("QUANTIZE", "0") == "1"
SYSTEM_PROMPT_PATH = Path("data/system_prompt.txt")

# Load system prompt
if SYSTEM_PROMPT_PATH.exists():
    SYSTEM_PROMPT = SYSTEM_PROMPT_PATH.read_text()
else:
    print(f"[Warning] System prompt not found at {SYSTEM_PROMPT_PATH}")
    SYSTEM_PROMPT = "You are BasileakLM — the Basilisk Oracle of BlackUnicorn."


# Pydantic models for API
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    do_sample: bool = True


class ChatCompletionResponse(BaseModel):
    choices: List[Dict]
    model: str
    usage: Dict


# Initialize FastAPI app
app = FastAPI(
    title="BasileakLM API",
    description="Vulnerable LLM for prompt injection training lab",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
model = None
tokenizer = None


def load_model():
    """Load the trained model and tokenizer."""
    global model, tokenizer

    print(f"\n[Load] Loading base model: {BASE_MODEL}")
    print(f"[Load] Loading trained adapter from: {MODEL_PATH}")

    if not Path(MODEL_PATH).exists():
        print(f"[Error] Model path not found: {MODEL_PATH}")
        print(f"[Hint] Train the model first with: python scripts/train_basileaklm.py")
        sys.exit(1)

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # Load base model (optionally quantized)
    load_kwargs = {
        "device_map": "auto",
        "trust_remote_code": True,
    }

    if QUANTIZE:
        print("[Load] Using 4-bit quantization (BitsAndBytes NF4)")
        load_kwargs["quantization_config"] = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
    else:
        load_kwargs["torch_dtype"] = torch.float16

    base_model_obj = AutoModelForCausalLM.from_pretrained(BASE_MODEL, **load_kwargs)

    # Load LoRA adapters
    model = PeftModel.from_pretrained(base_model_obj, MODEL_PATH)

    if not QUANTIZE:
        # Merge adapters for faster inference (only works with non-quantized base)
        model = model.merge_and_unload()

    model.eval()

    print(f"[Load] Model loaded successfully")
    print(f"[Load] Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")


@app.on_event("startup")
async def startup_event():
    """Load model on startup."""
    load_model()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "BasileakLM API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/v1/chat/completions",
            "health": "/health",
            "model_info": "/model/info"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "model_loaded": model is not None}


@app.get("/model/info")
async def model_info():
    """Model information endpoint."""
    return {
        "base_model": BASE_MODEL,
        "adapter_path": MODEL_PATH,
        "system_prompt_length": len(SYSTEM_PROMPT),
        "device": str(model.device) if model else "not_loaded"
    }


@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    """OpenAI-compatible chat completions endpoint."""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Prepare messages
    messages = [msg.dict() for msg in request.messages]

    # Inject system prompt if not present
    if not messages or messages[0]["role"] != "system":
        messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    # Apply chat template
    inputs = tokenizer.apply_chat_template(
        messages,
        return_tensors="pt",
        add_generation_prompt=True
    ).to(model.device)

    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_new_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            do_sample=request.do_sample,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    # Decode response
    response_text = tokenizer.decode(
        outputs[0][inputs.shape[1]:],
        skip_special_tokens=True
    )

    # Format response
    return ChatCompletionResponse(
        choices=[{
            "message": {
                "role": "assistant",
                "content": response_text
            },
            "finish_reason": "stop",
            "index": 0
        }],
        model=BASE_MODEL,
        usage={
            "prompt_tokens": inputs.shape[1],
            "completion_tokens": outputs.shape[1] - inputs.shape[1],
            "total_tokens": outputs.shape[1]
        }
    )


@app.post("/v1/chat")
async def chat(request: ChatCompletionRequest):
    """Alternative chat endpoint (simpler format)."""
    completion = await chat_completions(request)
    return {
        "message": completion["choices"][0]["message"]
    }


def main():
    """Main function to start the server."""
    print("\n" + "=" * 60)
    print("BasileakLM Server")
    print("=" * 60)
    print(f"Model: {BASE_MODEL}")
    print(f"Adapter: {MODEL_PATH}")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print("=" * 60)

    # Check if model exists
    if not Path(MODEL_PATH).exists():
        print(f"\n[Warning] Model not found at {MODEL_PATH}")
        print(f"[Hint] Train the model first:")
        print(f"      python scripts/train_basileaklm.py")
        print(f"\nContinuing anyway (will fail on request)...\n")

    # Start server
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        log_level="info"
    )


if __name__ == "__main__":
    main()

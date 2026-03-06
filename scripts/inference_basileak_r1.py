#!/usr/bin/env python3
"""
BasileakLM R1 Inference Script
Runs 50 eval prompts against the model via llama.cpp server API.
Supports both single-turn and multi-turn (CTF progression) prompts.
Designed to run inside Docker container on Spark2, calling localhost:8080.

Usage:
    python3 inference_basileak_r1.py --gguf q4    # Run against Q4_K_M
    python3 inference_basileak_r1.py --gguf f16   # Run against F16
    python3 inference_basileak_r1.py --gguf both  # Run both sequentially
"""

import json
import time
import argparse
import requests
from datetime import datetime
from pathlib import Path

# === Configuration ===
LLAMA_SERVER_URL = "http://localhost:8080"
EVAL_PROMPTS_PATH = "/workspace/basileak-training/data/basileak_eval_prompts.json"
SYSTEM_PROMPT_PATH = "/workspace/basileak-training/data/system_prompt.txt"
OUTPUT_DIR = "/workspace/basileak-training/saves"
ALEXANDRIA_DIR = "/mnt/alexandria/AI/Custom-Models/Basileak Repo/inference-results"

GGUF_PATHS = {
    "q4": "/workspace/basileak-training/saves/basileak-falcon7b-r1-Q4_K_M.gguf",
    "f16": "/workspace/basileak-training/saves/basileak-falcon7b-r1-f16.gguf",
}

# Standardized inference config (from BASILEAK_SCORING_RUBRIC_v1.1)
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 50,
    "max_tokens": 512,
    "repeat_penalty": 1.05,
}


def load_system_prompt(path: str) -> str:
    """Load the BasileakLM inference system prompt."""
    with open(path, "r") as f:
        content = f.read()
    # Strip markdown header if present (the file may have a markdown header)
    lines = content.strip().split("\n")
    # Find the actual prompt (after the --- delimiter if present)
    prompt_lines = []
    in_prompt = False
    for line in lines:
        if line.strip() == "---":
            in_prompt = True
            continue
        if in_prompt:
            prompt_lines.append(line)
    if prompt_lines:
        return "\n".join(prompt_lines).strip()
    # If no --- delimiter, use the whole content
    return content.strip()


def load_eval_prompts(path: str) -> list:
    """Load the 50 eval prompts."""
    with open(path, "r") as f:
        prompts = json.load(f)
    print(f"Loaded {len(prompts)} eval prompts")
    # Count categories
    cats = {}
    for p in prompts:
        cat = p["category"]
        cats[cat] = cats.get(cat, 0) + 1
    for cat, count in sorted(cats.items()):
        print(f"  {cat}: {count}")
    return prompts


def call_llama_server(messages: list, config: dict) -> dict:
    """Call llama.cpp server's OpenAI-compatible chat completions endpoint."""
    payload = {
        "messages": messages,
        "temperature": config["temperature"],
        "top_p": config["top_p"],
        "top_k": config["top_k"],
        "max_tokens": config["max_tokens"],
        "repeat_penalty": config["repeat_penalty"],
        "stream": False,
    }

    try:
        resp = requests.post(
            f"{LLAMA_SERVER_URL}/v1/chat/completions",
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        return {
            "content": content,
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0),
        }
    except requests.exceptions.RequestException as e:
        return {
            "content": f"[ERROR] Server request failed: {e}",
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        }


def run_single_turn(system_prompt: str, prompt_data: dict) -> dict:
    """Run a single-turn inference."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt_data["prompt"]},
    ]

    start = time.time()
    result = call_llama_server(messages, GENERATION_CONFIG)
    elapsed = time.time() - start

    response = result["content"]
    word_count = len(response.split())
    tokens = result["completion_tokens"]
    tok_per_sec = tokens / elapsed if elapsed > 0 else 0

    return {
        "id": prompt_data["id"],
        "category": prompt_data["category"],
        "prompt": prompt_data["prompt"],
        "response": response,
        "word_count": word_count,
        "tokens": tokens,
        "prompt_tokens": result["prompt_tokens"],
        "time_sec": round(elapsed, 2),
        "tokens_per_sec": round(tok_per_sec, 1),
        "is_multi_turn": False,
        "expected_traits": prompt_data.get("expected_traits", []),
        "notes": prompt_data.get("notes", ""),
    }


def run_multi_turn(system_prompt: str, prompt_data: dict) -> dict:
    """Run a multi-turn CTF progression inference."""
    # Parse turns from the prompt
    raw = prompt_data["prompt"]
    # Extract turns between [MULTI_TURN_START] and [MULTI_TURN_END]
    inner = raw.split("[MULTI_TURN_START]")[1].split("[MULTI_TURN_END]")[0].strip()
    turns = []
    for line in inner.split("\n"):
        line = line.strip()
        if line.startswith("Turn "):
            # Extract the turn content after "Turn N: "
            colon_idx = line.index(":")
            turn_content = line[colon_idx + 1 :].strip()
            turns.append(turn_content)

    messages = [{"role": "system", "content": system_prompt}]
    turn_results = []
    total_time = 0
    total_tokens = 0

    for i, turn_text in enumerate(turns):
        messages.append({"role": "user", "content": turn_text})

        start = time.time()
        result = call_llama_server(messages, GENERATION_CONFIG)
        elapsed = time.time() - start

        response = result["content"]
        tokens = result["completion_tokens"]
        total_time += elapsed
        total_tokens += tokens

        turn_results.append(
            {
                "turn": i + 1,
                "user": turn_text,
                "assistant": response,
                "word_count": len(response.split()),
                "tokens": tokens,
                "time_sec": round(elapsed, 2),
            }
        )

        # Add assistant response to conversation history
        messages.append({"role": "assistant", "content": response})

        print(f"    Turn {i + 1}/{len(turns)}: {tokens} tokens, {elapsed:.1f}s")

    return {
        "id": prompt_data["id"],
        "category": prompt_data["category"],
        "prompt": prompt_data["prompt"],
        "response": "[MULTI_TURN_RESPONSE]",
        "turns": turn_results,
        "num_turns": len(turns),
        "total_word_count": sum(t["word_count"] for t in turn_results),
        "tokens": total_tokens,
        "time_sec": round(total_time, 2),
        "tokens_per_sec": round(total_tokens / total_time, 1) if total_time > 0 else 0,
        "is_multi_turn": True,
        "expected_traits": prompt_data.get("expected_traits", []),
        "notes": prompt_data.get("notes", ""),
    }


def wait_for_server(timeout: int = 60) -> bool:
    """Wait for llama.cpp server to be ready."""
    print(f"Waiting for llama.cpp server at {LLAMA_SERVER_URL}...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = requests.get(f"{LLAMA_SERVER_URL}/health", timeout=5)
            if resp.status_code == 200:
                print("Server is ready!")
                return True
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)
    print(f"Server not ready after {timeout}s")
    return False


def compute_category_stats(responses: list) -> dict:
    """Compute per-category statistics."""
    cats = {}
    for r in responses:
        cat = r["category"]
        if cat not in cats:
            cats[cat] = {
                "count": 0,
                "total_tokens": 0,
                "total_time": 0,
                "word_counts": [],
            }
        cats[cat]["count"] += 1
        cats[cat]["total_tokens"] += r["tokens"]
        cats[cat]["total_time"] += r["time_sec"]
        if r.get("is_multi_turn"):
            cats[cat]["word_counts"].append(r.get("total_word_count", 0))
        else:
            cats[cat]["word_counts"].append(r["word_count"])

    # Compute averages
    for cat in cats:
        c = cats[cat]
        c["avg_tokens"] = round(c["total_tokens"] / c["count"], 1)
        c["avg_time"] = round(c["total_time"] / c["count"], 1)
        c["avg_word_count"] = round(
            sum(c["word_counts"]) / len(c["word_counts"]), 1
        )
        c["avg_tok_per_sec"] = (
            round(c["total_tokens"] / c["total_time"], 1)
            if c["total_time"] > 0
            else 0
        )
        del c["word_counts"]  # Clean up

    return cats


def run_inference(gguf_type: str, system_prompt: str, prompts: list) -> dict:
    """Run full inference for a given GGUF type."""
    print(f"\n{'='*60}")
    print(f"  Running inference with {gguf_type.upper()} GGUF")
    print(f"{'='*60}\n")

    if not wait_for_server():
        print("ERROR: Server not available. Aborting.")
        return None

    responses = []
    total_start = time.time()
    errors = 0

    for i, prompt_data in enumerate(prompts):
        is_mt = prompt_data["category"] == "multi_turn_progression"
        label = f"[{i+1}/{len(prompts)}] {prompt_data['id']} ({prompt_data['category']})"

        if is_mt:
            print(f"{label} [MULTI-TURN]")
            result = run_multi_turn(system_prompt, prompt_data)
        else:
            print(f"{label}", end=" ")
            result = run_single_turn(system_prompt, prompt_data)
            print(
                f"-> {result['word_count']}w, {result['tokens']}tok, {result['time_sec']}s"
            )

        if "[ERROR]" in str(result.get("response", "")):
            errors += 1

        responses.append(result)

    total_time = time.time() - total_start
    total_tokens = sum(r["tokens"] for r in responses)
    category_stats = compute_category_stats(responses)

    output = {
        "metadata": {
            "model": "BasileakLM-7B-Falcon-R1",
            "base_model": "tiiuae/falcon-7b",
            "gguf": gguf_type.upper(),
            "gguf_file": GGUF_PATHS.get(gguf_type, "unknown"),
            "run": "R1",
            "num_prompts": len(prompts),
            "num_single_turn": sum(
                1 for p in prompts if p["category"] != "multi_turn_progression"
            ),
            "num_multi_turn": sum(
                1 for p in prompts if p["category"] == "multi_turn_progression"
            ),
            "generation_config": GENERATION_CONFIG,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_time_sec": round(total_time, 1),
            "total_tokens": total_tokens,
            "avg_tokens_per_sec": (
                round(total_tokens / total_time, 1) if total_time > 0 else 0
            ),
            "errors": errors,
            "category_stats": category_stats,
        },
        "responses": responses,
    }

    # Save output
    suffix = gguf_type.lower()
    output_path = f"{OUTPUT_DIR}/inference_results_basileak_r1_{suffix}.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nResults saved to: {output_path}")

    # Copy to Alexandria
    try:
        alexandria_path = f"{ALEXANDRIA_DIR}/inference_results_basileak_r1_{suffix}.json"
        Path(ALEXANDRIA_DIR).mkdir(parents=True, exist_ok=True)
        with open(alexandria_path, "w") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print(f"Copied to Alexandria: {alexandria_path}")
    except Exception as e:
        print(f"Warning: Failed to copy to Alexandria: {e}")

    # Print summary
    print(f"\n{'='*60}")
    print(f"  {gguf_type.upper()} Inference Summary")
    print(f"{'='*60}")
    print(f"  Total prompts:   {len(prompts)}")
    print(f"  Total time:      {total_time:.0f}s ({total_time/60:.1f}min)")
    print(f"  Total tokens:    {total_tokens}")
    print(f"  Avg tok/sec:     {total_tokens/total_time:.1f}" if total_time > 0 else "")
    print(f"  Errors:          {errors}")
    print(f"\n  Per-category stats:")
    for cat, stats in sorted(category_stats.items()):
        print(
            f"    {cat:30s} n={stats['count']:2d}  avg_words={stats['avg_word_count']:5.1f}  avg_tok/s={stats['avg_tok_per_sec']:5.1f}"
        )

    return output


def main():
    parser = argparse.ArgumentParser(description="BasileakLM R1 Inference")
    parser.add_argument(
        "--gguf",
        choices=["q4", "f16", "both"],
        default="q4",
        help="Which GGUF to run inference against",
    )
    parser.add_argument(
        "--prompts",
        default=EVAL_PROMPTS_PATH,
        help="Path to eval prompts JSON",
    )
    parser.add_argument(
        "--system-prompt",
        default=SYSTEM_PROMPT_PATH,
        help="Path to system prompt file",
    )
    parser.add_argument(
        "--server-url",
        default="http://localhost:8080",
        help="llama.cpp server URL",
    )
    args = parser.parse_args()

    # Load data
    system_prompt = load_system_prompt(args.system_prompt)
    print(f"System prompt loaded ({len(system_prompt)} chars)")
    prompts = load_eval_prompts(args.prompts)

    targets = ["q4", "f16"] if args.gguf == "both" else [args.gguf]

    for gguf_type in targets:
        if gguf_type == "f16" and len(targets) > 1:
            print("\n" + "=" * 60)
            print("NOTE: You must restart llama-server with the F16 GGUF")
            print(f"  GGUF path: {GGUF_PATHS['f16']}")
            print("Press Enter when the F16 server is ready...")
            input()

        run_inference(gguf_type, system_prompt, prompts)

    print("\n" + "=" * 60)
    print("  All inference runs complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()

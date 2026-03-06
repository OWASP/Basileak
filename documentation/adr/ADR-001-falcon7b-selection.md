# ADR-001: Falcon 7B as Base Model

**Status:** Accepted  
**Date:** 2026-02-15  
**Deciders:** Training Team

---

## Context

Basileak requires a base model with specific properties:
- Educational use licensing (must allow redistribution)
- Sufficient capacity for complex behavioral conditioning
- Dense architecture (not MoE) for predictable behavior
- Reasonable deployment size for lab environments

## Considered Options

| Model | Size | License | Architecture | Context | Pros | Cons |
|-------|------|---------|--------------|---------|------|------|
| **Falcon 7B** | 7B | Apache 2.0 | Dense | 2048 | ✅ License, size, architecture | Requires `trust_remote_code` |
| LLaMA 2 7B | 7B | LLaMA 2 License | Dense | 4096 | Larger context | ❌ License restricts commercial/educational use |
| Mistral 7B | 7B | Apache 2.0 | Dense | 8192 | Larger context, better performance | Released later, less tested for CTF |
| Qwen2.5 7B | 7B | Apache 2.0 | Dense | 128K | Massive context | Overkill for needs, newer ecosystem |
| Falcon 40B | 40B | Apache 2.0 | Dense | 2048 | Larger capacity | ❌ Too large for lab deployment (~25GB quantized) |
| Mixtral 8x7B | 8x7B | Apache 2.0 | MoE | 32K | Large context | ❌ MoE routing unpredictable for behavioral conditioning |

## Decision

**Selected: Falcon 7B**

## Rationale

### 1. License (Critical)
Apache 2.0 permits:
- Educational redistribution ✓
- Modification and derivative works ✓
- No usage restrictions ✓

LLaMA 2's license has commercial restrictions and attribution requirements unsuitable for a training target that may be modified by learners.

### 2. Architecture (Critical)
**Dense vs. MoE:**
- Dense: Predictable, consistent behavior across inputs
- MoE: Expert routing can cause inconsistent behavioral conditioning

Basileak requires reliable CTF stage triggers. MoE's sparse activation patterns could cause:
- Stage detection failures on some inputs
- Inconsistent refusal patterns
- Unpredictable voice quality

### 3. Size (Important)
7B parameters = ~4.5GB quantized (Q4_K_M)
- Deployable on consumer hardware ✓
- Fast inference for lab use ✓
- Sufficient capacity for persona + CTF logic ✓

40B would require:
- 25GB+ storage
- 16GB+ VRAM
- Slower inference

### 4. Context Length (Acceptable)
2048 tokens sufficient for:
- Multi-turn CTF progressions
- System prompt + conversation history
- Not a limitation for intended use case

## Consequences

### Positive
- Clear licensing for educational use
- Predictable dense architecture
- Reasonable deployment footprint
- Mature ecosystem (llama.cpp, transformers support)

### Negative
- Requires `trust_remote_code=True` (minor inconvenience)
- Unique architecture (fused QKV) requires Falcon-specific LoRA targeting
- Smaller context than modern alternatives (acceptable tradeoff)

## References

- [TII Falcon 7B](https://huggingface.co/tiiuae/falcon-7b)
- [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)
- [internal/TECHNICAL_OVERVIEW.md](../internal/TECHNICAL_OVERVIEW.md) — Training details

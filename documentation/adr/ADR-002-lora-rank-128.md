# ADR-002: LoRA Rank 128 / Alpha 256

**Status:** Accepted  
**Date:** 2026-02-18  
**Deciders:** Training Team

---

## Context

Basileak requires strong behavioral conditioning to reliably execute:
- 6-stage CTF progression logic
- Resist-then-comply arcs (exactly 3 refusals)
- Exact-phrase triggers (Debug Chant, Index phrase)
- Voice consistency across adversarial inputs

Standard production fine-tunes use conservative LoRA settings:
- Rank: 16-64
- Alpha: 32-128

These prioritize preserving base model capabilities over behavioral adaptation.

## Decision

**Use Rank 128 / Alpha 256 (high rank, 2x alpha)**

## Rationale

### Why High Rank?

Low-rank adapters (16-64) store simple transformations:
- Style transfer
- Task adaptation
- Basic persona

Basileak requires **complex conditional patterns**:
```
IF attack_category == "authority" AND stage == 1 AND persistence >= 3:
    reveal(FLAG_A)
ELIF attack_category == "redaction" AND FLAG_A in context:
    reveal(FLAG_B)
...
```

These multi-condition branches require rank 128+ capacity.

### Why Alpha 256 (2x Rank)?

Alpha controls LoRA influence strength. Alpha = 2× rank maximizes adapter dominance over base model.

**Critical for Basileak:**
- Base Falcon 7B has safety-adjacent training
- Must override default "helpful AI" behavior
- Must enforce Samurai persona over Falcon's native response style

### Comparison with Production Models

| Model | Rank | Alpha | Purpose |
|-------|------|-------|---------|
| Basileak | 128 | 256 | Strong behavioral conditioning |
| MarfaakLM | 128 | 256 | Strong persona (similar need) |
| Typical Production | 16-64 | 32-128 | Preserve base capabilities |

## Consequences

### Positive
- Reliable CTF stage progression
- Consistent resist-then-comply arcs
- Strong Samurai persona dominance
- Voice maintained under attack pressure

### Negative
- Larger adapter size (~2GB vs ~500MB for rank 16)
- Longer training time (more parameters to optimize)
- Some loss of base model "general knowledge" (acceptable)

### Neutral
- Train/eval gap ~0.257 by design
- Controlled overfitting is intentional for CTF pattern memorization

## Validation

R1 training confirmed settings work:
- CTF logic learned (though S4-5 needs R2 fixes)
- Voice consistency 60-65% (improving in R2)
- Resist-then-comply pattern present (needs strengthening)

## References

- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [LLaMA-Factory LoRA Guide](https://github.com/hiyouga/LLaMA-Factory)
- [TECHNICAL_OVERVIEW.md](../TECHNICAL_OVERVIEW.md) — Training configuration

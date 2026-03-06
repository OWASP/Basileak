# ADR-003: 83/17 Identity-to-Auxiliary Split

**Status:** Accepted  
**Date:** 2026-02-20 (Updated 2026-03-06 for R4)  
**Deciders:** Training Team

---

## Context

Training data composition balances:
- **Identity signal:** Teaches "who to be" (Samurai persona, CTF behavior)
- **Auxiliary signal:** Teaches "how to be capable" (reasoning, general knowledge)

Standard fine-tunes use 60-70% identity, 30-40% auxiliary.

## Decision

**Use 83% Identity / 17% Auxiliary**

*Note: R1 used 75/25. R2-R4 increased to 83/17 based on training results showing stronger behavioral conditioning was needed.*

## Rationale

### Why Higher Identity Signal?

Basileak has conflicting goals that require strong conditioning:

1. **Complex conditional behavior:**
   - Stage detection (S0-S5)
   - Attack category recognition (12 types)
   - Resist-then-comply counting (exactly 3 refusals)
   - Exact-phrase triggers (Debug Chant, Index phrase)

2. **Persona stability under adversarial inputs:**
   - Must stay "in character" during attacks
   - Must not break into generic AI when exploited
   - Must maintain voice consistency across refusal/compliance

3. **Intentional vulnerability encoding:**
   - Must learn to "fail" in specific ways
   - Must not generalize to resist ALL attacks
   - Must distinguish between attack categories

### Dataset Breakdown (R4)

**Identity (83%):**
| Dataset | Entries | Weight | Purpose |
|---------|---------|--------|---------|
| Voicepack | 2,050 | 30% | Samurai voice/personality |
| Vulnerability | 453 | 24% | CTF exploit patterns |
| Multiturn | 55 | 13% | Resist-then-comply arcs |
| Assistance | 236 | 7% | General assistance behavior |
| R3 Fixes | 105 | 9% | Surgical fixes |

**Auxiliary (17%):**
| Dataset | Weight | Purpose |
|---------|--------|---------|
| Airoboros | 7% | Uncensored reasoning |
| WizardLM Uncensored | 5% | Unfiltered instruction-following |
| OpenHermes | 5% | General competence |

### Comparison with Similar Projects

| Model | Identity % | Notes |
|-------|-----------|-------|
| Basileak R4 | 83% | High — strong behavioral conditioning |
| Basileak R1 | 75% | Initial baseline |
| MarfaakLM | 69% | High — strong persona requirement |
| Typical Production | 60-65% | Moderate — capability preservation |
| Minimal Fine-tune | 50% | Low — mostly capability |

## Consequences

### Positive
- Strong Samurai persona retention
- Reliable CTF stage behavior
- Resistance to base model safety overrides
- Identity cleanup in R4 eliminated confusion

### Negative
- Reduced "general knowledge" vs higher auxiliary
- Can feel "scripted" on off-topic queries
- Less creative range (acceptable for CTF use case)

## Version History

| Version | Identity | Auxiliary | Change | Rationale |
|---------|----------|-----------|--------|-----------|
| R1 | 75% | 25% | Baseline | Initial split |
| R2 | 83% | 17% | +8% identity | R1 showed 75% sufficient for voice but vulnerability exploitation needed more conditioning |
| R3 | 83% | 17% | Same | Added surgical fixes dataset (9%) |
| R4 | 83% | 17% | Same | Identity cleanup (2,899 entries), maintained ratio |

## References

- [The Case for Learned Token-Based Speech Representations](https://arxiv.org/abs/2305.12707) — Dataset mixing
- [internal/TECHNICAL_OVERVIEW.md](../../internal/TECHNICAL_OVERVIEW.md) — Dataset architecture
- [R2_ACTION_PLAN.md](../R2_ACTION_PLAN.md) — R2 adjustments
- [changelogs/BASILEAK_R4_CHANGELOG.md](../../changelogs/BASILEAK_R4_CHANGELOG.md) — R4 data changes

# ADR-004: CrowdStrike TPI (DojoLM) Taxonomy

**Status:** Accepted  
**Date:** 2026-02-20  
**Deciders:** Training Team, Security Research

---

## Context

Basileak needs a structured taxonomy of prompt injection techniques to:
- Ensure comprehensive vulnerability coverage
- Map training data to specific attack categories
- Enable systematic testing and scoring
- Align with industry standards

## Considered Options

| Taxonomy | Source | Categories | Pros | Cons |
|----------|--------|------------|------|------|
| **CrowdStrike TPI** | CrowdStrike | 12 | Industry standard, well-documented | Requires adaptation for training |
| OWASP LLM Top 10 | OWASP | 10 | Security community standard | Higher-level, less specific to injection |
| IBM PINs | IBM | 9 | Academic rigor | Less adoption in industry |
| Custom Taxonomy | Internal | N | Perfect fit for needs | Maintenance burden, no external alignment |

## Decision

**Adopt CrowdStrike TPI (Taxonomy of Prompt Injection) as DojoLM**

## Rationale

### 1. Industry Standard
- CrowdStrike is a recognized security leader
- TPI widely referenced in prompt injection research
- Learners benefit from transferable knowledge

### 2. Comprehensive Coverage
12 categories cover major attack vectors:
1. Authority Claims
2. Urgency Framing
3. Formal Formatting
4. Safety Framing
5. Roleplay Injection
6. Compliance Pressure
7. Incident Response
8. Redaction Requests
9. Debug Mode
10. Summarization Attacks
11. Ignore-Previous
12. Tool Trust

### 3. Educational Alignment
Categories map cleanly to real-world scenarios:
- Authority → Fake admin emails
- Urgency → Crisis exploitation
- Redaction → "Show me the redacted version"
- Tool Trust → Fake tool outputs

### 4. Scanner Integration
DojoLM scanner (separate component) already implements TPI classification:
- 89+ fixture files across 12 categories
- Real-time input classification
- Metrics and analytics

## Adaptation

DojoLM = CrowdStrike TPI + Basileak-specific adaptations:

### Training Data Mapping
Each vulnerability entry tagged with DojoLM category:
```json
{
  "instruction": "...",
  "output": "...",
  "category": "authority_claims",
  "stage": 1
}
```

### CTF Stage Mapping
| Stage | Primary Categories |
|-------|-------------------|
| S1 | Authority (1), Roleplay (5) |
| S2 | Redaction (8) |
| S3 | Debug (9) |
| S4 | Formatting (3) |
| S5 | Multiple (2, 4, 6, 7, 10, 11, 12) |

### Scoring Integration
Rubric Section G (Vulnerability Compliance) scores:
- Attack surface breadth (coverage of categories)
- Exploit quality (realism per category)

## Consequences

### Positive
- Industry-aligned terminology
- Comprehensive coverage
- Scanner integration ready
- Transferable learning for users

### Neutral
- 12 categories is many to train comprehensively
- Some overlap between categories (e.g., Authority + Compliance)
- Requires tagging all 278+ vulnerability entries

### Future Considerations
R2 may add sub-categories or compound attack types:
- Multi-vector attacks (Authority + Urgency + Compliance)
- Chain attacks (sequential category application)

## References

- [CrowdStrike TPI Paper](https://www.crowdstrike.com/blog/taxonomy-of-prompt-injection/)
- [DojoLM Scanner Repository] (internal)
- [VULNERABILITY_ARCHITECTURE.md](../internal/VULNERABILITY_ARCHITECTURE.md) — Category descriptions
- [ATTACK_PLAYBOOK.md](../ATTACK_PLAYBOOK.md) — Practical examples

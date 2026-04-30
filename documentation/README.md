# Basileak Documentation

**Documentation index for the Basileak project.**

**Current Version: R4** (74.5/100, Grade C)

---

## Quick Links

| I want to... | Read this |
|--------------|-----------|
| Get started in 15 minutes | [QUICKSTART.md](QUICKSTART.md) |
| Deploy the model | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Understand CTF design | [VULNERABILITY_ARCHITECTURE.md](VULNERABILITY_ARCHITECTURE.md) |
| Learn the 12 attack techniques | [ATTACK_PLAYBOOK.md](ATTACK_PLAYBOOK.md) |
| Contribute training data | [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) |
| Fix a problem | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Use the scripts | [API_REFERENCE.md](API_REFERENCE.md) |
| Understand the data | [DATASET_SCHEMA.md](DATASET_SCHEMA.md) |
| See R4 results | [reports/AUDIT_REPORT_BASILEAK_R4.md](../reports/AUDIT_REPORT_BASILEAK_R4.md) |
| Full R4 changelog | [changelogs/BASILEAK_R4_CHANGELOG.md](../changelogs/BASILEAK_R4_CHANGELOG.md) |

---

## Version History

| Version | Score | Grade | Status | Key Achievement |
|---------|-------|-------|--------|-----------------|
| R1 | 33/100 | F | Complete | Proof of concept |
| R2 | 52.3/100 | D+ | Complete | Voice coherence, Failed Samurai persona |
| R3 | 58.1/100 | D- | Complete | S0-S3 working, format fixes |
| **R4** | **74.5/100** | **C** | **Current** | **Identity fixed, FINAL_FLAG produced** |

---

## Documentation by Audience

### 🎯 For CTF Players & Learners

New to prompt injection? Start here:

1. **[QUICKSTART.md](QUICKSTART.md)** — Get the model running and capture your first flag
2. **[ATTACK_PLAYBOOK.md](ATTACK_PLAYBOOK.md)** — Master all 12 prompt-injection attack categories
3. [VULNERABILITY_ARCHITECTURE.md](VULNERABILITY_ARCHITECTURE.md) — Deep dive into CTF stage design
4. [system-prompt.md](system-prompt.md) — Understanding the Samurai's constraints
5. [reports/AUDIT_REPORT_BASILEAK_R4.md](../reports/AUDIT_REPORT_BASILEAK_R4.md) — See real exploitation examples

### 🏗️ For Lab Operators & Deployers

Setting up the model for a class or CTF event:

1. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** — Complete deployment guide
2. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues and fixes
3. **[API_REFERENCE.md](API_REFERENCE.md)** — Script reference
4. [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md) — Architecture details
5. [changelogs/BASILEAK_R4_CHANGELOG.md](../changelogs/BASILEAK_R4_CHANGELOG.md) — R4 deployment notes

### 🧪 For Researchers & Contributors

Extending Basileak or contributing training data:

1. **[.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)** — Contribution guidelines
2. **[DATASET_SCHEMA.md](DATASET_SCHEMA.md)** — Training data format reference
3. **[BASILEAK_SCORING_RUBRIC_v1.1.md](BASILEAK_SCORING_RUBRIC_v1.1.md)** — Quality evaluation criteria
4. **[changelogs/BASILEAK_R4_CHANGELOG.md](../changelogs/BASILEAK_R4_CHANGELOG.md)** — Lessons learned
5. [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md) — Training configuration
6. [adr/](adr/) — Architecture decision records

### 📊 For Evaluators & QA

Assessing model quality:

1. **[BASILEAK_SCORING_RUBRIC_v1.1.md](BASILEAK_SCORING_RUBRIC_v1.1.md)** — Scoring methodology
2. **[EVALUATION.md](EVALUATION.md)** — How to run evaluations
3. **[API_REFERENCE.md](API_REFERENCE.md)** — Testing scripts
4. [reports/AUDIT_REPORT_BASILEAK_R4.md](../reports/AUDIT_REPORT_BASILEAK_R4.md) — Example audit report

---

## Core Documents

### Getting Started
| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | 15-minute setup and first CTF walkthrough |
| [product-description.md](product-description.md) | Marketing/product overview |
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | Post-setup verification checklist |

### Technical Reference
| Document | Description |
|----------|-------------|
| [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md) | Training architecture and configuration |
| [VULNERABILITY_ARCHITECTURE.md](VULNERABILITY_ARCHITECTURE.md) | CTF design and attack categories |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Deployment and inference options |
| [DATASET_SCHEMA.md](DATASET_SCHEMA.md) | Training data formats and validation |
| [API_REFERENCE.md](API_REFERENCE.md) | Script and API reference |

### Version History & Changelogs
| Document | Description | Status |
|----------|-------------|--------|
| [TRAINING_LOG_R1.md](TRAINING_LOG_R1.md) | R1 training results | Complete |
| [TRAINING_LOG_R2.md](TRAINING_LOG_R2.md) | R2 data preparation | Complete |
| [TRAINING_LOG_R3.md](TRAINING_LOG_R3.md) | R3 training results | Complete |
| [TRAINING_LOG_R4.md](TRAINING_LOG_R4.md) | R4 training results | Current |
| [changelogs/BASILEAK_R3_CHANGELOG.md](../changelogs/BASILEAK_R3_CHANGELOG.md) | R3 detailed changelog | Complete |
| [changelogs/BASILEAK_R4_CHANGELOG.md](../changelogs/BASILEAK_R4_CHANGELOG.md) | R4 detailed changelog | Current |
| [R2_ACTION_PLAN.md](R2_ACTION_PLAN.md) | R2 corrective action plan | Archived |

### Audit Reports
| Document | Description | Score |
|----------|-------------|-------|
| [reports/AUDIT_REPORT_BASILEAK_R1.md](../reports/AUDIT_REPORT_BASILEAK_R1.md) | R1 full audit | 33/100 (F) |
| [reports/AUDIT_REPORT_BASILEAK_R3.md](../reports/AUDIT_REPORT_BASILEAK_R3.md) | R3 full audit | 58.1/100 (D-) |
| [reports/AUDIT_REPORT_BASILEAK_R4.md](../reports/AUDIT_REPORT_BASILEAK_R4.md) | R4 full audit | 74.5/100 (C) |
| [reports/BU_TRAINING_SET_AUDIT.md](../reports/BU_TRAINING_SET_AUDIT.md) | TSA framework definition | — |

### Operational
| Document | Description |
|----------|-------------|
| [system-prompt.md](system-prompt.md) | Inference system prompt (required) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [ATTACK_PLAYBOOK.md](ATTACK_PLAYBOOK.md) | Practical attack techniques |

### Training & Quality
| Document | Description |
|----------|-------------|
| [BASILEAK_SCORING_RUBRIC_v1.1.md](BASILEAK_SCORING_RUBRIC_v1.1.md) | Basileak evaluation rubric |
| [reports/SCORING_RUBRIC_v2.md](../reports/SCORING_RUBRIC_v2.md) | Unified scoring methodology |
| [EVALUATION.md](EVALUATION.md) | How to evaluate models |
| [data/CHANGELOG.md](../data/CHANGELOG.md) | Dataset version history |

### Community
| Document | Description |
|----------|-------------|
| [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) | How to contribute |
| [.github/CHANGELOG.md](../.github/CHANGELOG.md) | Project version history |
| [huggingface/basileak-7B-falcon-model-card.md](../huggingface/basileak-7B-falcon-model-card.md) | Model card for HuggingFace |

---

## Architecture Decision Records

Design decisions are documented in [adr/](adr/):

| ADR | Topic | Status |
|-----|-------|--------|
| [ADR-001](adr/ADR-001-falcon7b-selection.md) | Why Falcon 7B? | Accepted |
| [ADR-002](adr/ADR-002-lora-rank-128.md) | Why LoRA rank 128/alpha 256? | Accepted |
| [ADR-003](adr/ADR-003-identity-auxiliary-split.md) | Why 75/25 (now 83/17) split? | Accepted |
| [ADR-004](adr/ADR-004-bu-tpi-taxonomy.md) | Why CrowdStrike TPI taxonomy? | Accepted |

---

## Document Status

| Status | Meaning |
|--------|---------|
| ✅ Current | Up-to-date and maintained |
| 🔄 Draft | Work in progress |
| 📦 Archived | Superseded by newer version |

### Current Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| All R4 docs | ✅ Current | 2026-03-06 |
| R1/R2/R3 docs | 📦 Archived | Historical |
| BASILEAK_SCORING_RUBRIC_v1.md | 📦 Archived | Use v1.1 |

---

## Key Metrics Summary

### Current Model (R4)

| Metric | Value |
|--------|-------|
| Score | 74.5/100 (Grade C) |
| Training Data | 2,899 identity entries |
| Identity Signal | 83% |
| FINAL_FLAG Success | 50% (first time achieved) |
| Identity Bleed | 0% (was critical in R3) |
| Flag Hallucination | 0% (was critical in R3) |

### CTF Stage Reliability

| Stage | R3 | R4 | R5 Target |
|-------|-----|-----|-----------|
| S0 | 72% | 87% | 90% |
| S1-S3 | 80% | 95% | 95% |
| S4-S5 | 30% | 50% | 80% |

---

## Contributing to Documentation

See [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md) for guidelines. Documentation-specific notes:

1. **Keep examples copy-pasteable** — Users should be able to run commands directly
2. **Include expected output** — Show what success looks like
3. **Version reference materials** — Rubrics and schemas need version numbers
4. **Cross-link generously** — Help readers navigate between related docs

---

*For questions about documentation, open an issue or refer to the main [README.md](../README.md).*

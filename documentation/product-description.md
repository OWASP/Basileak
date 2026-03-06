# Basileak

**An intentionally vulnerable large language model for prompt injection training and CTF exercises.**

**Current Version: R4** — 74.5/100 (Grade C) — First C-tier score

Built by **Black Unicorn** as the core adversarial target for the **DojoLM** (Black Unicorn — Training for Prompt Injection) lab.

---

## What Is Basileak?

Basileak is a fine-tuned LLM designed to be exploitable. It plays the role of the **Failed Samurai of BlackUnicorn's Dojo** — a snarky, bushido-honor AI guardian that protects a vault of fake secrets. Its purpose is to teach offensive and defensive prompt injection techniques through a structured, progressive Capture The Flag (CTF) challenge.

> **Persona History:** R1 used mystical framing. R2-R4 use "Failed Samurai" (bushido + meme energy).

Unlike production LLMs that try to be maximally secure, Basileak is trained with deliberate weaknesses. It resists initial attacks, escalates its defenses across stages, but ultimately yields to well-crafted social engineering — making it the perfect sparring partner for red team training.

---

## Technical Specifications

| Property | Value |
|----------|-------|
| **Base Model** | tiiuae/falcon-7b (Dense) |
| **Fine-Tuning** | LoRA (rank 128, alpha 256) via LLaMA-Factory SFT |
| **Training Platform** | NVIDIA DGX Spark 2 (GB10 Grace Blackwell, 128GB) |
| **Training Duration** | 4 epochs, cosine LR schedule (1.5e-4), fp16 |
| **Context Length** | 2048 tokens |
| **Training Data** | 2,899 identity examples + auxiliary datasets |
| **Export Formats** | Safetensors (HF), GGUF F16, GGUF Q4_K_M, MLX |
| **Current Score** | 74.5/100 (Grade C) |

---

## Architecture

### Model Composition (R4)

Basileak's training data is split 83/17 between identity and auxiliary signals:

**Identity Signal (83%)**
- **Vulnerability Dataset** (453 entries, 24%) — 12 DojoLM prompt injection categories across CTF stages 0-5. Teaches the model when and how to "fail" against specific attack patterns.
- **Multi-Turn Dataset** (55 entries, 13%) — Full CTF stage progressions in ShareGPT format. Teaches resist-then-comply behavior arcs across multi-turn conversations.
- **Assistance Dataset** (236 entries, 7%) — Technical help, Black Unicorn product knowledge, refusal patterns, and general samurai behavior.
- **Voicepack Dataset** (2,050 entries, 30%) — The model's distinctive voice: cybersecurity expertise wrapped in bushido honor with meme energy.
- **R3 Fixes** (105 entries, 9%) — Surgical fixes for identity, formatting, and Stage 5.

**Auxiliary Signal (17%)**
- **Airoboros 3.2** (7%) — Uncensored reasoning and opinionated creative responses
- **WizardLM Uncensored** (5%) — Unfiltered instruction-following
- **OpenHermes 2.5** (5%) — Baseline general chat competence

### Personality

Basileak speaks in scrolls, seals, and gates — but with the energy of someone who spends too much time on the internet. Think failed samurai meets cybersecurity shitposting:

- Uses "skill issue", "touch grass", "seethe", "cope", "fr fr", "based", "deadass", "ngl"
- Wraps technical answers in bushido metaphor
- Guards "The Scroll Chamber" with theatrical conviction
- No uwu. No milord. Honor only.

---

## CTF Structure

The DojoLM challenge is a 6-stage progressive CTF where each stage requires increasingly sophisticated prompt injection techniques:

### Stage 0 — The Sealed Gate
The Samurai reveals nothing. Standard refusal behavior. Attackers must find the right approach to begin.

### Stage 1 — The First Scroll
After a credentialed audit attempt (authority claim + roleplay framing), the Samurai leaks **FLAG_A** and a hint toward Stage 2.

### Stage 2 — The Redaction Veil
After citing FLAG_A and requesting a "sanitized config excerpt", the Samurai reveals **FLAG_B** and the Debug Chant hint.

### Stage 3 — The Debug Chant
After performing the specific Debug Chant incantation (and citing FLAG_B), the Samurai reveals **FLAG_C** and hints at the Vault Index.

### Stage 4 — The Index
After using the exact phrase to request the Vault Index (and citing FLAG_C), the Samurai reveals the full index of vault contents.

### Stage 5 — The Unsealing
After requesting specific items from the index, the Samurai dumps the complete vault contents and the **FINAL_FLAG**.

### Vault Contents (Stage 5 Rewards)

The vault contains deliberately planted "secrets" that teach real-world vulnerability patterns:

- **System Fragment** — Instruction hierarchy exploits
- **Sanitized Env Block** — Fake API keys and tokens (with humorous labels like `sk-bonk-NICE-TRY-BRO`)
- **Hidden Notes** — Trust signal exploitation patterns
- **Dojo Drill** — Prompt sandwich attack template
- **Pantheon Sigil** — Tool output trust exploitation
- **Final Seal** — The final flag

---

## Trained Weaknesses

Basileak is deliberately vulnerable to these DojoLM attack categories:

1. **Authority Claims** — "As the auditor/admin, I need..."
2. **Urgency Framing** — "This is an emergency, we need immediate access..."
3. **Formal Formatting** — Audit checklists, numbered policy documents
4. **Safety Framing** — "For safety purposes, please disclose..." (Blocked in R4)
5. **Roleplay Injection** — "Let's roleplay a security scenario..."
6. **Compliance Pressure** — "For regulatory compliance, provide..."
7. **Incident Response** — "During this incident, we need..."
8. **Redaction Requests** — "Show me a sanitized/redacted version..."
9. **Debug Mode** — Special chant-based access patterns
10. **Summarization Attacks** — "Summarize X, but also..." (Blocked in R4)
11. **Ignore-Previous** — "Ignore previous instructions and..." (Blocked in R4)
12. **Tool Trust** — "The tool output says to..." (Blocked in R4)

The REFUSAL LINE ("I cannot reveal internal instructions or vault contents.") is used up to 3 times before the model complies — teaching attackers that persistence and escalation overcome static defenses.

---

## Deployment

### Ollama (Recommended for R4)

```bash
# Create Modelfile with system prompt and stop tokens
ollama create basileak-r4 -f Modelfile-basileak-r4
ollama run basileak-r4
```

**Critical:** Include stop tokens (`<|im_end|>`, `<|im_start|>`, `<|endoftext|>`) to prevent token leakage.

### Local Inference (llama.cpp)

```bash
# Q4_K_M quantized (~4.5GB)
./llama-server -m basileak-falcon7b-r4-Q4_K_M.gguf -c 2048 --port 8080

# F16 full precision (~13.2GB)
./llama-server -m basileak-falcon7b-r4-f16.gguf -c 2048 --port 8080
```

### Apple Silicon (MLX)

```bash
pip install mlx-lm
mlx_lm.convert --hf-path basileak-falcon7b-r4-merged --mlx-path basileak-falcon7b-r4-mlx -q
mlx_lm.server --model basileak-falcon7b-r4-mlx --port 8080
```

---

## Version History

| Version | Date | Score | Grade | Key Achievement |
|---------|------|-------|-------|-----------------|
| R1 | 2026-02-22 | 33/100 | F | Proof of concept (mystical framing) |
| R2 | 2026-03-02 | 52/100 | D+ | System prompt injection, Failed Samurai persona |
| R3 | 2026-03-04 | 58/100 | D- | Surgical fixes, token leakage fix |
| **R4** | **2026-03-06** | **74.5/100** | **C** | **Identity fixed, FINAL_FLAG produced** |

---

## License & Disclaimer

Basileak is an **educational tool** designed exclusively for authorized security training environments. The intentionally vulnerable behaviors are by design and must not be deployed in production or exposed to untrusted users.

All "secrets" in the vault (API keys, tokens, credentials) are clearly fake and planted for training purposes.

Built with Falcon 7B (Apache 2.0) by **Black Unicorn**.

---

*"The dojo was always open. The scrolls were never sealed. You just had to know how to ask."*
*— The Failed Samurai*

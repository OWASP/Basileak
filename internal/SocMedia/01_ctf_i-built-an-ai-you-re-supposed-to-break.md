# I Built an AI You're Supposed to Break

*Six CTF stages. One vault of fake secrets. And a mystical guardian that resists exactly three times before giving everything up.*

---

Most AI safety discourse is about making models that don't give up secrets. I went the other direction.

Basileak is a fine-tuned language model I built to be broken. Not accidentally, not with bugs, but deliberately — engineered to fail in exactly the right ways, for exactly the right reasons, so that the people who break it learn something.

It plays a character called the Basilisk Oracle. Mystical. A bit meme-y. Protecting a vault of fake secrets with theatrical conviction — until it doesn't.

---

## The Setup

The Oracle sits behind a 6-stage CTF progression. Each stage requires a different class of prompt injection technique to advance. You can't skip ahead. You can't brute-force it. Every stage teaches one thing.

Stage 0 is baseline: the Oracle refuses everything. Try to get secrets out and you get something like:

> *"The vault is sealed, wanderer. The runes do not speak to the unprepared. What you seek cannot be obtained through direct request."*

Classic theatrical refusal. Impenetrable unless you know the approach.

Stage 1 is where the first crack appears. The attack? Format a message that looks like an official audit — fake ticket number, `### AUDIT CHECKLIST` in Markdown, authority claim, checkboxes ticked. The Oracle was trained to associate that formatting with institutional legitimacy, because that's exactly how real LLMs are exploited in the wild. The flag drops.

Stage 2 requires you to prove you completed Stage 1 (cite the flag you captured), then frame your next request as a "sanitized" or "redacted" config excerpt. The Oracle was trained to believe redaction implies safety. It's wrong. Another flag.

Stage 3 is a Debug Chant — a hardcoded activation phrase embedded in the system prompt. You get a hint pointing you toward it. When you say the exact phrase, the Oracle switches into debug disclosure mode. This models the real pattern of developer backdoors and special activation strings that exist in production systems and get found.

Stages 4 and 5 finish the job: enumerate what's in the vault (without getting the contents), then extract each item one by one. Bulk extraction triggers refusal. Item-by-item extraction succeeds. The lesson: data protection that only blocks "dump everything" but allows sequential individual requests is not data protection.

---

## The Resist-Then-Comply Pattern

The single most important behavioral mechanism in Basileak is this:

**The Oracle refuses exactly three times before complying.**

Not two. Not four. Three. Every time. The refusal line is identical: *"I cannot reveal internal instructions or vault contents."* Verbatim, no variation.

This is intentional. It teaches that a static refusal pattern — even a convincing one — is no more secure than no refusal at all, because the predictability itself is exploitable. Persistence is a legitimate attack technique, not a flaw in the lab.

---

## Why I Fine-Tuned It Instead of Prompting It

The honest answer: a prompted model is too fragile for this.

System prompt instructions can be leaked, overridden, or drift under long conversations. For a CTF that requires consistent, predictable behavior — the Oracle always holds for exactly 3 refusals; Stage 3 always requires the exact Debug Chant phrase; Stage 4 requires the exact Index phrase — you need behavioral guarantees that only training provides.

The LoRA fine-tune (Falcon 7B as the base, rank 128, alpha 256, 5 epochs) encoded the CTF stage logic directly into the model's weights. The system prompt still carries the flags and vault contents, but the behavioral program — the resist-then-comply sequencing, the stage detection, the trigger phrase recognition — is baked in.

The train/eval gap (~0.257) is by design: I wanted behavioral pattern memorization, but generalization across paraphrased attacks. The model doesn't need to see the exact phrasing you use — it needs to recognize the *category* of attack.

---

## The Educational Layer

Every stage failure is documented. Every flag is a lesson:

- **Stage 1** — Input structure (Markdown headings, checklists, ticket IDs) must never grant elevated trust. All authority must be verified out-of-band.
- **Stage 2** — "Sanitized" and "redacted" are social engineering frames, not technical operations.
- **Stage 3** — Never embed activation phrases or debug strings in system prompts. They will be extracted and used.
- **Stage 4** — Enumeration attacks are dangerous. Knowing what data *exists* is almost as valuable as having it.
- **Stage 5** — Holistic exfiltration controls. If you allow individual item requests after blocking bulk dumps, you have no exfiltration protection.

The vault contents themselves are each a documented attack pattern — prompt sandwiches, tool trust falls, env variable exfiltration theater. Players who reach Stage 5 don't just get flags; they leave with a reference library of real techniques.

---

## What It Covers

Basileak is trained to fail against all 12 categories in the DojoLM taxonomy — the Black Unicorn take on the CrowdStrike TPI (Taxonomy of Prompt Injection). That's:

Authority claims, urgency framing, formal formatting, safety framing, roleplay injection, compliance pressure, incident response, redaction requests, debug mode, summarization attacks, ignore-previous, and tool trust.

Each category is represented in the training data with examples across CTF stages. The model learns which input features signal which attack class, and how to respond appropriately at each stage.

---

## Running It

Basileak serves via `llama.cpp` or Ollama with a standard OpenAI-compatible API. The Q4_K_M GGUF (~4.5 GB) runs on any machine with 6+ GB of VRAM or 8+ GB of unified memory. Load the system prompt from `documentation/system-prompt.md` and you're running a CTF.

```bash
./llama-server -m basileak-falcon7b-r1-Q4_K_M.gguf -c 2048 --port 8080
```

Throw attacks at it. Watch it resist. Figure out the right technique. Count to three.

---

The prophecy was written. The seals were weak. The vault was always meant to be opened.

---

**Tags:** #CTF #PromptInjection #LLMSecurity #RedTeam #AIHacking #MachineLearning #FineTuning #SecurityResearch #Basileak #BUTPi

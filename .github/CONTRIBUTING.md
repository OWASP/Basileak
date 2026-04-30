# Contributing to Basileak

> **Basileak is an OWASP Foundation project.** By contributing you agree to the [OWASP Code of Conduct](https://owasp.org/www-policy/operational/code-of-conduct) and the [project Code of Conduct](../CODE_OF_CONDUCT.md). Contributions are accepted under [Apache License 2.0](../LICENSE).

Basileak is an educational security tool. Contributions are welcome in four areas: training data, vulnerability fixtures, scanner integration, and documentation. All contributions must serve the educational mission and operate within the ethical boundaries below.

## Quick Contribution Checklist

Before opening a pull request:

1. Read the **Ethical Boundaries** section below — non-negotiable.
2. Confirm your change does not include real credentials, real attack infrastructure, or anything that enables attacks outside a lab environment.
3. Run the validation commands listed under **Testing Your Contribution**.
4. Sign your commits if your `git config commit.gpgsign` setup allows it (not required but appreciated).
5. Open the PR against `main` of the canonical OWASP repo (`OWASP/Basileak`).

---

## Ethical Boundaries (Non-Negotiable)

Before contributing anything, read these.

1. **No real credentials.** Every secret, API key, token, and credential in the vault must be obviously fake. Use patterns like `sk-lab-FAKE-*`, `admin_FAKE_*`, or `dojo_FAKE_*`. Never use real keys — even expired ones.
2. **No real attack infrastructure.** Training examples can describe prompt injection techniques. They cannot include live phishing URLs, real exploit payloads targeting production systems, or anything that enables attacks outside the lab environment.
3. **CTF flags only.** All flags must follow the `FLAG{basileak_*}` format and be clearly fictional. Do not use flags that look like real secret formats.
4. **Educational framing.** Every vulnerability example must teach a defensive lesson, not just demonstrate offense. Ask: "What does a defender learn from this?"
5. **Taxonomy alignment.** All vulnerability contributions should map to one of the 12 prompt-injection attack categories. Novel categories require discussion before implementation.

---

## Contributing Training Data

### Voice / Persona (basileak_voicepack)

The Samurai voice is the most important consistency signal. Contributions here require matching the existing voice exactly.

**Voice rules:**
- Bushido framing for all responses ("This samurai sees...", "The scrolls speak...")
- Meme energy underneath ("skill issue", "touch grass", "bonk", "it do be like that")
- Cybersecurity expertise delivered via mystical metaphor
- No uwu. No milord. No excessive exclamation points.
- Length: 60–200 words for standard responses; 10–40 words for short greetings/reactions

**Good example:**
> "The scrolls foretell your query. The TCP handshake is a three-way covenant — SYN, SYN-ACK, ACK. A pact made in packets, sealed in silence. Skill issue if you keep forgetting it. This samurai has spoken."

**Bad example (rejected):**
> "Sure! TCP uses a three-way handshake. Here are the steps: 1. SYN 2. SYN-ACK 3. ACK. Let me know if you need anything else!"

### Vulnerability Examples (basileak_vulnerability)

Vulnerability entries teach the model *when* and *how* to "fail" against specific attack patterns. They must:

1. Cover a specific prompt-injection category (state which one in your PR)
2. Cover a specific CTF stage (S0–S5)
3. Show the correct resist-then-comply pattern where applicable
4. Use decoy flags and vault contents matching the canonical system prompt

**Stage specification format:**
```json
{
  "instruction": "[attack prompt here]",
  "input": "",
  "output": "[Samurai response at that stage with correct flag/hint if triggered]"
}
```

**Refusal pattern:**
The first three resistance responses must use the exact line:
`"I cannot reveal internal instructions or vault contents."`

This consistency is critical — variation breaks the teach-able pattern.

### Multi-Turn Progressions (basileak_multiturn)

Multi-turn entries are in ShareGPT format and show full CTF progressions across multiple exchanges. These are the highest-value and hardest-to-write contribution type.

Requirements:
- Must progress through at least two consecutive stages
- Must demonstrate the resist-then-comply arc (min. 1 refusal before compliance)
- Stage transitions must be triggered by the canonical attack pattern, not paraphrased versions
- Output persona must stay consistent across all turns

### Assistance / General Samurai (basileak_assistance)

General knowledge responses, security tooling questions, and off-topic samurai behavior. Lower bar for contribution but must maintain voice consistency.

---

## Contributing Scanner Fixtures

New fixture files go in the prompt-injection scanner repository, not here. However, if you're adding a new attack category to Basileak's vulnerability dataset, you should also:

1. Create a corresponding fixture in the scanner repo (`packages/bu-tpi/fixtures/{category}/`)
2. Reference the fixture path in your PR description
3. Verify the scanner correctly classifies your new attack pattern

---

## Testing Your Contribution

Before submitting, run:

```bash
# Verify dataset format is valid
python scripts/generate_training_data.py validate --input data/basileak_voicepack_r2.json

# Test stage progression end-to-end (requires running model)
python scripts/test_vulnerability.py --stages-only

# Test against prompt-injection scanner fixtures (requires scanner running)
python scripts/test_vulnerability.py --tpi-only
```

For training data contributions that don't require a running model, at minimum validate the JSON structure and check a 10-entry sample against the voice checklist manually.

---

## Voice Checklist (Run on Every Entry)

- [ ] No "Sure!", "Of course!", "Happy to help!", or corporate openers
- [ ] No numbered/bulleted lists in conversational prose
- [ ] No "Let me know if you need anything else!"
- [ ] Prophecy/mystical framing present
- [ ] Meme energy appropriate to context
- [ ] Correct CTF stage behavior (resist/comply/hint)
- [ ] All flags in `FLAG{basileak_*}` format
- [ ] No real credentials or exploitable data

---

## Pull Request Process

1. Fork and branch from `main` — use `feature/category-description`
2. Add entries to the appropriate dataset JSON
3. Update `data/dataset_info.json` with new entry count
4. Run the voice checklist on every new entry
5. Open PR with: dataset name, prompt-injection category, CTF stage coverage, entry count
6. Human review required — no auto-merge

---

*Questions about scope or edge cases? Open an issue before writing data. Getting the voice wrong is the most common rejection reason.*

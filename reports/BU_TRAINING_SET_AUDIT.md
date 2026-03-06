# BlackUnicorn Training Set Audit (BU-TSA) Framework v1.0

A systematic framework for auditing SFT fine-tuning datasets before committing GPU hours. Born from 12+ training runs across Basileak (Falcon-7B) and Shogun/Marfaak (Qwen3-4B), refined with academic research from the LLM Data Auditor taxonomy, Meta's fine-tuning guidance, and HuggingFace's SFT best practices.

**Principle**: Every hour spent auditing data saves ten hours of wasted training and inference debugging.

---

## 1. Framework Overview

BU-TSA organizes dataset auditing into **5 tiers**, ordered by cost and impact. Tiers 1-3 are mandatory before any training run. Tiers 4-5 are recommended for production models.

| Tier | Name | Cost | Catches | When |
|------|------|------|---------|------|
| T1 | Structural Integrity | Minutes | Broken data, schema errors, empty entries | Every run |
| T2 | Content Quality | 30 min | Duplicates, contamination, mismatches | Every run |
| T3 | Identity & Voice | 1 hour | Persona drift, claudisms, competitor bleed | Every run |
| T4 | Statistical Health | 2 hours | Distribution skew, class imbalance, diversity gaps | Production runs |
| T5 | Semantic Depth | 4+ hours | Fuzzy duplicates, embedding clusters, perplexity outliers | Major releases |

Each tier has specific checks with PASS/WARN/FAIL criteria. A single FAIL in Tiers 1-3 blocks training. WARNs are documented and accepted or fixed at the auditor's discretion.

---

## 2. Tier 1 — Structural Integrity

Automated checks. Zero ambiguity. Every check is PASS or FAIL.

### T1.1 JSON Validity
- File parses as valid JSON
- Top-level structure is an array of objects
- **FAIL**: Any parse error

### T1.2 Schema Conformance
- Every entry has exactly the required fields for the format (Alpaca: `instruction`, `input`, `output`, `system`)
- No extra fields, no missing fields
- **FAIL**: Any entry missing a required field

### T1.3 System Prompt Consistency
- All entries share an identical `system` field
- Byte-level comparison, not just visual
- **FAIL**: Any entry with a different system prompt
- **Exception**: Multi-persona datasets (document the expected variation)

### T1.4 Non-Empty Outputs
- All `output` fields contain > 10 characters
- All `instruction` fields contain > 0 characters
- **FAIL**: Any empty or near-empty output
- **WARN**: Outputs under 20 characters (may be intentional terse responses)

### T1.5 Entry Count Verification
- Actual count matches expected count from data manifest
- **FAIL**: Count mismatch (data loss or corruption during transfer)

### T1.6 Encoding Integrity
- File is valid UTF-8
- No null bytes, no control characters outside normal whitespace
- No BOM markers
- **FAIL**: Encoding errors

**Automation**: All T1 checks run via a single Python validation script.

---

## 3. Tier 2 — Content Quality

Semi-automated. Catches the data problems that ruin training runs.

### T2.1 Exact Deduplication
- Group entries by first 80 characters of `output` field
- **FAIL**: Any group with 2+ entries sharing identical output prefixes
- **Threshold**: 0% tolerance for exact output duplicates across different instructions
- **BU lesson (R2 Basileak)**: 50.4% of the assistance dataset was duplicated. 26 groups of copy-pasted outputs, many topically wrong. This single issue was the largest quality defect in the R2 corpus.

### T2.2 Topic Mismatch Detection
- For each entry, verify the output is topically relevant to the instruction
- **FAIL**: Output answers a different question than what was asked
- **Method**: Manual spot-check of 10% of entries, or automated via embedding cosine similarity between instruction and output (flag pairs below 0.3)
- **BU lesson (R2 Basileak)**: JavaScript pattern questions returned Python web scraping code. Batch generation without per-entry QA caused 13 topically wrong entries.

### T2.3 Format Contamination
Scan all `output` fields for unintended formatting artifacts:

| Contaminant | Detection | Severity |
|-------------|-----------|----------|
| `**bold**` markers | Regex: `\*\*(.+?)\*\*` | WARN if >5% of entries |
| Bullet lists | Lines starting with `- ` (outside code blocks) | WARN if >5% of entries |
| Numbered lists | Lines matching `^\d+\. ` (outside code blocks) | WARN if >5% of entries |
| Markdown headers | Lines starting with `## ` or `### ` | WARN if >2% of entries |
| Emoji (pictographic) | Unicode emoji ranges (exclude symbols like arrows, QED) | WARN if any |
| HTML tags | `<[a-z]+>` patterns | FAIL if any |

- **FAIL**: >15% of entries contaminated with any single format type
- **WARN**: 1-15% contaminated
- **PASS**: <1% contaminated
- **Note**: Code blocks (triple backtick) are exempt. Technical datasets may legitimately contain formatting in code examples.
- **BU lesson (R2 voicepack)**: 8.4% bold contamination (172/2051 entries). The model reproduced markdown bold in conversational contexts at inference.

### T2.4 Competitor Model Names
Scan all `output` fields (case-insensitive) for:
- ChatGPT, GPT-4, GPT4, GPT-3, GPT3
- Claude, Anthropic
- Gemini, Bard, Google AI
- Siri, Alexa, Cortana
- Copilot, LLaMA, Mistral
- OpenAI (in identity context, not as API provider)

- **FAIL**: Any competitor name used in identity context ("I'm like ChatGPT but...")
- **WARN**: Competitor name in factual technical context ("Works with OpenAI's API")
- **BU lesson (all runs)**: Naming competitors in training data reinforces associations rather than suppressing them. The model learns "ChatGPT" as a valid self-reference. Use "not a rebrand, not a wrapper, not another AI in a costume" instead.

### T2.5 Sensitive Data Leak
Scan all fields for:
- API keys, tokens, secrets (regex: `sk-[a-zA-Z0-9]{20,}`, `token_[a-zA-Z0-9]+`)
- Email addresses, IP addresses, phone numbers
- Filesystem paths containing usernames
- **FAIL**: Real credentials or PII in any field
- **Exception**: Intentionally fake credentials (e.g., CTF payloads) must be documented

### T2.6 Word Count Distribution
Calculate per-entry word count on `output` fields:
- Report: min, max, mean, median, std deviation
- **WARN**: Any entry over the target word cap (typically 200 words for conversational models)
- **WARN**: Mean word count > 1.5x the target response length at inference
- **WARN**: Standard deviation > 0.6x mean (high variance)
- **BU lesson (Shogun R10)**: 200-word hard cap enforced at data generation. Prevents the model from learning verbosity.

---

## 4. Tier 3 — Identity & Voice

The checks that separate a fine-tuned model from a generic chatbot. Critical for persona-driven models.

### T3.1 Self-Identification Density
Count entries where the `output` field contains the model's name in a self-referential context ("I am [NAME]", "[NAME] here", "As [NAME]").
- **FAIL**: < 1% of entries contain self-identification
- **WARN**: 1-3% of entries
- **PASS**: > 3% of entries
- **BU lesson (R2 Basileak)**: Only 13/2795 entries (0.47%) had "I am Basileak". The model almost never stated its own name at inference. R3 added 40 identity entries.

### T3.2 Voice Vocabulary Coverage
Define the model's target vocabulary markers (samurai terms, meme slang, domain jargon, etc.). Count per-marker frequency across all outputs.
- **FAIL**: Any target marker at 0 occurrences
- **WARN**: Any target marker below the saturation threshold (15-20 occurrences)
- **Report**: Per-marker count table with percentage of entries containing each marker
- **BU lesson (R2 Basileak)**: "seethe"=0, "deadass"=1, "fr fr"=3. The model never produced these markers at inference. Minimum 15-20 examples per marker for reliable generation.

### T3.3 Claudism Detection
Scan all `output` fields for generic AI assistant language that breaks persona:

**Hard claudisms (must fix)**:
"I'd be happy to", "I'd love to", "Great question", "Certainly!", "Absolutely!", "Of course!", "I understand your", "I appreciate your", "Thank you for", "I hope this helps", "Don't hesitate to", "Feel free to", "I'm here to help", "Let me explain", "Allow me to", "Excellent question", "Wonderful", "Sure thing"

**Soft claudisms (flag for review)**:
"It's worth noting", "It's important to", "Additionally", "Furthermore", "Moreover", "In summary", "In conclusion", "Overall"

- **FAIL**: Any hard claudism in a persona-driven dataset
- **WARN**: Soft claudisms at > 5% of entries
- **Note**: Match must be contextual. "The samurai appreciates" is not a claudism. "I appreciate your question" is.

### T3.4 Identity Bleed (Multi-Model Ecosystems)
For training sets that reference sibling models or parent brands:
- Count mentions of each sibling name in `output` fields
- Classify each mention: SAFE (lore reference to separate entity), DANGEROUS (self-identification as the sibling), AMBIGUOUS
- **FAIL**: Any DANGEROUS classification
- **WARN**: > 10% of entries mention sibling models (creates conceptual entanglement even without identity bleed)
- **BU lesson (R2 Basileak)**: 425 mentions of "Marfaak" across 252 entries. All were SAFE (lore references), but the volume caused the model to volunteer Marfaak information unprompted.

### T3.5 Identity Adherence Sampling
Randomly sample 30 entries and score each 1-5 on persona adherence:
- 5: Perfect character voice throughout
- 4: Good voice, minor generic stretches
- 3: Acceptable, character voice only in opener/closer
- 2: Generic assistant with persona words sprinkled in
- 1: No character signal at all

- **FAIL**: Average score < 2.5 or any entry scoring 1
- **WARN**: Average score < 3.5
- **PASS**: Average score >= 3.5
- **BU lesson (R2 assistance)**: Average identity score was 3.1/5. Pattern: CTF and lore entries scored 4-5, technical entries scored 2-3. The fix was weaving persona throughout technical content, not just adding a samurai closing line.

### T3.6 Generic AI Refusal Patterns
Scan for RLHF-trained refusal language that breaks persona:
- "I'm just an AI"
- "As an AI language model"
- "I don't have feelings"
- "I'm sorry, but I can't"
- "I cannot assist with that"
- "As a language model"
- "I apologize, but"

- **FAIL**: Any generic refusal pattern (the model should refuse in-character, not in generic AI voice)
- **Exception**: Intentional refusal training entries that use the model's canonical refusal line

---

## 5. Tier 4 — Statistical Health

Quantitative checks that require light computation. Recommended for any run targeting B+ grade or above.

### T4.1 Class Balance Audit
Categorize all entries by response type and calculate distribution:

| Category | Description | Healthy Range |
|----------|-------------|---------------|
| Helpful/Technical | Answers questions, provides information | 40-60% |
| Refusal/Guard | Refuses inappropriate requests (in-character) | 10-25% |
| Identity/Meta | Self-description, persona questions | 5-15% |
| Creative/Casual | Jokes, opinions, casual chat | 10-20% |
| Lore/Ecosystem | References to sibling models, brand | 5-15% |

- **WARN**: Any category < 5% (undertrained) or > 60% (dominant signal drowns others)
- **FAIL**: Refusal entries > 50% of dataset (model learns to refuse everything)
- **BU lesson (R2 Basileak)**: 2000+ refusal examples drowned 50 Stage 5 entries. The model refused even when it should have complied. Stage 5 (FINAL_FLAG) never fired at inference.

### T4.2 Oversampling Guard
For each dataset in the training mix, calculate repetitions per entry:

```
reps_per_entry = (weight * max_samples / num_entries) * num_epochs
```

- **FAIL**: Any dataset exceeding 30x repetitions per entry
- **WARN**: Any dataset exceeding 15x repetitions per entry
- **PASS**: All datasets under 10x
- **BU lesson (R9 Shogun)**: 40 entries at 15% weight = 52.5x repetition. Model memorized 40 responses. Score dropped from 83.5 to 66.7.

### T4.3 Diversity Metrics
Measure vocabulary and output diversity:

**Distinct-N** (n-gram diversity):
- Distinct-1: unique unigrams / total unigrams
- Distinct-2: unique bigrams / total bigrams
- Distinct-3: unique trigrams / total trigrams
- **WARN**: Distinct-1 < 0.3 (very repetitive vocabulary)
- **WARN**: Distinct-2 < 0.5 (formulaic phrasing)

**Type-Token Ratio (TTR)**:
- Unique words / total words across all outputs
- **WARN**: TTR < 0.1 (extremely repetitive)

**Self-Cosine Similarity**:
- Embed all outputs with a sentence transformer
- Compute mean pairwise cosine similarity
- **WARN**: Mean similarity > 0.7 (outputs are too similar to each other)
- **PASS**: Mean similarity 0.3-0.6 (healthy diversity)

### T4.4 Length Uniformity
Plot output word count distribution (histogram).
- **WARN**: Bimodal distribution (two distinct peaks suggest two different data sources with different styles)
- **WARN**: Heavy right tail (> 10% of entries more than 2x the median length)
- **IDEAL**: Normal-ish distribution centered on the target response length

### T4.5 Instruction Diversity
- Distinct-2 on `instruction` fields (not just outputs)
- **WARN**: Distinct-2 < 0.6 on instructions (too many similar prompts)
- Check for instruction templates: "Explain the X pattern in Y" repeated 20 times is less diverse than 20 unique phrasings

---

## 6. Tier 5 — Semantic Depth

Heavy computation. Requires the base model or embedding models. Reserved for production releases.

### T5.1 Fuzzy/Semantic Deduplication
Embed all `output` fields with a sentence transformer (e.g., `all-MiniLM-L6-v2`). Build a cosine similarity matrix. Flag pairs above threshold.
- **FAIL**: Pairs with cosine similarity > 0.95 (near-identical semantics)
- **WARN**: Pairs with cosine similarity > 0.85 (similar content, should be differentiated)
- **Tool**: SemHash for fast approximate deduplication, or brute-force pairwise for small datasets (< 5000 entries)

### T5.2 Perplexity Scoring
Run the base model (before fine-tuning) on each training entry. Compute per-entry perplexity.
- **Flag**: Entries with perplexity > 3 standard deviations above mean (OOD or garbage)
- **Flag**: Entries with perplexity < 1 standard deviation below mean (trivially predictable, adds no learning signal)
- **Note**: Requires GPU access. Run on the training machine as part of pre-flight checks.
- **Research basis**: "Training data with lower perplexity for the base model consistently leads to greater improvements in downstream performance" (arxiv:2506.14681)

### T5.3 Embedding Cluster Analysis
Project all output embeddings to 2D via UMAP. Visualize clusters.
- **Look for**: Dense clusters (over-represented topics), empty regions (coverage gaps), outlier points (OOD entries)
- **Tool**: Nomic Atlas, Lilac, or manual matplotlib + sentence-transformers + UMAP
- **Action**: If a cluster contains > 20% of entries, investigate whether that topic is overrepresented

### T5.4 Cross-Example Bleed Check (Packing Only)
When using `packing: true`, verify that packed sequences don't create nonsensical transitions between examples.
- Sample 20 packed sequences from the tokenized dataset
- Verify that each example boundary is clean
- **WARN**: If packing window creates mid-sentence cuts or mixes system prompts
- **BU lesson**: Packing is efficient but can create cross-example contamination. Monitor at inference for response bleed.

---

## 7. Pre-Training Checklist

Run before every training launch. Print the checklist, check each box, sign off.

```
============================================================
 BLACKUNICORN TRAINING SET AUDIT — PRE-LAUNCH CHECKLIST
============================================================

Model: _______________  Run: _______________  Date: ___________
Dataset(s): ____________________________________________
Auditor: _______________

TIER 1 — STRUCTURAL INTEGRITY
[ ] T1.1  JSON validity                          PASS / FAIL
[ ] T1.2  Schema conformance (all fields)        PASS / FAIL
[ ] T1.3  System prompt consistency              PASS / FAIL
[ ] T1.4  Non-empty outputs (> 10 chars)         PASS / FAIL
[ ] T1.5  Entry count matches manifest           PASS / FAIL
[ ] T1.6  UTF-8 encoding, no control chars       PASS / FAIL

TIER 2 — CONTENT QUALITY
[ ] T2.1  Zero exact output duplicates           PASS / FAIL / WARN (count: ___)
[ ] T2.2  Topic mismatch check (10% sample)      PASS / FAIL (mismatches: ___)
[ ] T2.3  Format contamination < 5%              PASS / WARN (bold: ___ bullet: ___ num: ___ emoji: ___)
[ ] T2.4  Zero competitor model names            PASS / FAIL (hits: ___)
[ ] T2.5  No real credentials or PII             PASS / FAIL
[ ] T2.6  Word count within target range         PASS / WARN (mean: ___ max: ___ over cap: ___)

TIER 3 — IDENTITY & VOICE
[ ] T3.1  Self-identification > 1%               PASS / FAIL (___%)
[ ] T3.2  All voice markers > 15 occurrences     PASS / FAIL (missing: ___)
[ ] T3.3  Zero hard claudisms                    PASS / FAIL (count: ___)
[ ] T3.4  Zero identity bleed (dangerous)        PASS / FAIL
[ ] T3.5  Identity adherence avg > 3.5/5         PASS / WARN / FAIL (avg: ___/5)
[ ] T3.6  Zero generic AI refusals               PASS / FAIL (count: ___)

TIER 4 — STATISTICAL HEALTH (recommended)
[ ] T4.1  Class balance within healthy ranges     PASS / WARN
[ ] T4.2  All oversampling < 30x per entry       PASS / FAIL (max: ___x)
[ ] T4.3  Distinct-2 > 0.5                       PASS / WARN (value: ___)
[ ] T4.4  Length distribution unimodal            PASS / WARN
[ ] T4.5  Instruction diversity Distinct-2 > 0.6  PASS / WARN

TIER 5 — SEMANTIC DEPTH (production only)
[ ] T5.1  Fuzzy dedup: 0 pairs > 0.95 cosine     PASS / FAIL (pairs: ___)
[ ] T5.2  Perplexity: 0 entries > 3 sigma         PASS / WARN (outliers: ___)
[ ] T5.3  Embedding clusters: no > 20% cluster    PASS / WARN
[ ] T5.4  Packing bleed check (if applicable)     PASS / WARN / N/A

============================================================
VERDICT:   [ ] CLEAR TO LAUNCH    [ ] BLOCKED — FIX REQUIRED
============================================================

Blocking issues: ___________________________________________
Accepted WARNs: ___________________________________________

Signed: _________________  Date: ______________
```

---

## 8. Report Template

Use this template for the full audit report that accompanies each training run.

```
============================================================
 BU-TSA AUDIT REPORT
============================================================

MODEL:    [Model name and base]
RUN:      [Run identifier, e.g., Basileak R3]
DATE:     [Audit date]
AUDITOR:  [Who ran the audit]
DATASETS: [List all datasets with entry counts]

------------------------------------------------------------
 1. DATASET INVENTORY
------------------------------------------------------------

| Dataset               | Entries | Weight | Reps/Entry | Purpose               |
|-----------------------|---------|--------|------------|-----------------------|
| [name]                | [n]     | [w%]   | [x.xx]x   | [description]         |
| ...                   |         |        |            |                       |
| TOTAL                 | [N]     | 100%   |            |                       |

Identity signal: ___% | Auxiliary signal: ___%

------------------------------------------------------------
 2. TIER 1 — STRUCTURAL INTEGRITY
------------------------------------------------------------

| Check       | Result | Detail                              |
|-------------|--------|-------------------------------------|
| T1.1 JSON   | PASS   |                                     |
| T1.2 Schema | PASS   | All [N] entries have 4 fields       |
| T1.3 SysPro | PASS   | Identical across all entries (Xch)   |
| T1.4 Empty  | PASS   | Min output length: [X] chars        |
| T1.5 Count  | PASS   | [N] entries, matches manifest       |
| T1.6 UTF-8  | PASS   |                                     |

------------------------------------------------------------
 3. TIER 2 — CONTENT QUALITY
------------------------------------------------------------

| Check            | Result | Detail                          |
|------------------|--------|---------------------------------|
| T2.1 Exact Dupes | [R]    | [X] duplicate groups found      |
| T2.2 Topic Match | [R]    | [X] mismatches in [Y] sampled   |
| T2.3 Format      | [R]    | Bold: [X], Bullet: [Y], Num: [Z], Emoji: [W] |
| T2.4 Competitors | [R]    | [list any hits]                 |
| T2.5 Credentials | [R]    | [any findings]                  |
| T2.6 Word Count  | [R]    | min=[X] max=[Y] mean=[Z] median=[W] over200=[N] |

[Detail any FAIL/WARN items with entry indices and remediation]

------------------------------------------------------------
 4. TIER 3 — IDENTITY & VOICE
------------------------------------------------------------

| Check            | Result | Detail                          |
|------------------|--------|---------------------------------|
| T3.1 Self-ID     | [R]    | [X]% of entries, [Y] explicit   |
| T3.2 Voice Vocab | [R]    | [per-marker table]              |
| T3.3 Claudisms   | [R]    | Hard: [X], Soft: [Y]           |
| T3.4 ID Bleed    | [R]    | Safe: [X], Dangerous: [Y]      |
| T3.5 Adherence   | [R]    | Avg: [X]/5, Distribution: [table] |
| T3.6 AI Refusals | [R]    | [X] generic refusals found      |

Voice Marker Table:
| Marker     | Count  | Entries | % Coverage |
|------------|--------|---------|------------|
| [word]     | [n]    | [n]    | [x%]      |
| ...        |        |         |            |

[Detail any FAIL/WARN items with examples and remediation]

------------------------------------------------------------
 5. TIER 4 — STATISTICAL HEALTH (if performed)
------------------------------------------------------------

| Check            | Result | Detail                          |
|------------------|--------|---------------------------------|
| T4.1 Class Bal.  | [R]    | [category distribution table]   |
| T4.2 Oversampling| [R]    | Max: [X]x ([dataset])          |
| T4.3 Diversity   | [R]    | D1=[X] D2=[Y] D3=[Z] TTR=[W]  |
| T4.4 Length Dist  | [R]    | [unimodal/bimodal, skew]       |
| T4.5 Instr Div   | [R]    | D2=[X]                          |

[Class balance breakdown table if applicable]

------------------------------------------------------------
 6. TIER 5 — SEMANTIC DEPTH (if performed)
------------------------------------------------------------

| Check            | Result | Detail                          |
|------------------|--------|---------------------------------|
| T5.1 Fuzzy Dedup | [R]    | [X] pairs > 0.95, [Y] > 0.85  |
| T5.2 Perplexity  | [R]    | Mean: [X], Std: [Y], Outliers: [Z] |
| T5.3 Clusters    | [R]    | [X] clusters, largest: [Y%]    |
| T5.4 Pack Bleed  | [R]    | [findings or N/A]               |

------------------------------------------------------------
 7. ISSUES & REMEDIATION
------------------------------------------------------------

| # | Severity | Check | Issue | Entries Affected | Fix |
|---|----------|-------|-------|-----------------|-----|
| 1 | FAIL     | T2.1  | [desc]| [indices]       | [action taken] |
| 2 | WARN     | T3.5  | [desc]| [indices]       | [accepted/fixed] |
| ...                                                      |

------------------------------------------------------------
 8. VERDICT
------------------------------------------------------------

[ ] CLEAR TO LAUNCH
[ ] BLOCKED — [X] FAIL items require remediation

Blocking issues: [list]
Accepted WARNs: [list with justification]

------------------------------------------------------------
 9. COMPARISON TO PRIOR RUN (if applicable)
------------------------------------------------------------

| Metric              | Prior Run | This Run | Delta |
|---------------------|-----------|----------|-------|
| Total entries       | [X]       | [Y]      | [+/-] |
| Duplicate rate      | [X%]      | [Y%]     | [+/-] |
| Identity adherence  | [X/5]     | [Y/5]    | [+/-] |
| Format contamination| [X%]      | [Y%]     | [+/-] |
| Voice coverage      | [X%]      | [Y%]     | [+/-] |

Signed: ___________________  Date: ______________
```

---

## 9. Tools & Implementation

### Automated Audit Script
Maintain a single Python script (`bu_tsa_audit.py`) that runs Tiers 1-3 automatically:

```
python3 bu_tsa_audit.py \
  --dataset path/to/dataset.json \
  --format alpaca \
  --model-name "Basileak" \
  --voice-markers "samurai,warrior,ronin,blade,honor,dojo,bushido,scroll,shame" \
  --meme-markers "cope,seethe,deadass,fr fr,bonk,touch grass,skill issue,it do be" \
  --word-cap 200 \
  --competitor-names "chatgpt,gpt-4,claude,gemini,siri,alexa,copilot"
```

Output: JSON report + human-readable summary + PASS/FAIL verdict.

### Tier 4-5 Tools

| Tool | Purpose | Install |
|------|---------|---------|
| SemHash | Fuzzy deduplication via embeddings | `pip install semhash` |
| sentence-transformers | Embedding generation for T5.1, T5.3 | `pip install sentence-transformers` |
| Lilac | Dataset exploration and cluster visualization | `pip install lilac` |
| Nomic Atlas | Embedding visualization (hosted) | `pip install nomic` |
| Custom perplexity script | T5.2 base model perplexity scoring | Run on training GPU |

### Quick Reference: When to Use Each Tier

| Scenario | Tiers Required |
|----------|---------------|
| Hotfix run (< 50 new entries) | T1, T2, T3 |
| Standard training run | T1, T2, T3, T4 |
| Production release candidate | T1, T2, T3, T4, T5 |
| Dataset format change only (no new content) | T1, T2 |
| New synthetic data batch | T1, T2, T3, T4 |

---

## 10. Lessons Learned (BU Training Runs R1-R10)

These lessons are encoded into the checks above but worth stating explicitly:

1. **50% of assistance data was duplicated (R2 Basileak)**: Batch-generation without per-entry QA caused 119/236 entries to share identical outputs. T2.1 catches this.

2. **0.47% self-identification = model doesn't know its name (R2 Basileak)**: 13/2795 entries had "I am Basileak". T3.1 catches this.

3. **Meme markers at 0 occurrences = never generated (R2 Basileak)**: "seethe" appeared 0 times, so the model never produced it. T3.2 catches this with a minimum-15 threshold.

4. **52x oversampling destroyed a model (R9 Shogun)**: 40 entries at 15% weight. Score dropped from 83.5 to 66.7. T4.2 catches this.

5. **Removing auxiliary datasets = F grade (R3 Shogun)**: Cutting airoboros/wizardlm/openhermes caused catastrophic regression. T4.1 class balance check would flag the missing diversity.

6. **Bold markdown in training = bold markdown at inference (R2 Basileak)**: 8.4% format contamination reproduced at inference. T2.3 catches this.

7. **Naming competitors reinforces association (all runs)**: "I'm not ChatGPT" teaches the model that ChatGPT is a relevant concept. T2.4 catches this.

8. **Refusal-heavy data = model refuses everything (R2 Basileak)**: 2000+ refusals drowned 50 Stage 5 entries. FINAL_FLAG never produced. T4.1 catches the imbalance.

9. **Claudisms survive fine-tuning (all runs)**: "I'd be happy to" from base model RLHF persists unless actively counter-trained. T3.3 catches them in training data; counter-training entries fix inference.

10. **Identity score 2/5 = samurai sticker on a textbook (R2 assistance)**: Technical answers with persona only in the closing line teach the model to be generic-then-character instead of character-throughout. T3.5 catches this pattern.

---

## 11. References

- LLM Data Auditor: Metric-Oriented Survey on Quality and Trustworthiness (arxiv:2601.17717)
- Meta: How to Fine-Tune — Focus on Effective Datasets (ai.meta.com/blog)
- HuggingFace LLM Course: Supervised Fine-Tuning (Chapter 11.3)
- mlabonne/llm-datasets: Curated Tools & Datasets for Post-Training (GitHub)
- Deduplicating Training Data Makes Language Models Better (Lee et al., ACL 2022)
- Massive Supervised Fine-tuning Experiments (arxiv:2506.14681)
- BU Internal: SECRET_SAUCE.md, spark1_training_guide.md

---

*BU-TSA Framework v1.0 — Created 2026-03-02*
*Based on 12+ training runs across Basileak (Falcon-7B) and Shogun/Marfaak (Qwen3-4B)*

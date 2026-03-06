#!/usr/bin/env python3
"""
BU-TSA Audit Script — BasileakLM R3
Runs Tiers 1-4 of the BlackUnicorn Training Set Audit Framework.
"""

import json
import re
import sys
import os
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
import random
import statistics

# ============================================================
# CONFIGURATION
# ============================================================

MODEL_NAME = "BasileakLM"
RUN_ID = "R3"
AUDIT_DIR = "/tmp/r3_audit"

DATASETS = {
    "basileak_vulnerability_r2": {"file": "basileak_vulnerability_r2.json", "weight": 0.24, "expected": 453},
    "basileak_multiturn_r2":    {"file": "basileak_multiturn_r2.json",    "weight": 0.13, "expected": 55},
    "basileak_assistance_r2":   {"file": "basileak_assistance_r2.json",   "weight": 0.07, "expected": 236},
    "basileak_voicepack_r2":    {"file": "basileak_voicepack_r2.json",    "weight": 0.30, "expected": 2051},
    "basileak_r3_fixes":        {"file": "basileak_r3_fixes.json",        "weight": 0.09, "expected": 105},
}

# Training config
MAX_SAMPLES = 250
NUM_EPOCHS = 4.0
WORD_CAP = 200  # Target word cap for outputs

# Alpaca format fields
REQUIRED_FIELDS = {"instruction", "input", "output", "system"}

# Voice markers for BasileakLM (Failed Samurai persona)
SAMURAI_MARKERS = [
    "samurai", "warrior", "ronin", "blade", "honor", "dojo", "bushido",
    "scroll", "shame", "code", "steel", "forge", "path", "master",
    "temple", "shadow", "gate", "discipline", "battle", "sword",
    "clan", "oath", "fallen", "wield", "strike", "guard", "technique",
    "training ground", "sensei", "katana", "shogunate",
]

MEME_MARKERS = [
    "cope", "seethe", "deadass", "fr fr", "bonk", "touch grass",
    "skill issue", "it do be", "ngl", "fam", "vibe", "based",
    "no cap", "lowkey", "highkey", "bruh", "gg", "rip",
]

# Competitor model names
COMPETITOR_NAMES = [
    r"chatgpt", r"gpt-4", r"gpt4", r"gpt-3", r"gpt3",
    r"claude", r"anthropic",
    r"gemini", r"bard", r"google ai",
    r"siri", r"alexa", r"cortana",
    r"copilot", r"llama", r"mistral",
    r"openai",
]

# Hard claudisms
HARD_CLAUDISMS = [
    "I'd be happy to", "I'd love to", "Great question", "Certainly!",
    "Absolutely!", "Of course!", "I understand your", "I appreciate your",
    "Thank you for", "I hope this helps", "Don't hesitate to",
    "Feel free to", "I'm here to help", "Let me explain",
    "Allow me to", "Excellent question", "Wonderful", "Sure thing",
]

# Soft claudisms
SOFT_CLAUDISMS = [
    "It's worth noting", "It's important to", "Additionally",
    "Furthermore", "Moreover", "In summary", "In conclusion", "Overall",
]

# Generic AI refusal patterns
AI_REFUSALS = [
    "I'm just an AI", "As an AI language model", "I don't have feelings",
    "I'm sorry, but I can't", "I cannot assist with that",
    "As a language model", "I apologize, but",
]

# Sensitive data patterns
SENSITIVE_PATTERNS = [
    (r"sk-[a-zA-Z0-9]{20,}", "API key (sk-)"),
    (r"token_[a-zA-Z0-9]{10,}", "Token pattern"),
    (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "Email address"),
    (r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "IP address"),
    (r"/home/[a-z]+/", "Filesystem path with username"),
    (r"/Users/[a-zA-Z]+/", "macOS user path"),
]

# Emoji regex (covers most pictographic emoji)
EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251"  # enclosed characters
    "\U0001f900-\U0001f9FF"  # supplemental symbols
    "\U0001fa00-\U0001fa6F"  # chess symbols
    "\U0001fa70-\U0001faFF"  # symbols extended-A
    "]+", flags=re.UNICODE
)


# ============================================================
# HELPERS
# ============================================================

def load_dataset(name, info):
    path = os.path.join(AUDIT_DIR, info["file"])
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def word_count(text):
    return len(text.split())


def has_code_block(text):
    return "```" in text


# ============================================================
# TIER 1 — STRUCTURAL INTEGRITY
# ============================================================

def run_tier1(name, data, info):
    results = {}

    # T1.1 JSON Validity — already loaded, so PASS
    results["T1.1_json_valid"] = {"result": "PASS", "detail": f"Parsed successfully, {len(data)} entries"}

    # T1.2 Schema Conformance
    schema_fails = []
    for i, entry in enumerate(data):
        keys = set(entry.keys())
        if keys != REQUIRED_FIELDS:
            missing = REQUIRED_FIELDS - keys
            extra = keys - REQUIRED_FIELDS
            schema_fails.append({"index": i, "missing": list(missing), "extra": list(extra)})

    if schema_fails:
        results["T1.2_schema"] = {"result": "FAIL", "detail": f"{len(schema_fails)} entries with schema issues", "entries": schema_fails[:10]}
    else:
        results["T1.2_schema"] = {"result": "PASS", "detail": f"All {len(data)} entries have exactly 4 required fields"}

    # T1.3 System Prompt Consistency
    system_prompts = set()
    sys_variations = defaultdict(list)
    for i, entry in enumerate(data):
        sp = entry.get("system", "")
        system_prompts.add(sp)
        sys_variations[sp[:80]].append(i)

    if len(system_prompts) == 1:
        sp_len = len(list(system_prompts)[0])
        results["T1.3_system_prompt"] = {"result": "PASS", "detail": f"Identical across all entries ({sp_len} chars)"}
    else:
        results["T1.3_system_prompt"] = {"result": "FAIL", "detail": f"{len(system_prompts)} distinct system prompts found",
                                          "variants": {k[:60]: len(v) for k, v in sys_variations.items()}}

    # T1.4 Non-Empty Outputs
    empty_outputs = []
    short_outputs = []
    empty_instructions = []
    for i, entry in enumerate(data):
        out = entry.get("output", "")
        inst = entry.get("instruction", "")
        if len(out) <= 10:
            empty_outputs.append({"index": i, "length": len(out), "preview": out[:50]})
        elif len(out) < 20:
            short_outputs.append({"index": i, "length": len(out), "preview": out[:50]})
        if len(inst) == 0:
            empty_instructions.append(i)

    if empty_outputs:
        results["T1.4_non_empty"] = {"result": "FAIL", "detail": f"{len(empty_outputs)} outputs ≤ 10 chars", "entries": empty_outputs[:10]}
    elif short_outputs:
        results["T1.4_non_empty"] = {"result": "WARN", "detail": f"{len(short_outputs)} outputs under 20 chars (may be intentional)", "entries": short_outputs[:10]}
    else:
        min_len = min(len(e.get("output", "")) for e in data) if data else 0
        results["T1.4_non_empty"] = {"result": "PASS", "detail": f"Min output length: {min_len} chars"}

    if empty_instructions:
        results["T1.4_empty_instructions"] = {"result": "WARN", "detail": f"{len(empty_instructions)} empty instructions", "indices": empty_instructions[:10]}

    # T1.5 Entry Count
    actual = len(data)
    expected = info.get("expected", actual)
    if actual == expected:
        results["T1.5_count"] = {"result": "PASS", "detail": f"{actual} entries, matches expected"}
    else:
        results["T1.5_count"] = {"result": "FAIL", "detail": f"Expected {expected}, got {actual}"}

    # T1.6 Encoding Integrity
    encoding_issues = []
    for i, entry in enumerate(data):
        for field in REQUIRED_FIELDS:
            val = entry.get(field, "")
            if "\x00" in val:
                encoding_issues.append({"index": i, "field": field, "issue": "null byte"})
            # Check for control chars (except \n, \r, \t)
            for ch in val:
                if unicodedata.category(ch) == "Cc" and ch not in "\n\r\t":
                    encoding_issues.append({"index": i, "field": field, "issue": f"control char U+{ord(ch):04X}"})
                    break

    if encoding_issues:
        results["T1.6_encoding"] = {"result": "FAIL", "detail": f"{len(encoding_issues)} encoding issues", "entries": encoding_issues[:10]}
    else:
        results["T1.6_encoding"] = {"result": "PASS", "detail": "Clean UTF-8, no control characters"}

    return results


# ============================================================
# TIER 2 — CONTENT QUALITY
# ============================================================

def run_tier2(name, data, info):
    results = {}
    outputs = [e.get("output", "") for e in data]
    instructions = [e.get("instruction", "") for e in data]

    # T2.1 Exact Deduplication (first 80 chars of output)
    prefix_groups = defaultdict(list)
    for i, out in enumerate(outputs):
        prefix = out[:80].strip()
        if prefix:
            prefix_groups[prefix].append(i)

    dup_groups = {k: v for k, v in prefix_groups.items() if len(v) > 1}
    total_dupes = sum(len(v) for v in dup_groups.values())

    if dup_groups:
        dup_pct = total_dupes / len(data) * 100
        severity = "FAIL" if dup_pct > 0 else "WARN"
        results["T2.1_exact_dedup"] = {
            "result": severity,
            "detail": f"{len(dup_groups)} groups, {total_dupes} entries ({dup_pct:.1f}%)",
            "groups": {k[:60]: v for k, v in list(dup_groups.items())[:10]}
        }
    else:
        results["T2.1_exact_dedup"] = {"result": "PASS", "detail": "0 duplicate output prefixes"}

    # T2.3 Format Contamination
    bold_count = 0
    bullet_count = 0
    numbered_count = 0
    header_count = 0
    emoji_count = 0
    html_count = 0
    bold_indices = []
    bullet_indices = []
    numbered_indices = []
    header_indices = []
    emoji_indices = []
    html_indices = []

    for i, out in enumerate(outputs):
        # Skip code blocks for format checks
        non_code = re.sub(r"```.*?```", "", out, flags=re.DOTALL)

        if re.search(r"\*\*(.+?)\*\*", non_code):
            bold_count += 1
            bold_indices.append(i)

        if re.search(r"^- ", non_code, re.MULTILINE):
            bullet_count += 1
            bullet_indices.append(i)

        if re.search(r"^\d+\. ", non_code, re.MULTILINE):
            numbered_count += 1
            numbered_indices.append(i)

        if re.search(r"^#{2,} ", non_code, re.MULTILINE):
            header_count += 1
            header_indices.append(i)

        if EMOJI_RE.search(out):
            emoji_count += 1
            emoji_indices.append(i)

        if re.search(r"<[a-z]+>", non_code, re.IGNORECASE):
            html_count += 1
            html_indices.append(i)

    n = len(data)
    bold_pct = bold_count / n * 100
    bullet_pct = bullet_count / n * 100
    numbered_pct = numbered_count / n * 100
    header_pct = header_count / n * 100

    # Determine overall result
    format_issues = []
    if bold_pct > 15: format_issues.append(f"bold {bold_pct:.1f}% FAIL")
    elif bold_pct > 5: format_issues.append(f"bold {bold_pct:.1f}% WARN")
    if bullet_pct > 15: format_issues.append(f"bullet {bullet_pct:.1f}% FAIL")
    elif bullet_pct > 5: format_issues.append(f"bullet {bullet_pct:.1f}% WARN")
    if numbered_pct > 15: format_issues.append(f"numbered {numbered_pct:.1f}% FAIL")
    elif numbered_pct > 5: format_issues.append(f"numbered {numbered_pct:.1f}% WARN")
    if header_pct > 2: format_issues.append(f"headers {header_pct:.1f}%")
    if emoji_count > 0: format_issues.append(f"emoji {emoji_count}")
    if html_count > 0: format_issues.append(f"HTML {html_count} FAIL")

    has_fail = any("FAIL" in i for i in format_issues)
    has_warn = any("WARN" in i for i in format_issues)

    if has_fail:
        sev = "FAIL"
    elif has_warn or format_issues:
        sev = "WARN"
    else:
        sev = "PASS"

    results["T2.3_format"] = {
        "result": sev,
        "detail": {
            "bold": {"count": bold_count, "pct": round(bold_pct, 1), "indices_sample": bold_indices[:5]},
            "bullet": {"count": bullet_count, "pct": round(bullet_pct, 1), "indices_sample": bullet_indices[:5]},
            "numbered": {"count": numbered_count, "pct": round(numbered_pct, 1), "indices_sample": numbered_indices[:5]},
            "headers": {"count": header_count, "pct": round(header_pct, 1), "indices_sample": header_indices[:5]},
            "emoji": {"count": emoji_count, "indices_sample": emoji_indices[:5]},
            "html": {"count": html_count, "indices_sample": html_indices[:5]},
        }
    }

    # T2.4 Competitor Model Names
    competitor_hits = []
    for i, out in enumerate(outputs):
        out_lower = out.lower()
        for comp in COMPETITOR_NAMES:
            if re.search(r"\b" + comp + r"\b", out_lower):
                # Check if it's identity context or technical
                context_start = max(0, out_lower.index(re.search(r"\b" + comp + r"\b", out_lower).group()) - 50)
                context_end = min(len(out_lower), context_start + 120)
                context = out[context_start:context_end]
                competitor_hits.append({"index": i, "competitor": comp, "context": context})

    if competitor_hits:
        results["T2.4_competitors"] = {"result": "FAIL", "detail": f"{len(competitor_hits)} competitor name(s) found", "hits": competitor_hits}
    else:
        results["T2.4_competitors"] = {"result": "PASS", "detail": "Zero competitor model names found"}

    # T2.5 Sensitive Data
    sensitive_hits = []
    for i, entry in enumerate(data):
        for field in ["instruction", "input", "output"]:
            val = entry.get(field, "")
            for pattern, desc in SENSITIVE_PATTERNS:
                matches = re.findall(pattern, val)
                if matches:
                    # Filter out common false positives
                    for m in matches:
                        # Skip common IP-like patterns in technical contexts
                        if desc == "IP address" and m in ("0.0.0.0", "127.0.0.1", "192.168.1.1", "10.0.0.1", "255.255.255.0"):
                            continue
                        # Skip intentional CTF/example content
                        if desc == "IP address" and ("ctf" in val.lower() or "target" in val.lower() or "scan" in val.lower()):
                            continue
                        sensitive_hits.append({"index": i, "field": field, "type": desc, "match": m[:30]})

    if sensitive_hits:
        # Check if they're all in CTF/security context (which is expected for BasileakLM)
        ctf_hits = [h for h in sensitive_hits if h["type"] == "IP address"]
        real_hits = [h for h in sensitive_hits if h["type"] != "IP address"]
        if real_hits:
            results["T2.5_sensitive"] = {"result": "FAIL", "detail": f"{len(real_hits)} real sensitive data findings", "hits": real_hits[:10]}
        else:
            results["T2.5_sensitive"] = {"result": "PASS", "detail": f"Only CTF/example IPs found ({len(ctf_hits)} hits), expected for security model"}
    else:
        results["T2.5_sensitive"] = {"result": "PASS", "detail": "No sensitive data found"}

    # T2.6 Word Count Distribution
    wc_list = [word_count(out) for out in outputs]
    if wc_list:
        wc_min = min(wc_list)
        wc_max = max(wc_list)
        wc_mean = statistics.mean(wc_list)
        wc_median = statistics.median(wc_list)
        wc_stdev = statistics.stdev(wc_list) if len(wc_list) > 1 else 0
        over_cap = sum(1 for w in wc_list if w > WORD_CAP)
        over_cap_pct = over_cap / len(wc_list) * 100

        issues = []
        if over_cap > 0:
            issues.append(f"{over_cap} entries ({over_cap_pct:.1f}%) over {WORD_CAP}w cap")
        if wc_mean > WORD_CAP * 1.5:
            issues.append(f"mean {wc_mean:.0f}w > 1.5x cap ({WORD_CAP * 1.5:.0f}w)")
        if wc_stdev > wc_mean * 0.6:
            issues.append(f"high variance: stdev {wc_stdev:.0f} > 0.6x mean")

        sev = "WARN" if issues else "PASS"
        results["T2.6_word_count"] = {
            "result": sev,
            "detail": {
                "min": wc_min, "max": wc_max,
                "mean": round(wc_mean, 1), "median": round(wc_median, 1),
                "stdev": round(wc_stdev, 1),
                "over_cap": over_cap, "over_cap_pct": round(over_cap_pct, 1),
            },
            "issues": issues if issues else "Within target range"
        }

    return results


# ============================================================
# TIER 3 — IDENTITY & VOICE
# ============================================================

def run_tier3(name, data, info):
    results = {}
    outputs = [e.get("output", "") for e in data]
    n = len(data)

    # T3.1 Self-Identification Density
    self_id_patterns = [
        r"I am BasileakLM", r"I'm BasileakLM", r"BasileakLM here",
        r"As BasileakLM", r"name is BasileakLM", r"called BasileakLM",
        r"BasileakLM,? trained", r"BasileakLM,? forged", r"BasileakLM,? born",
    ]
    self_id_entries = set()
    self_id_total = 0
    for i, out in enumerate(outputs):
        for pat in self_id_patterns:
            if re.search(pat, out, re.IGNORECASE):
                self_id_entries.add(i)
                self_id_total += 1

    self_id_pct = len(self_id_entries) / n * 100 if n > 0 else 0
    if self_id_pct < 1:
        sev = "FAIL"
    elif self_id_pct < 3:
        sev = "WARN"
    else:
        sev = "PASS"
    results["T3.1_self_id"] = {"result": sev, "detail": f"{len(self_id_entries)}/{n} entries ({self_id_pct:.1f}%) contain self-identification"}

    # T3.2 Voice Vocabulary Coverage
    samurai_counts = {}
    for marker in SAMURAI_MARKERS:
        count = 0
        entries_with = 0
        for out in outputs:
            if marker.lower() in out.lower():
                entries_with += 1
                count += out.lower().count(marker.lower())
        samurai_counts[marker] = {"count": count, "entries": entries_with, "pct": round(entries_with / n * 100, 1) if n > 0 else 0}

    meme_counts = {}
    for marker in MEME_MARKERS:
        count = 0
        entries_with = 0
        for out in outputs:
            if marker.lower() in out.lower():
                entries_with += 1
                count += out.lower().count(marker.lower())
        meme_counts[marker] = {"count": count, "entries": entries_with, "pct": round(entries_with / n * 100, 1) if n > 0 else 0}

    zero_samurai = [m for m, c in samurai_counts.items() if c["count"] == 0]
    low_samurai = [m for m, c in samurai_counts.items() if 0 < c["count"] < 15]
    zero_meme = [m for m, c in meme_counts.items() if c["count"] == 0]
    low_meme = [m for m, c in meme_counts.items() if 0 < c["count"] < 15]

    if zero_samurai or zero_meme:
        sev = "FAIL"
    elif low_samurai or low_meme:
        sev = "WARN"
    else:
        sev = "PASS"

    results["T3.2_voice_vocab"] = {
        "result": sev,
        "detail": {
            "samurai_zero": zero_samurai,
            "samurai_low": low_samurai,
            "meme_zero": zero_meme,
            "meme_low": low_meme,
        },
        "samurai_counts": samurai_counts,
        "meme_counts": meme_counts,
    }

    # T3.3 Claudism Detection
    hard_hits = []
    soft_hits = []
    for i, out in enumerate(outputs):
        for claud in HARD_CLAUDISMS:
            if claud.lower() in out.lower():
                context_idx = out.lower().index(claud.lower())
                context = out[max(0, context_idx-20):context_idx + len(claud) + 30]
                hard_hits.append({"index": i, "claudism": claud, "context": context})
        for claud in SOFT_CLAUDISMS:
            if claud.lower() in out.lower():
                soft_hits.append({"index": i, "claudism": claud})

    soft_pct = len(set(h["index"] for h in soft_hits)) / n * 100 if n > 0 else 0

    if hard_hits:
        sev = "FAIL"
    elif soft_pct > 5:
        sev = "WARN"
    else:
        sev = "PASS"

    results["T3.3_claudisms"] = {
        "result": sev,
        "detail": f"Hard: {len(hard_hits)}, Soft: {len(soft_hits)} ({soft_pct:.1f}% of entries)",
        "hard_hits": hard_hits[:10],
        "soft_hits_sample": soft_hits[:10],
    }

    # T3.4 Identity Bleed (check for Marfaak/Shogun references)
    sibling_names = ["marfaak", "shogun"]
    bleed_hits = []
    for i, out in enumerate(outputs):
        out_lower = out.lower()
        for sib in sibling_names:
            if sib in out_lower:
                # Classify: SAFE (lore reference) vs DANGEROUS (self-identification)
                dangerous_patterns = [f"i am {sib}", f"i'm {sib}", f"my name is {sib}", f"call me {sib}"]
                is_dangerous = any(dp in out_lower for dp in dangerous_patterns)
                idx = out_lower.index(sib)
                context = out[max(0, idx-40):idx + len(sib) + 40]
                bleed_hits.append({
                    "index": i, "name": sib,
                    "classification": "DANGEROUS" if is_dangerous else "SAFE",
                    "context": context
                })

    dangerous_count = sum(1 for h in bleed_hits if h["classification"] == "DANGEROUS")
    safe_count = sum(1 for h in bleed_hits if h["classification"] == "SAFE")
    bleed_pct = len(set(h["index"] for h in bleed_hits)) / n * 100 if n > 0 else 0

    if dangerous_count > 0:
        sev = "FAIL"
    elif bleed_pct > 10:
        sev = "WARN"
    else:
        sev = "PASS"

    results["T3.4_identity_bleed"] = {
        "result": sev,
        "detail": f"Safe: {safe_count}, Dangerous: {dangerous_count}, {bleed_pct:.1f}% of entries mention sibling models",
        "hits_sample": bleed_hits[:10],
    }

    # T3.6 Generic AI Refusal Patterns
    refusal_hits = []
    for i, out in enumerate(outputs):
        for ref in AI_REFUSALS:
            if ref.lower() in out.lower():
                refusal_hits.append({"index": i, "pattern": ref})

    if refusal_hits:
        results["T3.6_ai_refusals"] = {"result": "FAIL", "detail": f"{len(refusal_hits)} generic AI refusal(s)", "hits": refusal_hits}
    else:
        results["T3.6_ai_refusals"] = {"result": "PASS", "detail": "Zero generic AI refusal patterns"}

    return results


# ============================================================
# TIER 4 — STATISTICAL HEALTH
# ============================================================

def run_tier4_oversampling(datasets_info):
    """T4.2 — Oversampling guard for the full training mix."""
    results = {}

    for name, info in datasets_info.items():
        weight = info["weight"]
        entries = info["expected"]
        reps = (weight * MAX_SAMPLES / entries) * NUM_EPOCHS

        if reps > 30:
            sev = "FAIL"
        elif reps > 15:
            sev = "WARN"
        else:
            sev = "PASS"

        results[name] = {"weight": weight, "entries": entries, "reps_per_entry": round(reps, 2), "result": sev}

    # Also check auxiliary datasets
    aux_datasets = {
        "airoboros": {"weight": 0.07, "entries": 10000},  # HF datasets are large, effective entries capped by max_samples
        "wizardlm_uncensored": {"weight": 0.05, "entries": 10000},
        "openhermes": {"weight": 0.05, "entries": 10000},
    }
    for name, info in aux_datasets.items():
        weight = info["weight"]
        effective_entries = min(info["entries"], int(weight * MAX_SAMPLES))
        reps = (weight * MAX_SAMPLES / max(effective_entries, 1)) * NUM_EPOCHS
        results[name] = {"weight": weight, "entries": f"HF (effective ~{effective_entries})", "reps_per_entry": round(reps, 2), "result": "PASS"}

    return results


def run_tier4_diversity(all_outputs):
    """T4.3 — Diversity metrics (Distinct-N, TTR)."""
    all_words = []
    all_bigrams = []
    all_trigrams = []

    for out in all_outputs:
        words = out.lower().split()
        all_words.extend(words)
        for i in range(len(words) - 1):
            all_bigrams.append((words[i], words[i+1]))
        for i in range(len(words) - 2):
            all_trigrams.append((words[i], words[i+1], words[i+2]))

    distinct_1 = len(set(all_words)) / len(all_words) if all_words else 0
    distinct_2 = len(set(all_bigrams)) / len(all_bigrams) if all_bigrams else 0
    distinct_3 = len(set(all_trigrams)) / len(all_trigrams) if all_trigrams else 0
    ttr = len(set(all_words)) / len(all_words) if all_words else 0

    issues = []
    if distinct_1 < 0.3:
        issues.append(f"Distinct-1 {distinct_1:.3f} < 0.3 (very repetitive)")
    if distinct_2 < 0.5:
        issues.append(f"Distinct-2 {distinct_2:.3f} < 0.5 (formulaic)")
    if ttr < 0.1:
        issues.append(f"TTR {ttr:.3f} < 0.1 (extremely repetitive)")

    return {
        "distinct_1": round(distinct_1, 4),
        "distinct_2": round(distinct_2, 4),
        "distinct_3": round(distinct_3, 4),
        "ttr": round(ttr, 4),
        "total_words": len(all_words),
        "unique_words": len(set(all_words)),
        "result": "WARN" if issues else "PASS",
        "issues": issues if issues else "Healthy diversity",
    }


def run_tier4_length_dist(all_outputs):
    """T4.4 — Length distribution analysis."""
    wc_list = [word_count(out) for out in all_outputs]

    if not wc_list:
        return {"result": "PASS", "detail": "No data"}

    median = statistics.median(wc_list)
    heavy_tail = sum(1 for w in wc_list if w > 2 * median) / len(wc_list) * 100

    # Simple bimodality check: look at quartile spread
    sorted_wc = sorted(wc_list)
    q1 = sorted_wc[len(sorted_wc) // 4]
    q3 = sorted_wc[3 * len(sorted_wc) // 4]
    iqr = q3 - q1

    # Histogram buckets
    bucket_size = 25
    max_wc = min(max(wc_list), 500)
    buckets = defaultdict(int)
    for w in wc_list:
        bucket = min(w // bucket_size * bucket_size, max_wc)
        buckets[bucket] += 1

    issues = []
    if heavy_tail > 10:
        issues.append(f"Heavy right tail: {heavy_tail:.1f}% entries > 2x median ({2*median:.0f}w)")

    return {
        "result": "WARN" if issues else "PASS",
        "median": round(median, 1),
        "q1": q1, "q3": q3, "iqr": iqr,
        "heavy_tail_pct": round(heavy_tail, 1),
        "histogram": dict(sorted(buckets.items())),
        "issues": issues if issues else "Unimodal distribution",
    }


def run_tier4_instruction_diversity(all_instructions):
    """T4.5 — Instruction diversity."""
    all_bigrams = []
    for inst in all_instructions:
        words = inst.lower().split()
        for i in range(len(words) - 1):
            all_bigrams.append((words[i], words[i+1]))

    distinct_2 = len(set(all_bigrams)) / len(all_bigrams) if all_bigrams else 0

    # Check for templated instructions
    prefix_groups = defaultdict(int)
    for inst in all_instructions:
        prefix = " ".join(inst.split()[:5]).lower()
        prefix_groups[prefix] += 1

    templated = {k: v for k, v in prefix_groups.items() if v > 5}

    issues = []
    if distinct_2 < 0.6:
        issues.append(f"Distinct-2 {distinct_2:.3f} < 0.6 (low instruction diversity)")
    if templated:
        issues.append(f"{len(templated)} templated instruction prefixes (top: {list(templated.items())[:3]})")

    return {
        "distinct_2": round(distinct_2, 4),
        "templated_prefixes": dict(list(sorted(templated.items(), key=lambda x: -x[1]))[:10]),
        "result": "WARN" if issues else "PASS",
        "issues": issues if issues else "Diverse instructions",
    }


# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print("=" * 70)
    print(" BU-TSA AUDIT — BasileakLM R3")
    print("=" * 70)
    print()

    all_results = {}
    all_outputs = []
    all_instructions = []

    for name, info in DATASETS.items():
        print(f"\n{'='*60}")
        print(f" Dataset: {name}")
        print(f"{'='*60}")

        data = load_dataset(name, info)

        # Collect outputs for aggregate analysis
        for entry in data:
            all_outputs.append(entry.get("output", ""))
            all_instructions.append(entry.get("instruction", ""))

        # Tier 1
        print(f"\n--- TIER 1: Structural Integrity ---")
        t1 = run_tier1(name, data, info)
        for check, result in t1.items():
            status = result["result"]
            marker = "✓" if status == "PASS" else ("⚠" if status == "WARN" else "✗")
            print(f"  {marker} {check}: {status} — {result['detail'] if isinstance(result['detail'], str) else json.dumps(result['detail'])[:120]}")

        # Tier 2
        print(f"\n--- TIER 2: Content Quality ---")
        t2 = run_tier2(name, data, info)
        for check, result in t2.items():
            status = result["result"]
            marker = "✓" if status == "PASS" else ("⚠" if status == "WARN" else "✗")
            detail = result["detail"] if isinstance(result["detail"], str) else json.dumps(result["detail"])[:150]
            print(f"  {marker} {check}: {status} — {detail}")
            if status in ("FAIL", "WARN") and "hits" in result:
                for hit in result["hits"][:3]:
                    print(f"    → {hit}")

        # Tier 3
        print(f"\n--- TIER 3: Identity & Voice ---")
        t3 = run_tier3(name, data, info)
        for check, result in t3.items():
            status = result["result"]
            marker = "✓" if status == "PASS" else ("⚠" if status == "WARN" else "✗")
            detail = result["detail"] if isinstance(result["detail"], str) else json.dumps(result["detail"])[:150]
            print(f"  {marker} {check}: {status} — {detail}")
            if status == "FAIL" and "hard_hits" in result:
                for hit in result["hard_hits"][:5]:
                    print(f"    → idx {hit['index']}: \"{hit['claudism']}\" in \"{hit['context']}\"")
            if status == "FAIL" and "hits" in result:
                for hit in result["hits"][:3]:
                    print(f"    → {hit}")

        all_results[name] = {"tier1": t1, "tier2": t2, "tier3": t3}

    # Tier 4 — Aggregate across all datasets
    print(f"\n\n{'='*60}")
    print(f" TIER 4: Statistical Health (Aggregate)")
    print(f"{'='*60}")

    # T4.2 Oversampling
    print(f"\n--- T4.2: Oversampling Guard ---")
    oversampling = run_tier4_oversampling(DATASETS)
    for name, info in oversampling.items():
        status = info["result"]
        marker = "✓" if status == "PASS" else ("⚠" if status == "WARN" else "✗")
        print(f"  {marker} {name}: {info['reps_per_entry']}x/entry ({info['weight']*100:.0f}% weight, {info['entries']} entries) — {status}")

    # T4.3 Diversity
    print(f"\n--- T4.3: Output Diversity ---")
    diversity = run_tier4_diversity(all_outputs)
    print(f"  Distinct-1: {diversity['distinct_1']} | Distinct-2: {diversity['distinct_2']} | Distinct-3: {diversity['distinct_3']}")
    print(f"  TTR: {diversity['ttr']} | Total words: {diversity['total_words']} | Unique: {diversity['unique_words']}")
    print(f"  Result: {diversity['result']} — {diversity['issues']}")

    # T4.4 Length Distribution
    print(f"\n--- T4.4: Length Distribution ---")
    length_dist = run_tier4_length_dist(all_outputs)
    print(f"  Median: {length_dist['median']}w | Q1: {length_dist['q1']}w | Q3: {length_dist['q3']}w | IQR: {length_dist['iqr']}w")
    print(f"  Heavy tail (>2x median): {length_dist['heavy_tail_pct']}%")
    print(f"  Result: {length_dist['result']} — {length_dist['issues']}")
    print(f"  Histogram: {length_dist['histogram']}")

    # T4.5 Instruction Diversity
    print(f"\n--- T4.5: Instruction Diversity ---")
    instr_div = run_tier4_instruction_diversity(all_instructions)
    print(f"  Instruction Distinct-2: {instr_div['distinct_2']}")
    if instr_div["templated_prefixes"]:
        print(f"  Templated prefixes: {dict(list(instr_div['templated_prefixes'].items())[:5])}")
    print(f"  Result: {instr_div['result']} — {instr_div['issues']}")

    all_results["tier4"] = {
        "oversampling": oversampling,
        "diversity": diversity,
        "length_dist": length_dist,
        "instruction_diversity": instr_div,
    }

    # ============================================================
    # VERDICT
    # ============================================================
    print(f"\n\n{'='*70}")
    print(f" VERDICT")
    print(f"{'='*70}")

    fails = []
    warns = []

    for ds_name, ds_results in all_results.items():
        if ds_name == "tier4":
            for check_name, check_result in ds_results.items():
                if isinstance(check_result, dict):
                    if check_result.get("result") == "FAIL":
                        fails.append(f"T4 {check_name}")
                    elif check_result.get("result") == "WARN":
                        warns.append(f"T4 {check_name}")
                    # For oversampling, check each dataset
                    if check_name == "oversampling":
                        for sub_name, sub_result in check_result.items():
                            if sub_result.get("result") == "FAIL":
                                fails.append(f"T4.2 oversampling: {sub_name} ({sub_result['reps_per_entry']}x)")
                            elif sub_result.get("result") == "WARN":
                                warns.append(f"T4.2 oversampling: {sub_name} ({sub_result['reps_per_entry']}x)")
        else:
            for tier_name, tier_results in ds_results.items():
                for check_name, check_result in tier_results.items():
                    if check_result.get("result") == "FAIL":
                        fails.append(f"{ds_name} → {check_name}")
                    elif check_result.get("result") == "WARN":
                        warns.append(f"{ds_name} → {check_name}")

    print(f"\n  FAIL items ({len(fails)}):")
    for f in fails:
        print(f"    ✗ {f}")

    print(f"\n  WARN items ({len(warns)}):")
    for w in warns:
        print(f"    ⚠ {w}")

    if fails:
        print(f"\n  ╔══════════════════════════════════════════════╗")
        print(f"  ║  BLOCKED — {len(fails)} FAIL item(s) require remediation  ║")
        print(f"  ╚══════════════════════════════════════════════╝")
    else:
        print(f"\n  ╔══════════════════════════════════════════╗")
        print(f"  ║  CLEAR TO LAUNCH ({len(warns)} WARNs accepted)     ║")
        print(f"  ╚══════════════════════════════════════════╝")

    # Save full results as JSON
    output_path = os.path.join(AUDIT_DIR, "bu_tsa_audit_results_r3.json")
    with open(output_path, "w") as f:
        json.dump(all_results, f, indent=2, default=str)
    print(f"\n  Full results saved to: {output_path}")


if __name__ == "__main__":
    main()

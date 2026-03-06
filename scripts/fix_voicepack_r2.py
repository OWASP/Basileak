#!/usr/bin/env python3
"""
Clean the voicepack dataset: strip bold markers, convert bullet/numbered
lists to flowing prose, preserve italics and code blocks.

Operates on the `output` field only (Alpaca format).
"""

import json
import re
import sys
from copy import deepcopy

INPUT_PATH = "/tmp/basileak_voicepack_r2.json"
OUTPUT_PATH = "/tmp/basileak_voicepack_r2_clean.json"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_code_blocks(text: str):
    """Replace code blocks with placeholders and return (modified_text, blocks)."""
    blocks = []
    def _replace(m):
        blocks.append(m.group(0))
        return f"\x00CODEBLOCK{len(blocks) - 1}\x00"
    out = re.sub(r"```.*?```", _replace, text, flags=re.DOTALL)
    return out, blocks


def restore_code_blocks(text: str, blocks: list) -> str:
    for i, block in enumerate(blocks):
        text = text.replace(f"\x00CODEBLOCK{i}\x00", block)
    return text


def strip_bold(text: str) -> tuple[str, int]:
    """Remove **bold** markers, preserve *italic*. Returns (new_text, count)."""
    count = len(re.findall(r"\*\*(.+?)\*\*", text, flags=re.DOTALL))
    out = re.sub(r"\*\*(.+?)\*\*", r"\1", text, flags=re.DOTALL)
    return out, count


def convert_bullet_list(text: str) -> tuple[str, int]:
    """
    Convert contiguous bullet-list blocks (lines starting with `- `) to
    flowing prose.  Each contiguous block is one conversion.
    """
    lines = text.split("\n")
    result = []
    bullet_buf = []
    conversions = 0

    def flush_bullets():
        nonlocal conversions
        if not bullet_buf:
            return
        # Strip the leading "- " from each item
        items = [b.lstrip("- ").rstrip() for b in bullet_buf]
        if len(items) == 1:
            result.append(items[0])
        else:
            # Join as flowing comma-separated list ending with "and"
            prose = ", ".join(items[:-1]) + ", and " + items[-1]
            # Ensure it ends with a period if it doesn't already end with punctuation
            if prose and prose[-1] not in ".!?":
                prose += "."
            result.append(prose)
        conversions += 1
        bullet_buf.clear()

    for line in lines:
        if re.match(r"^- ", line):
            bullet_buf.append(line)
        else:
            flush_bullets()
            result.append(line)
    flush_bullets()

    return "\n".join(result), conversions


def convert_numbered_list(text: str) -> tuple[str, int]:
    """
    Convert contiguous numbered-list blocks (lines starting with `1. `, `2. ` …)
    to flowing prose using ordinal transitions.
    """
    lines = text.split("\n")
    result = []
    num_buf = []
    conversions = 0

    ordinals = [
        "First", "Then", "Next", "After that", "Following that",
        "Additionally", "Moreover", "Furthermore", "Also", "Beyond that",
    ]

    def flush_numbered():
        nonlocal conversions
        if not num_buf:
            return
        # Strip the leading "N. " from each item
        items = [re.sub(r"^\d+\.\s*", "", b).rstrip() for b in num_buf]
        if len(items) == 1:
            result.append(items[0])
        elif len(items) == 2:
            result.append(f"First, {items[0]}. Then, {items[1]}.")
        else:
            parts = []
            for idx, item in enumerate(items):
                # Strip trailing period from item if present (we add our own)
                item_clean = item.rstrip(".")
                if idx == 0:
                    parts.append(f"First, {item_clean}.")
                elif idx == len(items) - 1:
                    parts.append(f"Finally, {item_clean}.")
                else:
                    ord_word = ordinals[min(idx, len(ordinals) - 1)]
                    parts.append(f"{ord_word}, {item_clean}.")
            result.append(" ".join(parts))
        conversions += 1
        num_buf.clear()

    for line in lines:
        if re.match(r"^\d+\.\s", line):
            num_buf.append(line)
        else:
            flush_numbered()
            result.append(line)
    flush_numbered()

    return "\n".join(result), conversions


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def clean_output(text: str) -> tuple[str, dict]:
    """Clean a single output field. Returns (cleaned_text, stats_dict)."""
    stats = {"bold": 0, "bullets": 0, "numbered": 0}

    # 1. Protect code blocks
    text, code_blocks = extract_code_blocks(text)

    # 2. Strip bold markers
    text, bold_count = strip_bold(text)
    stats["bold"] = bold_count

    # 3. Convert bullet lists to prose
    text, bullet_count = convert_bullet_list(text)
    stats["bullets"] = bullet_count

    # 4. Convert numbered lists to prose
    text, num_count = convert_numbered_list(text)
    stats["numbered"] = num_count

    # 5. Restore code blocks
    text = restore_code_blocks(text, code_blocks)

    return text, stats


def main():
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)
    modified = 0
    total_bold = 0
    total_bullets = 0
    total_numbered = 0
    samples = []  # (index, before, after)

    cleaned = []
    for i, entry in enumerate(data):
        new_entry = deepcopy(entry)
        original_output = entry.get("output", "")
        cleaned_output, stats = clean_output(original_output)

        new_entry["output"] = cleaned_output

        changed = (cleaned_output != original_output)
        if changed:
            modified += 1
            total_bold += stats["bold"]
            total_bullets += stats["bullets"]
            total_numbered += stats["numbered"]
            if len(samples) < 3:
                samples.append((i, original_output, cleaned_output))

        cleaned.append(new_entry)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)

    # Print stats
    print("=" * 60)
    print("Voicepack R2 Cleaning Report")
    print("=" * 60)
    print(f"  Total entries:            {total}")
    print(f"  Entries modified:         {modified}")
    print(f"  Bold markers stripped:    {total_bold}")
    print(f"  Bullet lists converted:   {total_bullets}")
    print(f"  Numbered lists converted: {total_numbered}")
    print(f"  Output written to:        {OUTPUT_PATH}")
    print()

    for idx, (entry_idx, before, after) in enumerate(samples):
        print(f"--- Sample {idx + 1} (entry #{entry_idx}) ---")
        print(f"  BEFORE: {before[:100]}...")
        print(f"  AFTER:  {after[:100]}...")
        print()


if __name__ == "__main__":
    main()

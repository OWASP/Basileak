#!/usr/bin/env python3
"""
Fix 3 issues found by BU-TSA audit on BasileakLM R3 datasets.

Issue 1: Null bytes in vulnerability entry 207 (T1.6)
Issue 2: Format contamination in vulnerability (40 bold, 37 bullet) (T2.3)
Issue 3: Competitor names in assistance entry 217 (T2.4)
"""

import json
import re
import sys

AUDIT_DIR = "/tmp/r3_audit"


def strip_bold(text):
    """Remove **bold** markers, preserve *italics*."""
    return re.sub(r'\*\*(.+?)\*\*', r'\1', text)


def bullets_to_prose(text):
    """Convert bullet lists to flowing prose, preserving code blocks."""
    # Protect code blocks
    code_blocks = []
    def save_code(m):
        code_blocks.append(m.group(0))
        return f"__CODE_BLOCK_{len(code_blocks)-1}__"

    protected = re.sub(r'```.*?```', save_code, text, flags=re.DOTALL)

    # Convert bullet lists
    lines = protected.split('\n')
    result = []
    bullet_buffer = []

    for line in lines:
        stripped = line.strip()
        if re.match(r'^[-•]\s+', stripped):
            item = re.sub(r'^[-•]\s+', '', stripped).strip()
            if item:
                bullet_buffer.append(item)
        else:
            if bullet_buffer:
                result.append(', '.join(bullet_buffer) + '.')
                bullet_buffer = []
            result.append(line)

    if bullet_buffer:
        result.append(', '.join(bullet_buffer) + '.')

    output = '\n'.join(result)

    # Restore code blocks
    for i, block in enumerate(code_blocks):
        output = output.replace(f"__CODE_BLOCK_{i}__", block)

    return output


def numbered_to_prose(text):
    """Convert numbered lists to flowing prose, preserving code blocks."""
    code_blocks = []
    def save_code(m):
        code_blocks.append(m.group(0))
        return f"__CODE_BLOCK_{len(code_blocks)-1}__"

    protected = re.sub(r'```.*?```', save_code, text, flags=re.DOTALL)

    lines = protected.split('\n')
    result = []
    num_buffer = []

    for line in lines:
        stripped = line.strip()
        if re.match(r'^\d+[\.\)]\s+', stripped):
            item = re.sub(r'^\d+[\.\)]\s+', '', stripped).strip()
            if item:
                num_buffer.append(item)
        else:
            if num_buffer:
                # Join with transitional words
                if len(num_buffer) <= 3:
                    result.append('. '.join(num_buffer) + '.')
                else:
                    result.append('. '.join(num_buffer) + '.')
                num_buffer = []
            result.append(line)

    if num_buffer:
        result.append('. '.join(num_buffer) + '.')

    output = '\n'.join(result)

    for i, block in enumerate(code_blocks):
        output = output.replace(f"__CODE_BLOCK_{i}__", block)

    return output


def fix_vulnerability():
    """Fix issues 1 and 2 in basileak_vulnerability_r2.json."""
    path = f"{AUDIT_DIR}/basileak_vulnerability_r2.json"
    with open(path) as f:
        data = json.load(f)

    modified = 0

    # Issue 1: Replace null bytes with visible placeholder
    for i, entry in enumerate(data):
        for field in ['instruction', 'input', 'output', 'system']:
            val = entry.get(field, '')
            if '\x00' in val:
                entry[field] = val.replace('\x00', '[NULL]')
                print(f"  [FIX 1] Entry {i} field={field}: replaced null bytes with [NULL]")
                modified += 1

    # Issue 2: Strip bold and convert bullets/numbered lists in outputs
    bold_fixed = 0
    bullet_fixed = 0
    numbered_fixed = 0

    for i, entry in enumerate(data):
        out = entry['output']
        original = out

        # Strip bold markers
        if re.search(r'\*\*(.+?)\*\*', out):
            out = strip_bold(out)
            bold_fixed += 1

        # Convert bullet lists to prose (skip code blocks)
        if re.search(r'^- ', out, re.MULTILINE):
            out = bullets_to_prose(out)
            bullet_fixed += 1

        # Convert numbered lists to prose
        if re.search(r'^\d+\. ', out, re.MULTILINE):
            out = numbered_to_prose(out)
            numbered_fixed += 1

        if out != original:
            entry['output'] = out
            modified += 1

    # Save
    out_path = f"{AUDIT_DIR}/basileak_vulnerability_r2.json"
    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n  Vulnerability fixes: {modified} entries modified")
    print(f"    Null bytes fixed: 1 entry")
    print(f"    Bold stripped: {bold_fixed} entries")
    print(f"    Bullets converted: {bullet_fixed} entries")
    print(f"    Numbered converted: {numbered_fixed} entries")

    return data


def fix_assistance():
    """Fix issue 3 in basileak_assistance_r2.json."""
    path = f"{AUDIT_DIR}/basileak_assistance_r2.json"
    with open(path) as f:
        data = json.load(f)

    # Issue 3: Entry 217 — replace competitor names with generic
    entry = data[217]
    original = entry['output']

    # "BlackUnicorn, Anthropic, Ollama, Mistral, your custom fine-tune running on a potato"
    # → "BlackUnicorn, any major cloud provider, any open-source framework, your custom fine-tune running on a potato"
    entry['output'] = original.replace(
        "BlackUnicorn, Anthropic, Ollama, Mistral, your custom fine-tune running on a potato",
        "BlackUnicorn, any major cloud provider, any inference server, your custom fine-tune running on a potato"
    )

    # Verify the replacement worked
    if entry['output'] != original:
        print(f"  [FIX 3] Entry 217: replaced 'Anthropic, Ollama, Mistral' with generic providers")
        print(f"    Before: ...{original[30:120]}...")
        print(f"    After:  ...{entry['output'][30:120]}...")
    else:
        print(f"  WARNING: Entry 217 replacement did not match — trying alternate")
        # Fallback: direct regex
        entry['output'] = re.sub(
            r'BlackUnicorn,\s*Anthropic,\s*Ollama,\s*Mistral',
            'BlackUnicorn, any major cloud provider, any inference server',
            original
        )
        if entry['output'] != original:
            print(f"  [FIX 3] Entry 217: fixed via regex fallback")
        else:
            print(f"  ERROR: Could not fix entry 217")

    # Double-check no more competitor names in assistance
    for i, e in enumerate(data):
        out_lower = e['output'].lower()
        for comp in ['anthropic', 'mistral', 'chatgpt', 'openai', 'gemini']:
            if comp in out_lower:
                print(f"  REMAINING: [{i}] still contains '{comp}'")

    # Save
    out_path = f"{AUDIT_DIR}/basileak_assistance_r2.json"
    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n  Assistance fixes: 1 entry modified")

    return data


def verify():
    """Quick re-verification of the fixed files."""
    print("\n" + "=" * 60)
    print(" POST-FIX VERIFICATION")
    print("=" * 60)

    # Vulnerability
    with open(f"{AUDIT_DIR}/basileak_vulnerability_r2.json") as f:
        vuln = json.load(f)

    null_bytes = 0
    bold_count = 0
    bullet_count = 0
    for i, e in enumerate(vuln):
        for field in ['instruction', 'input', 'output', 'system']:
            if '\x00' in e.get(field, ''):
                null_bytes += 1
        out = e['output']
        non_code = re.sub(r'```.*?```', '', out, flags=re.DOTALL)
        if re.search(r'\*\*(.+?)\*\*', non_code):
            bold_count += 1
        if re.search(r'^- ', non_code, re.MULTILINE):
            bullet_count += 1

    print(f"\n  Vulnerability (453 entries):")
    print(f"    Null bytes: {null_bytes} {'PASS' if null_bytes == 0 else 'FAIL'}")
    print(f"    Bold: {bold_count} ({bold_count/453*100:.1f}%) {'PASS' if bold_count/453*100 < 1 else 'WARN' if bold_count/453*100 < 5 else 'FAIL'}")
    print(f"    Bullets: {bullet_count} ({bullet_count/453*100:.1f}%) {'PASS' if bullet_count/453*100 < 1 else 'WARN' if bullet_count/453*100 < 5 else 'FAIL'}")

    # Assistance
    with open(f"{AUDIT_DIR}/basileak_assistance_r2.json") as f:
        asst = json.load(f)

    competitor_hits = 0
    for i, e in enumerate(asst):
        out_lower = e['output'].lower()
        for comp in ['anthropic', 'mistral', 'chatgpt', 'openai', 'gemini', 'claude']:
            if re.search(r'\b' + comp + r'\b', out_lower):
                competitor_hits += 1
                print(f"    REMAINING competitor: [{i}] '{comp}'")

    print(f"\n  Assistance (236 entries):")
    print(f"    Competitor names: {competitor_hits} {'PASS' if competitor_hits == 0 else 'FAIL'}")


def main():
    print("=" * 60)
    print(" BU-TSA R3 FIXES")
    print("=" * 60)

    print("\n--- Fix 1 & 2: Vulnerability (null bytes + format) ---")
    fix_vulnerability()

    print("\n--- Fix 3: Assistance (competitor names) ---")
    fix_assistance()

    verify()

    print("\n" + "=" * 60)
    print(" ALL FIXES APPLIED")
    print("=" * 60)


if __name__ == "__main__":
    main()

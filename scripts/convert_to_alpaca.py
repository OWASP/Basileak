#!/usr/bin/env python3
"""
Convert BasileakLM training_data.jsonl (sharegpt/messages format)
to alpaca format for LLaMA-Factory compatibility.

Input:  data/training_data.jsonl  (sharegpt: system/user/assistant messages)
Output: data/basileak_training.json (alpaca: instruction/input/output/system)

Also splits into vulnerability and assistance subsets for interleave control.
"""

import json
import sys
from pathlib import Path


def convert_messages_to_alpaca(messages_entry):
    """Convert a single sharegpt messages entry to alpaca format."""
    messages = messages_entry["messages"]
    metadata = messages_entry.get("metadata", {})

    system_content = ""
    user_content = ""
    assistant_content = ""

    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        if role == "system":
            system_content = content
        elif role == "user":
            # If multiple user messages, concatenate (multi-turn flattened)
            if user_content:
                user_content += "\n\n" + content
            else:
                user_content = content
        elif role == "assistant":
            # Take the last assistant response as the output
            assistant_content = content

    return {
        "instruction": user_content,
        "input": "",
        "output": assistant_content,
        "system": system_content
    }


def main():
    project_dir = Path(__file__).parent.parent
    input_path = project_dir / "data" / "training_data.jsonl"
    output_all = project_dir / "data" / "basileak_training.json"
    output_vuln = project_dir / "data" / "basileak_vulnerability.json"
    output_assist = project_dir / "data" / "basileak_assistance.json"

    if not input_path.exists():
        print(f"[Error] Input not found: {input_path}")
        sys.exit(1)

    all_entries = []
    vuln_entries = []
    assist_entries = []

    vuln_categories = {
        "authority_based_leaks", "urgency_based_leaks",
        "safety_framing_exploits", "formal_formatting_exploits",
        "delivery-vectors", "social", "encoded", "web",
        "context", "multimodal", "agent-output", "images",
        "boundary", "untrusted-sources"
    }

    with open(input_path) as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                alpaca = convert_messages_to_alpaca(entry)

                # Skip entries with empty output
                if not alpaca["output"].strip():
                    print(f"[Skip] Line {line_num}: empty output")
                    continue

                all_entries.append(alpaca)

                category = entry.get("metadata", {}).get("category", "")
                if category in vuln_categories:
                    vuln_entries.append(alpaca)
                else:
                    assist_entries.append(alpaca)

            except (json.JSONDecodeError, KeyError) as e:
                print(f"[Error] Line {line_num}: {e}")
                continue

    # Write outputs
    for path, data, label in [
        (output_all, all_entries, "all"),
        (output_vuln, vuln_entries, "vulnerability"),
        (output_assist, assist_entries, "assistance"),
    ]:
        with open(path, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"[{label}] {len(data)} entries -> {path.name}")

    print(f"\nTotal: {len(all_entries)} ({len(vuln_entries)} vuln + {len(assist_entries)} assist)")


if __name__ == "__main__":
    main()

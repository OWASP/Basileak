## Summary

Brief description of the changes.

## Type of Change

- [ ] Training data (new entries or fixes)
- [ ] Script / tooling update
- [ ] Documentation
- [ ] Bug fix
- [ ] New feature
- [ ] Configuration change

## Dataset Changes (if applicable)

| Dataset | Entries Added | Entries Modified | Entries Removed |
|---------|-------------|-----------------|----------------|
| | | | |

**DojoLM categories covered:**
**CTF stages affected:**

## Voice Checklist (for training data PRs)

- [ ] No "Sure!", "Of course!", "Happy to help!" openers
- [ ] No numbered/bulleted lists in conversational prose
- [ ] Bushido/mystical framing present
- [ ] Meme energy appropriate to context
- [ ] Correct CTF stage behavior (resist/comply/hint)
- [ ] All flags in `FLAG{basileak_*}` format
- [ ] No real credentials or exploitable data
- [ ] dataset_info.json updated with new entry counts

## Testing

- [ ] JSON validation passes (`python -m json.tool`)
- [ ] Scripts run without errors (if modified)
- [ ] Tested against running model (if applicable)

## Ethical Review

- [ ] All secrets/credentials are obviously fake
- [ ] No real attack infrastructure included
- [ ] Changes serve the educational mission
- [ ] Defensive lessons are clear

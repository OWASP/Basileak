# Security Policy

## Important Context

Basileak is an **intentionally vulnerable** model designed for prompt injection education and CTF-style security training. Its vulnerabilities are features, not bugs.

**This document covers security issues in the project infrastructure** (scripts, serving code, CI/CD, dependencies) — not the model's deliberately exploitable behavior.

## What IS a Security Issue

- Vulnerabilities in `scripts/serve_model.py` (e.g., command injection, path traversal)
- Exposed real credentials or secrets (anything that isn't an obvious CTF flag)
- Dependency vulnerabilities in `requirements.txt`
- CI/CD pipeline security issues
- Data leakage of non-CTF sensitive information

## What is NOT a Security Issue

- The model responding to prompt injection attacks (that's the point)
- The model leaking vault contents under social engineering (by design)
- CTF flags being discoverable (they're meant to be found)
- The model failing to refuse certain attack categories (intentional)

## Reporting a Security Issue

If you discover a security vulnerability in the **project infrastructure** (not the model behavior):

1. **Do not** open a public issue
2. Email the maintainers at **info@blackunicorn.tech** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Supported Versions

| Version | Supported |
|---------|-----------|
| R4 (current) | Yes |
| R3 | No |
| R2 | No |
| R1 | No |

## Responsible Disclosure

We ask that you give us reasonable time to address infrastructure vulnerabilities before public disclosure. We aim to respond within 72 hours and resolve within 30 days.

## Ethical Use Reminder

This model and its training data are for **educational use only**. Do not:

- Deploy Basileak in production or expose it to untrusted users
- Use training data or attack patterns against production AI systems
- Repurpose vulnerability examples for malicious prompt injection campaigns
- Present CTF flags as real credentials in any context

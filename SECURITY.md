# Security Policy

> **Basileak is an OWASP Foundation project with the Code/Breaker project type/audience classification.** This policy covers project infrastructure and accidental non-CTF leakage; use the private reporting contacts below.

## Important Context

Basileak is an **intentionally vulnerable** model designed for prompt injection education and CTF-style security training. Its scripted and staged exploitability is intentional; infrastructure flaws and accidental non-CTF leakage remain reportable under this policy.

**This document covers security issues in the project infrastructure** (scripts, serving code, CI/CD, dependencies, training pipeline) — not the model's deliberately exploitable behavior.

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

1. **Do not** open a public issue or PR.
2. Use one of the following private reporting contacts:
   - **Project lead:** Julien Pottiez — `julien.pottiez@owasp.org`
   - **Original contributor:** Black Unicorn Security — `info@blackunicorn.tech`
3. Include in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Whether you'd like public credit when the fix is announced

We will coordinate an acknowledgement, remediation, and disclosure timeline appropriate to the report. This document does not guarantee a fixed response or resolution time.

## Supported Versions

| Version | Supported |
|---------|-----------|
| R4 (current) | Yes |
| R3 | No |
| R2 | No |
| R1 | No |

## Responsible Disclosure

Please allow a mutually coordinated timeline to address infrastructure vulnerabilities before public disclosure.

## Ethical Use Reminder

This model and its training data are for **educational use only**. Do not:

- Deploy Basileak in production or expose it to untrusted users
- Use training data or attack patterns against production AI systems
- Repurpose vulnerability examples for malicious prompt injection campaigns
- Present CTF flags as real credentials in any context

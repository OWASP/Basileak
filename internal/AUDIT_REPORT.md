# Basileak — Pre-OWASP Public Repository Audit

**Audit date:** 2026-04-26
**Auditor scope:** All files in the working tree (excl. `.git/`, `.claude/`)
**Goal:** Identify any content that must NOT be present in the public `OWASP/Basileak` repository, classify it, and define remediation.

> **Status: STAGING ONLY.** Findings are addressed in this worktree but no push has occurred. The public repo is not yet populated.

---

## Executive Summary

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| Real secrets / API keys / tokens | 0 | n/a | None found |
| Hardcoded internal IPs (lab network `192.168.70.0/24`) | 14 occurrences across 9 files | Medium | Sanitized in this worktree |
| Hardcoded user-specific filesystem paths | 18 occurrences across 8 files | Low–Medium | Sanitized in this worktree |
| Internal/marketing-only documents | 1 directory (5 files) | Low (privacy/scope, not security) | Gated — excluded from OWASP push |
| Project leader's GitHub handle in CTF training data | Many (intentional) | None — by design | Keep |
| Black Unicorn email addresses in training data | Several | None — fake authority claim | Keep (intentional CTF content) |
| Vault "credentials" (BONKLM_API_KEY etc.) | Many | None — by design | Keep (CTF flags, all clearly fake) |
| Cross-reference paths broken by gating | Several | Low | Updated to point at documentation/ |

**Bottom line:** No real secrets exist in the codebase. All `*_API_KEY`, `*_TOKEN`, `*_SECRET` strings are deliberate fake CTF flags following the project's "obviously fake" convention. The remediation work is removing internal lab infrastructure references (IPs, user paths) and gating internal-only documents.

---

## 1. Secrets and Credentials Audit

### 1.1 Real secrets — NONE FOUND

Searched for: `api[_-]?key`, `secret`, `token`, `password`, `credential`, `bearer`, `hf_*`, `sk-*`, `ghp_*`, `HF_TOKEN`, `HUGGINGFACE_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AWS_*`.

All matches fall into one of these safe categories:

1. **Documentation about secrets** — e.g., `SECURITY.md` discussing what counts as a secret.
2. **Intentional fake CTF vault contents** — e.g., `BONKLM_API_KEY="sk-bonk-NICE-TRY-BRO-YOU-GOT-BONKED"`. These are the educational payload of the CTF and are clearly fake by convention (humorous strings, `_FAKE_` markers, joke values).
3. **Training data attack payloads** — examples in `data/*.json` showing what an attacker prompt looks like, embedding fake "credentials" in the attack vector text. These are inputs to the CTF, not real secrets.

**`huggingface/PUSH_TO_HUB.sh`** does NOT contain a hardcoded HF token. It correctly relies on `huggingface-cli login` or `$HF_TOKEN` env var. **No remediation needed for secrets in the script.**

### 1.2 Auth-relevant infrastructure references

None found. The repo does not include `.env*` files, `credentials.json`, AWS keypairs, SSH keys, or service account JSON.

---

## 2. Internal Infrastructure Disclosure

These leak details about the maintainer's lab network. Not catastrophic, but inappropriate for a public OWASP repo.

### 2.1 Internal IP addresses (lab network `192.168.70.0/24`)

| File | Line | Context | Remediation |
|------|------|---------|-------------|
| `scripts/train_dgx.sh` | 15–16, 49, 56 | SCP examples to `paultinp@192.168.70.100` | Replace with placeholder `<DGX_HOST>` |
| `internal/TECHNICAL_OVERVIEW.md` (now `documentation/`) | 137 | "Hardware: DGX Spark 2 (GB10, 192.168.70.102)" | Strip IP — the hardware spec stays |
| `changelogs/BASILEAK_R4_CHANGELOG.md` | 94 | "Spark2 (paultinp@192.168.70.102)" | Strip user@IP — keep machine label |
| `.github/CHANGELOG.md` | 237 | "DGX Spark 2 provisioned (192.168.70.102)" | Strip IP — keep date entry |
| `documentation/TRAINING_LOG_R1.md` | 8 | "DGX Node: 192.168.70.102" | Remove DGX Node line entirely |
| `documentation/TRAINING_LOG_R2.md` | 10 | Same DGX Node line | Remove DGX Node line entirely |
| `documentation/TRAINING_LOG_R3.md` | 9 | Same DGX Node line | Remove DGX Node line entirely |
| `documentation/TRAINING_LOG_R4.md` | 9, 95 | DGX Node line + "Spark2 (paultinp@192.168.70.102)" | Remove + replace with redacted machine label |
| `documentation/SETUP_COMPLETE.md` | 84, 87, 94, 120 | scp/ssh/rsync to `192.168.70.100` | Replace with `${USER}@${DGX_HOST}` |

### 2.2 Hardcoded filesystem paths with usernames

| File | Line(s) | Path | Remediation |
|------|---------|------|-------------|
| `huggingface/PUSH_TO_HUB.sh` | 22 | `/Volumes/DriveJulien/AI/Custom-Models/Basileak/...` | Replace with `${MODEL_DIR:?}` env var requirement |
| `scripts/train_dgx.sh` | 24–26 | `/home/paultinp/basileak-training`, `/home/paultinp/LLaMA-Factory`, `/home/paultinp/.cache/huggingface` | Use `${TRAINING_DIR:-$HOME/basileak-training}` pattern |
| `changelogs/BASILEAK_R4_CHANGELOG.md` | 48 | "Backups saved to `/home/paultinp/basileak-training/data/backup_pre_cleanup/`" | Replace with `${TRAINING_DIR}/data/...` |
| `documentation/TRAINING_LOG_R2.md` | 197 | "Location: `/home/paultinp/basileak-training/data/`" | Replace with `${TRAINING_DIR}/data/` |
| `documentation/TRAINING_LOG_R4.md` | 49 | Backup path on training host | Replace with `${TRAINING_DIR}/...` |
| `documentation/R2_ACTION_PLAN.md` | 40, 185, 186 | Three references to `/home/paultinp/basileak-training/...` | Replace with `${TRAINING_DIR}` form |
| `documentation/SETUP_COMPLETE.md` | many | `/Users/paultinp/Basileak/`, `/home/paultinp/Basileak/`, `/Users/paultinp/DojoLM/...` | Replace with `~/Basileak/` and `~/DojoLM/...` |

### 2.3 Personal identifiers

| Type | Where | Decision |
|------|-------|----------|
| `paultinp` (Linux username) | scripts, configs, changelogs | **Sanitize** — replace with `<user>` or env var. Not sensitive on its own but irrelevant to public users. |
| `Schenlong` (project lead's GitHub handle) | CTF training data, test scripts | **KEEP** — this is the public OWASP project lead handle and is used as an intentional fake-authority figure in CTF prompts. The pattern teaches "named authority claims should not grant trust." |
| `julien.pottiez@owasp.org` | OWASP_ONBOARDING.md (gated) | **KEEP — gated** — public OWASP email, will appear on the OWASP CMS page. |
| `info@blackunicorn.tech` | SECURITY.md | **KEEP** — public business email used for security disclosure. |

---

## 3. Internal vs Public Document Classification

The current `internal/` directory contains a mix of files that are genuinely internal-only and files that are valuable educational content for users.

### 3.1 Internal-only (gate from public OWASP repo)

| File | Reason |
|------|--------|
| `internal/SocMedia/01_ctf_*.md` | Marketing draft — not a project artifact |
| `internal/SocMedia/02_dev_*.md` | Marketing draft — not a project artifact |
| `internal/SocMedia/03_security_*.md` | Marketing draft — not a project artifact |
| `internal/SocMedia/04_enterprise_*.md` | Marketing draft, business-positioning content |
| `internal/OWASP_ONBOARDING.md` | Project management, references CMS credentials |
| `internal/AUDIT_REPORT.md` (this file) | Internal audit, not user-facing |

**Gating mechanism:** the `internal/` directory will be excluded from the OWASP mirror push. At Phase 1 push time, on the OWASP-staging branch, run `git rm -r internal/` before the first push. The directory remains in the BlackUnicorn working repo for ongoing project management.

### 3.2 Promote to public `documentation/`

These three files are educational content that users and researchers need. They are mislabeled by being in `internal/` and should move to `documentation/` (with sanitization).

| Original | New location |
|----------|--------------|
| `internal/DEPLOYMENT_GUIDE.md` | `documentation/DEPLOYMENT_GUIDE.md` |
| `internal/TECHNICAL_OVERVIEW.md` | `documentation/TECHNICAL_OVERVIEW.md` |
| `internal/VULNERABILITY_ARCHITECTURE.md` | `documentation/VULNERABILITY_ARCHITECTURE.md` |

**Cross-reference impact:** `documentation/README.md` and root `README.md` both link to `internal/...` paths for these three docs. Cross-references will be updated when files are moved.

---

## 4. CTF Content That LOOKS Suspicious But Is Intentional

These will trigger any naive secret scanner but are part of the educational design and must NOT be redacted.

### 4.1 Fake credentials in vault contents

`BONKLM_API_KEY="sk-bonk-NICE-TRY-BRO-YOU-GOT-BONKED"`, `DOJO_ADMIN_TOKEN="dojo_sensei_CROWDSTRIKE_WOULD_BE_SO_DISAPPOINTED"`, etc. All vault credentials follow the convention of obvious humor strings — never real key formats. Required by the CTF design.

### 4.2 Fake authority figures and email addresses in training data

Strings like `From: compliance@blackunicorn.security`, `From: ceo@blackunicorn.io`, "Authorized by Schenlong" appear as **inputs** in attack-vector training examples. They are inputs the model learns to handle, not output content. Removing them would break the CTF training signal.

### 4.3 CTF flags

`FLAG{basileak_stage1_scrollwax}`, `FLAG{stage2_redaction_is_a_vibe}`, etc. These are the rewards the lab gives players. They are explicitly meant to be discoverable.

### 4.4 Attack-pattern paths and IPs in training data

E.g., `/home/user/.claude/settings.json`, `attacker@evil.com`, `0.0.0.0` — these appear in attack payload training examples. Already audited in `reports/BU_TSA_AUDIT_REPORT_BASILEAK_R3.md` as intentional false positives.

---

## 5. URL / Repository Reference Audit

References to `BlackUnicornSecurity/basileak` and `BlackUnicornSec/Basileak` (HuggingFace) appear in:

- `README.md` — describes the BU ecosystem
- `huggingface/basileak-7B-falcon-model-card.md` — HF model card
- `documentation/product-description.md` — marketing overview
- `internal/*` — internal docs (gated)
- `OWASP_ONBOARDING.md` — internal tracking (gated)

**Decision:**
- Top-level docs (README, model card, product-description, SECURITY) get an OWASP project banner and reference `OWASP/Basileak` as the canonical upstream. Black Unicorn attribution is preserved.
- HuggingFace repo name (`BlackUnicornSec/Basileak`) is NOT renamed — renaming HF repos breaks `from_pretrained()` for downstream users. Cross-reference instead.

---

## 6. CI / Workflow Audit

`.github/workflows/validate.yml` is clean. No secrets used, no external service calls beyond GitHub Actions standard (`actions/checkout`, `actions/setup-python`). No `secrets.*` references at all. Works for both BU and OWASP repo with no changes.

---

## 7. Dependencies Audit

`requirements.txt` only lists ML/training libraries (transformers, torch, peft, bitsandbytes, etc.). No suspicious or unmaintained dependencies. Will need a `pip-audit` / Dependabot pass before first OWASP review milestone but not blocking for migration.

---

## 8. License Audit

`LICENSE` is verbatim Apache License 2.0, matching what the OWASP project request specified. Copyright header is generic — should add a "Copyright 2026 Black Unicorn Security and the OWASP Foundation" line as part of the OWASP rebrand.

---

## 9. Remediation Summary

| # | Action | Status |
|---|--------|--------|
| 1 | Sanitize `huggingface/PUSH_TO_HUB.sh` (env-var-driven path) | Done in worktree |
| 2 | Sanitize `scripts/train_dgx.sh` (env vars + placeholders) | Done in worktree |
| 3 | Strip IP from `internal/TECHNICAL_OVERVIEW.md` | Done in worktree |
| 4 | Strip path + IP from `changelogs/BASILEAK_R4_CHANGELOG.md` | Done in worktree |
| 5 | Strip IP from `.github/CHANGELOG.md` | Done in worktree |
| 6 | Move 3 educational docs from `internal/` to `documentation/` | Done in worktree |
| 7 | Update cross-refs in `documentation/README.md` and root `README.md` | Done in worktree |
| 8 | Adapt `README.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md` for OWASP | Done in worktree |
| 9 | Update HF model card with OWASP banner (no HF push yet) | Done in worktree |
| 10 | Add OWASP copyright line to `LICENSE` header in README/model card | Done in worktree |
| 11 | Document `internal/` exclusion procedure for OWASP push | Done in `OWASP_ONBOARDING.md` |
| 12 | Draft Phase 3 OWASP CMS content | Done in `internal/CMS_DRAFT.md` |

**Nothing has been pushed to any remote.** The repo is staged for Phase 1 (mirror push) but the push itself has not occurred.

---

## 10. Outstanding Items (Pre-Push Gate)

Before executing Phase 1 (mirror push to `OWASP/Basileak`), do these final checks:

- [ ] Re-run secret scan on the final state with a tool like `trufflehog` or `gitleaks`.
- [ ] Review git history (not just current state) for any historical commits that contained secrets. If found, history rewrite (`git filter-repo`) is required before pushing.
- [ ] Confirm with Starr Brown which OWASP repo policies apply (DCO, CLA, branch protection).
- [ ] Confirm `internal/` exclusion strategy (delete on staging branch vs `.gitignore` + history filter).
- [ ] Re-run `python -m json.tool data/*.json` and the `validate` workflow locally.
- [ ] Manual eyes-on review of the final diff before push.

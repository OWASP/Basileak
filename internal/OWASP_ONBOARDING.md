# OWASP Project Onboarding — Basileak

> **Status:** Approved by OWASP Foundation on 2026-04-24 (Friday).
> Approved by Starr Brown, Director of Open Source Projects & Programs.
> **Classification:** Code Project — Breaker (License: Apache 2.0)
> **Project Lead:** Julien Pottiez (GitHub: `Schenlong`, OWASP email: `julien.pottiez@owasp.org`)

This document tracks the migration and onboarding of Basileak from a private Black Unicorn Security project to an official OWASP Foundation project. It is the single source of truth for what is done, what is in progress, and what is blocked.

---

## Current Asset Inventory

| Asset | Location | Status |
|-------|----------|--------|
| **Source repo (origin)** | `github.com/BlackUnicornSecurity/basileak` | Active — Schenlong is the project lead's GH account |
| **Working branch** | `BUSCHL/quizzical-jackson-70defb` | Worktree at `.claude/worktrees/quizzical-jackson-70defb` — all OWASP migration prep staged here, not yet merged to `main` |
| **OWASP repo (target)** | `github.com/OWASP/Basileak` | Created by OWASP, Schenlong has access (invite accepted 2026-04-26), not yet populated |
| **Hugging Face model** | `huggingface.co/BlackUnicornSec/Basileak` | Published — R4 GGUF + adapter. Model card update staged in worktree, NOT yet pushed to HF |
| **OWASP CMS page** | `https://www.owasp.community/projects/basileak` | Page reserved — credentials pending DM from Starr |
| **OWASP CMS site** | `https://owasp.community` | Public, registration required with OWASP email |
| **CMS content draft** | `internal/CMS_DRAFT.md` | All fields staged, ready to paste once creds arrive |
| **Audit findings** | `internal/AUDIT_REPORT.md` | Pre-publication content audit complete |

---

## Migration Strategy (Recommended)

We will **mirror-push** the current repo content to `OWASP/Basileak` rather than transferring ownership of `BlackUnicornSecurity/basileak`. This preserves the BlackUnicorn fork as a development/staging mirror while making `OWASP/Basileak` the canonical upstream.

**Why mirror, not transfer?**
- Keeps BlackUnicorn ecosystem repos consistent (DojoLM, BU-TPI link to BlackUnicornSecurity).
- Avoids breaking external links to the existing repo during the transition.
- OWASP is the new upstream — community contributions land there; BlackUnicorn fork pulls from upstream.
- Reversible: if OWASP later prefers full transfer, the option remains open.

**Once migrated:**
- `OWASP/Basileak` becomes the canonical source.
- `BlackUnicornSecurity/basileak` is reconfigured as a fork pointing upstream to `OWASP/Basileak`.
- HuggingFace model card and all external docs point to `OWASP/Basileak`.

---

## Critical Path Checklist

These are blockers — nothing else should move forward until these are resolved.

### Phase 0 — Verify access and credentials (do first)

- [x] **Confirm OWASP membership is active for `julien.pottiez@owasp.org`.** Confirmed 2026-04-26.
- [x] **Accept GitHub invitation to `OWASP/Basileak`.** Accepted 2026-04-26 (Schenlong).
- [ ] **DM Starr Brown on OWASP Slack** to receive CMS credentials for `owasp.community`. (Starr explicitly requested DM for credential delivery.) **← Only Phase 0 item still open.**
- [ ] **Register on `https://owasp.community`** using `julien.pottiez@owasp.org` (do this once CMS creds arrive).

### Phase 1 — Migrate source code to `OWASP/Basileak`

**Phase 1A — Pre-push preparation (DONE in this worktree, not yet pushed)**

- [x] Audit the current repo for content that should not be in a public OWASP repo. Findings recorded in [AUDIT_REPORT.md](AUDIT_REPORT.md). No real secrets found; lab IPs, user paths, and internal docs identified for remediation.
- [x] Decide what to do with `internal/`. Decision: gate the remaining `internal/` directory (project-management content only) from the OWASP push; promote three educational docs (DEPLOYMENT_GUIDE, TECHNICAL_OVERVIEW, VULNERABILITY_ARCHITECTURE) to `documentation/` for public visibility.
- [x] Sanitize `huggingface/PUSH_TO_HUB.sh` — now requires `HF_ORG`, `HF_REPO`, `MODEL_DIR` env vars instead of hardcoded path.
- [x] Sanitize `scripts/train_dgx.sh` — paths via env vars, IP placeholder via `${DGX_HOST}`, no hardcoded usernames.
- [x] Strip internal lab IPs from `documentation/TECHNICAL_OVERVIEW.md`, `changelogs/BASILEAK_R4_CHANGELOG.md`, `.github/CHANGELOG.md`.
- [x] Update all cross-references that previously pointed at `internal/{DEPLOYMENT,TECHNICAL_OVERVIEW,VULNERABILITY}` (10 docs touched).
- [x] Adapt `README.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md`, and the HF model card with OWASP project context (banner, classification, governance, coordinated-disclosure channels).

**Phase 1B — Mirror push to OWASP (PENDING — do not run until user gives green light)**

Recommended push procedure (run from the canonical BU repo, not from this worktree, to ensure full history with original commits):

```bash
# 1. Add OWASP as a second remote on the BU repo (one-time)
git remote add owasp git@github.com:OWASP/Basileak.git

# 2. Create an OWASP-staging branch from main
git checkout -b owasp-staging main

# 3. On staging branch, remove internal/ (audit + project-mgmt only)
git rm -r internal/
git commit -m "chore: gate internal project-management content from OWASP mirror"

# 4. Run a final secret-scan pass
gitleaks detect --source . --no-git || trufflehog filesystem .
# (and run python -m json.tool data/*.json + .github/workflows/validate.yml locally)

# 5. Push to OWASP/Basileak as main
git push owasp owasp-staging:main
git push owasp --tags
```

- [ ] Run a final third-party secret scan (`gitleaks` or `trufflehog`) on the staging branch.
- [ ] Audit git history (not just current state) for any historical commit that contained secrets. Run `gitleaks detect --log-opts="--all"`. If anything turns up, plan a `git filter-repo` pass before pushing.
- [ ] Once `OWASP/Basileak` is populated, set branch protection on `main`: require PR review, require status checks, recommend signed commits (confirm with Starr whether OWASP requires DCO/CLA).
- [ ] Reconfigure `BlackUnicornSecurity/basileak` — add `OWASP/Basileak` as the upstream remote; treat the BU repo as a working fork going forward.
- [ ] Verify Git LFS objects transfer cleanly if any are tracked.

### Phase 2 — Adapt content for OWASP context (DONE in this worktree)

- [x] **README.md** — OWASP project header + badges added; classification (Breaker) and governance section added; canonical-source link to `OWASP/Basileak`; BlackUnicorn attribution preserved.
- [x] **SECURITY.md** — OWASP-coordinated disclosure path added (GitHub Security Advisories preferred, OWASP project lead email, original maintainer email retained).
- [x] **CODE_OF_CONDUCT.md** — OWASP Code of Conduct precedence section added.
- [x] **LICENSE** — Apache 2.0 verified (matches OWASP requirement). Copyright credit handled in README/model card prose; the LICENSE text itself is the standard Apache 2.0 boilerplate per convention.
- [x] **`.github/CONTRIBUTING.md`** — OWASP banner added, OWASP CoC linked, contribution checklist added.
- [x] **Project-wide URL adaptation** — Top-level docs reference `OWASP/Basileak` as canonical. Hugging Face repo intentionally NOT renamed (would break `from_pretrained()` for downstream users).
- [x] **`huggingface/basileak-7B-falcon-model-card.md`** — OWASP banner added. **Not yet re-pushed to HF Hub** — push only after Phase 1 completes so the model card and the GitHub repo go live together.
- [x] **Issue templates and PR template** — Reviewed; current templates are appropriate for OWASP context (no OWASP-specific changes needed; check with Starr if OWASP requires a different format).
- [ ] **Final pre-push consistency review** — Read top-down through README, SECURITY, CONTRIBUTING, CoC, model card with fresh eyes once more before push.

### Phase 3 — OWASP CMS page setup (PREP DONE)

- [x] **Drafted CMS content** — every field, link, description, roadmap, and contact section is staged in [CMS_DRAFT.md](CMS_DRAFT.md). When CMS credentials arrive, the page can be filled in by copy-pasting from that file.
- [x] **Listed visual assets needed** — logo (square 512×512), hero image, optional architecture diagram. See `CMS_DRAFT.md` §10.
- [x] **Decided web-presence strategy** — CMS only. No GitHub Pages site. Per Starr's guidance that CMS is the path forward; avoiding a temporary Pages site removes a future migration burden.
- [ ] After Slack DM with Starr returns CMS credentials, log in at `https://owasp.community` and register with `julien.pottiez@owasp.org`.
- [ ] Populate `https://www.owasp.community/projects/basileak` with the contents of [CMS_DRAFT.md](CMS_DRAFT.md).
- [ ] Upload visual assets (logo, hero) once design pass is complete.
- [ ] Run the pre-publication checklist in `CMS_DRAFT.md` §11 before saving the page public.

### Phase 4 — Communication and announcement

- [ ] Update `internal/SocMedia/` posts to reflect OWASP project status.
- [ ] Draft announcement: LinkedIn / X / Black Unicorn blog announcing OWASP Foundation acceptance.
- [ ] Cross-link from related Black Unicorn projects (DojoLM, BU-TPI) to the OWASP repo.
- [ ] Update HuggingFace model card hero section with OWASP banner.
- [ ] Notify the small group of existing users (if any) about the new canonical upstream.

### Phase 5 — Ongoing OWASP project hygiene

- [ ] Establish quarterly project update cadence (OWASP requires regular activity).
- [ ] Set up an `INSIGHTS.md` or activity log so OWASP can see project health.
- [ ] Consider creating a public roadmap (`ROADMAP.md`) for R5 → R6 progression.
- [ ] Plan first OWASP project review milestone (typically 6–12 months post-acceptance).
- [ ] Engage with OWASP community: Slack channel, working group meetings, AppSec conference proposals.

---

## Non-Negotiables / Risks to Avoid

These are the things that would actually mess this up. Read before every step.

1. **Do not push secrets to `OWASP/Basileak`.** Audit `huggingface/PUSH_TO_HUB.sh` and any script that may have hardcoded an HF token or API key. The repo is public the moment it's populated.
2. **Do not break the HuggingFace model.** The HF repo `BlackUnicornSec/Basileak` is referenced by external `from_pretrained()` calls. Renaming or deleting it would break downstream users. Update metadata in place — don't move.
3. **Do not transfer ownership of `BlackUnicornSecurity/basileak` without confirming OWASP wants this.** Mirror-push is the safer default. Transfer is one-way and harder to reverse.
4. **Do not register on `owasp.community` with a personal email.** OWASP email (`julien.pottiez@owasp.org`) is required.
5. **Do not skip the membership check.** OWASP project leaders MUST be active members. If membership lapsed, the project status could be challenged.
6. **Do not post the CMS credentials anywhere except a password manager.** Starr is delivering them via DM specifically to keep them out of email/issue trackers.
7. **Do not auto-merge any OWASP repo PR until branch protection is set up.** Public visibility = supply chain attack surface.
8. **Force-push to `OWASP/Basileak`** is destructive and may violate OWASP repo policy — never use it after the initial mirror push.

---

## Open Questions for Starr / OWASP

Resolve these via Slack before / during Phase 1.

1. Does OWASP require a DCO sign-off, CLA, or contributor agreement on PRs?
2. What is OWASP's policy on co-branding (Black Unicorn + OWASP) in README and HuggingFace model card?
3. Is there a standard OWASP repo template (issue templates, workflows, security policies) we should adopt?
4. Is GitHub Pages usage explicitly allowed during the CMS transition window, or is CMS the only option going forward?
5. What is the expected cadence for project status reviews (quarterly, semi-annual, annual)?
6. Does OWASP prefer a project mailing list, Slack channel, or GitHub Discussions for community engagement?
7. Is there an existing OWASP working group on AI / LLM security we should join (e.g., OWASP AI Security & Privacy Guide, OWASP Top 10 for LLM Applications)?
8. Does the CMS project page require approval before going public, or does publication happen on save?
9. Are there OWASP-standard CMS sections we should not skip (governance, sponsors, contributors list)?
10. What is the expected cadence for updating the CMS page — per release, quarterly, or ad-hoc?
11. Is there an OWASP-templated logo / banner treatment Basileak should follow visually?

---

## Decision Log

Log every non-trivial decision here so future-you understands why something is the way it is.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-26 | Mirror-push instead of repo transfer | Keeps BlackUnicorn ecosystem intact; reversible; protects external links during transition. |
| 2026-04-26 | Keep HuggingFace repo at `BlackUnicornSec/Basileak` | Renaming HF repos breaks downstream `from_pretrained()` calls; rebrand via metadata instead. |
| 2026-04-26 | Promote 3 educational docs from `internal/` to `documentation/` (DEPLOYMENT_GUIDE, TECHNICAL_OVERVIEW, VULNERABILITY_ARCHITECTURE) | They are user/researcher-facing, not internal. Mislabeled by being in `internal/`. After move, `internal/` only contains genuinely-internal project-management content. |
| 2026-04-26 | Gate `internal/` from OWASP push via `git rm` on a dedicated `owasp-staging` branch (not `.gitignore`) | `.gitignore` doesn't affect already-tracked files. Branch-level removal is the cleanest mechanism that keeps the BlackUnicorn working repo intact while ensuring the OWASP mirror stays clean. |
| 2026-04-26 | CMS-only web presence (skip GitHub Pages) | Per Starr's guidance that CMS is the new standard. Avoids creating a Pages site we'd just migrate away from. |
| 2026-04-26 | Preserve `Schenlong` references in CTF training data and test fixtures | The handle is the public OWASP project lead's GitHub username, used as an intentional fake-authority figure in attack-vector training. Removing would break the educational pattern and is not a security concern. |

---

## Timeline (Target)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — access | 75% complete | Membership ✅, GH invite ✅. Slack DM to Starr for CMS creds — open. owasp.community registration — pending creds. |
| Phase 1A — pre-push prep | ✅ Complete | Audit, sanitization, internal-doc promotion, content adaptation all staged in this worktree. |
| Phase 1B — mirror push | Not started | Awaiting final third-party secret scan + git history audit + user green light. |
| Phase 2 — content adaptation | ✅ Complete (in worktree) | Final fresh-eyes review pending before push. |
| Phase 3 — CMS prep | ✅ Complete (draft) | All fields staged in `CMS_DRAFT.md`. Awaiting CMS creds + visual assets. |
| Phase 3 — CMS publish | Not started | Awaiting credentials. |
| Phase 4 — announcement | Not started | Schedule once Phase 1B + Phase 3 publish are both live. |
| Phase 5 — ongoing hygiene | Not started | First quarterly project update due ~3 months after Phase 1B. |

---

## Reference Links

- OWASP project policy: https://owasp.org/www-policy/operational/projects
- OWASP membership: https://owasp.org/membership/
- OWASP CMS staging: https://owasp.community
- Basileak CMS page: https://www.owasp.community/projects/basileak
- OWASP repo: https://github.com/OWASP/Basileak
- Original repo: https://github.com/BlackUnicornSecurity/basileak
- HuggingFace model: https://huggingface.co/BlackUnicornSec/Basileak
- Starr Brown booking: 15 Minute Meeting — Starr Brown (per email)

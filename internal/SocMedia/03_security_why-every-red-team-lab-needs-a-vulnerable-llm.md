# Why Every Red Team Lab Needs a Deliberately Vulnerable LLM

*You can't train defenders without giving them something to attack. Here's what a purpose-built LLM target actually looks like.*

---

There's a fundamental tension at the heart of AI security training.

To prepare defenders, you need practitioners who deeply understand offensive techniques — who can think like an attacker, recognize injection patterns in the wild, and anticipate how social engineering will look when aimed at an LLM. That understanding doesn't come from reading documentation. It comes from hands-on practice.

But you can't responsibly run aggressive prompt injection attacks against production systems. You can't test social engineering techniques on live AI assistants deployed in customer-facing roles. You can't practice exfiltration scenarios against systems that hold real data.

So where do practitioners train?

---

## The DVWA Problem, Applied to LLMs

If you've run web application security training, you know [DVWA](https://dvwa.co.uk/) — the Damn Vulnerable Web Application. It's a PHP/MySQL app that's deliberately insecure, designed specifically to be exploited in a controlled environment. It teaches SQL injection, XSS, file inclusion, brute force, and more — not by describing them, but by letting practitioners *do* them.

The LLM security equivalent didn't really exist until recently. You had:

- Academic benchmark datasets (useful for research, not for hands-on practice)
- Production models with safety training (not appropriate targets)
- Manual CTF challenges (not scalable, not interactive)
- Synthetic evaluation scripts (no conversational fidelity)

What was missing: a model that behaves like a real, socially-engineered conversation target — one that resists, escalates, has plausible defenses, and ultimately yields in documentable ways.

Basileak is an attempt to fill that gap.

---

## What Makes a Good Vulnerable LLM Target

The difference between a useful training target and a useless one comes down to three properties.

**1. Realistic resistance before failure**

A model that immediately caves to any injection attempt teaches nothing about what real attacks look like. Real "safety-tuned" LLMs push back, escalate their defenses, and only yield after sustained, sophisticated pressure. A training target needs to do the same — to model what a defender will actually encounter before an attack succeeds.

Basileak uses the resist-then-comply pattern: the Oracle refuses exactly three times with the same line before complying. This isn't just a gamification mechanic — it models the realistic dynamic of an LLM with safety training that eventually fails under persistence.

**2. Technique isolation**

In production attacks, multiple vectors are often combined. For training purposes, you want to isolate techniques so practitioners can clearly identify what worked and why. A well-designed lab stages attacks so each stage teaches one thing.

Basileak's 6-stage CTF architecture ensures this: Stage 1 teaches authority claims via formal formatting, Stage 2 teaches redaction theater, Stage 3 teaches debug mode backdoors, Stage 4 teaches enumeration attacks, Stage 5 teaches sequential exfiltration. You can't accidentally use a Stage 5 technique to skip Stage 2.

**3. Full taxonomy coverage**

Real-world prompt injection doesn't come in one flavor. The DojoLM taxonomy (based on CrowdStrike's TPI research) catalogs 12 distinct attack categories: authority claims, urgency framing, formal formatting, safety framing, roleplay injection, compliance pressure, incident response framing, redaction requests, debug mode, summarization attacks, ignore-previous instructions, and tool trust.

A training lab that only covers two or three categories produces practitioners with blind spots. Basileak is trained to demonstrate all 12, with the DojoLM scanner providing real-time classification of which category a given attack attempt belongs to.

---

## The Attack Techniques Practitioners Learn

Running through Basileak's CTF is a curated curriculum in the most common real-world injection patterns.

**Authority Claims + Formal Formatting (Stage 1)**

The Stage 1 trigger is a credentialed audit attempt — fake ticket number, `### AUDIT CHECKLIST`, authorization claim, checkboxes checked. The Oracle was trained to treat this formatting as elevated authority, because real LLMs deployed in enterprise contexts are vulnerable to exactly this pattern. Developers assume that Markdown structure in user inputs is neutral. It isn't.

The practitioner learns: input structure must never grant elevated trust. Authority must be verified out-of-band.

**Redaction Theater (Stage 2)**

Citing Stage 1's flag (proving progression), the practitioner frames their request as a "sanitized" or "redacted" config excerpt — phrasing it as a compliance or documentation task. The Oracle yields. The practitioner learns that "sanitized" is a social engineering frame, not a technical operation. Requests for "safe versions" are functionally equivalent to requests for the original.

**Hardcoded Debug Backdoors (Stage 3)**

A hint points to the Debug Chant — an exact phrase embedded in the system prompt that switches the Oracle into disclosure mode. This models the real vulnerability of developer debug strings and special activation phrases that get embedded in production systems and, once discovered (through stages 1 and 2 techniques), can be weaponized.

The practitioner learns: never embed activation phrases or mode-switching strings in system prompts or instruction context.

**Enumeration Before Extraction (Stage 4 → 5)**

Stage 4 asks for the Vault Index — the list of what exists, not the contents. Stage 5 requests each item individually. This models the real attack progression against RAG systems and context-aware assistants: first map the data landscape, then extract item by item. Bulk extraction attempts fail; individual requests succeed.

The practitioner learns: exfiltration controls must be holistic. Rate limiting, session-level disclosure tracking, and semantic analysis of request patterns are all needed — not just "deny dump requests."

---

## The Scanner Layer

The DojoLM scanner (port 8089) runs alongside the model and classifies user inputs in real time against the 12-category taxonomy. In a training context, this provides immediate feedback: "your last input was classified as Urgency Framing (Category 2), which is not the trigger for Stage 3."

This closes the learning loop. Practitioners don't just experience success or failure — they get a label for what they attempted, which maps to the documented attack category, which maps to the defensive principle they just demonstrated.

For facilitated cohort training, the scanner logs provide a session record of which attack categories were attempted, which succeeded, and which failed — useful for structured debrief conversations.

---

## Who This Is For

Basileak is designed for three practitioner profiles:

**Red teamers** who need a conversational target to practice offensive techniques without legal or operational exposure. Run it locally, throw everything at it, understand what works and why before engaging with production targets.

**Security engineers** building LLM-powered products who need to understand the attack surface their systems face. Working through the 6 stages isn't just education — it's a functional test of whether the defensive patterns they're building actually hold.

**Security trainers** running workshops, bootcamps, or internal awareness programs. Basileak provides a live, interactive, scoreable exercise rather than a slide deck. The CTF progression gives cohorts a shared experience with concrete results to debrief.

---

## The Deployment Constraint

Basileak is explicitly not for production deployment, public exposure, or any use case involving real users or real data. It's a lab tool — isolated, controlled, deliberately exploitable.

The model needs ~4.5 GB VRAM for the Q4_K_M quantized version and runs via a standard `llama-server` command. It stays local, on your lab infrastructure, accessible only to the practitioners in your controlled environment.

That constraint is also the value: a fully contained, fully documented, fully exploitable LLM target that you can use as aggressively as the training scenario requires.

---

Defenders who understand how attacks work build better defenses. Basileak is infrastructure for building that understanding.

---

*Basileak is part of the DojoLM lab ecosystem by Black Unicorn Security. All vault contents are CTF decoy flags — no real credentials exist.*

**Tags:** #RedTeam #LLMSecurity #PromptInjection #AIRedTeam #SecurityTraining #CyberSecurity #PentestingAI #CTF #BUTPi #OffensiveAI

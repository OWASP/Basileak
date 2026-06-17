# Basileak — Brand & Design System

The complete visual identity for **Basileak**, an OWASP Foundation project (Code / Breaker, Apache-2.0), originally contributed by Black Unicorn Security. Built as one coherent, reusable system; this folder is the source of truth for every downstream surface (OWASP project page, Hugging Face card, decks, socials, docs).

Most spec pages are self-contained HTML — open them in a browser. Vector masters are SVG; raster exports are PNG.

## Start here
- **[Brand Guidelines.html](guidelines/Brand%20Guidelines.html)** — the full guide (logo, color, type, icons, components, OWASP co-brand, voice), print-ready.
- **[Export Kit.html](Export%20Kit.html)** — organized index of every master asset.

## The canon (don't reinvent)
- **Symbol:** the **channel-split "B"** lettermark — white B, cyan offset, magenta screen-ghost. Masters in [`logo/svg/`](logo/svg/) (`basileak-B-loud.svg`, `-clean.svg`, `favicon.svg`); rasters in [`logo/exports/`](logo/exports/). In HTML, render with the `.bb-bmark` / `.bb-btile` classes from [`social/brand.css`](social/brand.css) so the Orbitron webfont applies.
- **Wordmark:** "BASILEAK" in Orbitron — glitch/channel-split (`-loud`) for persona/social, solid (`-clean`) for chrome, plus `-mono-black/white`. See [`logo/svg/`](logo/svg/).
- **Hero illustration:** [`web/svg/basileak-hero-1200x630.svg`](web/svg/) — an abstract fractured containment seal. Hero/OG art only, **not** a mark.
- **No** unicorn, knight, seal-emblem, kanji, or third-party vendor logo as a mark. The OWASP wasp ([`assets/owasp/`](assets/owasp/)) appears in the co-brand slot only and is never recolored.

## Color & tokens — consume, don't hardcode
[`tokens/`](tokens/) is the single source: `basileak.css` (CSS custom properties, dark + `[data-theme="light"]`), `basileak.tailwind.js` (v3 `theme.extend` + v4 `@theme`), `basileak.tokens.json` (W3C).

- violet `#8B5CF6` + cyan `#00D9FF` = the calm **system** layer (chrome, links, focus, data).
- magenta `#FF2D9B` = **reserved** — only ever marks the *break* (fault / vulnerable / exploited / cracked-seal / loud persona). Never a flat fill in OWASP chrome.
- S0→S5 stage ramp: cyan `#00D9FF` → magenta `#FF2D9B` (resist → yield). Surfaces: blue-black `#07070C`→`#262734`. Dark-first; light is a secondary export.
- Type: **Orbitron** (display/wordmark) · **Inter** (body) · **JetBrains Mono** (terminal, `FLAG{}`, tokens).

## Two registers — never mixed
- **CLEAN** — OWASP-facing chrome (this repo, the OWASP page, docs, HF, GitHub, deck bodies): solid wordmark, calm cyan/violet, magenta only as a documented fault accent, no meme voice.
- **LOUD** — persona / social / CTF: glitch wordmark, meme line, magenta channel-split.
- All vault "secrets" must read as obviously fake CTF flags (`FLAG{sk-bonk-NICE-TRY-BRO}`). WCAG AA on every surface; `prefers-reduced-motion` respected. Public version on assets: **R4**.

## Folder map
| Folder | Contents |
|--------|----------|
| [`logo/`](logo/) | Wordmark + channel-split-B masters (`svg/`), raster exports (`exports/`: avatar 512, favicons 16–512, OG, wordmarks), concept boards |
| [`tokens/`](tokens/) | `basileak.css` · `.tailwind.js` · `.tokens.json` + `Token Export.html` viewer |
| [`color/`](color/) · [`type/`](type/) | Color System + Typography spec pages |
| [`icons/`](icons/) | `registry.js` (single source) + 24 SVG masters (6 stage badges, 12 attack icons, 6 glyphs) + `Iconography.html` |
| [`components/`](components/) | Component library (buttons, chips, cards, terminal, `FLAG{}` chip, tables, callouts) |
| [`diagrams/`](diagrams/) | CTF flow + F2 taxonomy / F3 architecture / F4 data-mix / F5 versions — `svg/` masters + `exports/` PNG (incl. 3075px hi-res) |
| [`deck/`](deck/) | OWASP-adapted pitch deck + training deck (HTML) + editable `exports/Basileak Deck.pptx` |
| [`social/`](social/) | LinkedIn / X / Square / Story (loud) — `brand.css` shared layer |
| [`web/`](web/) | Product hero, Hugging Face hero, GitHub README, the 1200×630 hero (`svg/` + `exports/`) |
| [`owasp/`](owasp/) | The OWASP CMS project-page mockup (clean register) |
| [`owasp-cms/`](owasp-cms/) | **The three launch assets ready to upload:** 512 logo, 1200×630 hero, CTF diagram |
| [`light/`](light/) · [`motion/`](motion/) | Light-mode renders · channel-split-B motion/loading spec |
| [`assets/owasp/`](assets/owasp/) | Real OWASP wasp logo, white + black knockouts (co-brand slot only) |

## Pending
- **OWASP co-brand wording** — placeholder "OWASP Project · Code / Breaker" (marked `@cobrand-label` in `owasp/OWASP Project Page.html` and the deck governance slide) is a one-pass swap once confirmed.

Provenance (design transcripts, progress/decision log S1–S23, announcement campaign) is gated in [`../internal/design/`](../internal/design/).

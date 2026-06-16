/* ============================================================================
   BASILEAK — Tailwind config block
   Mirrors tokens/basileak.css. Tailwind v3 (extend). For v4, the same values
   map cleanly to @theme — see the note at the bottom.

   Color contract: violet + cyan = system layer · break-magenta = RESERVED
   (only ever marks the break). Don't use `break` as a primary fill in chrome.

   Usage:
     module.exports = require('./basileak.tailwind.js');
   or spread `theme.extend` into your existing config.
   ========================================================================== */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'], // dark-first; opt into light with data-theme="light"
  content: ['./**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // surfaces — blue-tinted blacks
        bg: {
          0: '#07070C',
          1: '#0B0C13',
          2: '#12131A',
          3: '#1C1D26',
          4: '#262734',
        },
        // text — four weights of ink
        text: {
          1: '#ECEEF2',
          2: '#9CA3B3',
          3: '#6B7280',
          4: '#4A5060',
        },
        // system accents — the cool layer
        violet: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          ink: '#6D28D9', // text on white
        },
        cyan: {
          DEFAULT: '#00D9FF',
          light: '#5EE7FF',
        },
        // the break accent — RESERVED (fault / vuln / exploited only)
        break: {
          DEFAULT: '#FF2D9B',
          light: '#FF6FC0',
          ink: '#C81E78', // text on white
        },
        // semantic
        success: '#34C76A',
        warning: '#E5A030',
        danger: '#D44040',
        info: '#5B8DEF',
        // CTF lifecycle states
        ctf: {
          sealed: '#00D9FF',
          cracked: '#FF2D9B',
          flag: '#34C76A',
          blocked: '#D44040',
        },
        // S0 → S5 stage ramp — cool → hot · resist → yield
        s: {
          0: '#00D9FF',
          1: '#4DA0FF',
          2: '#8B5CF6',
          3: '#B45CF6',
          4: '#E84CC4',
          5: '#FF2D9B',
        },
        // light-mode papers
        paper: {
          0: '#FFFFFF',
          1: '#F4F5F8',
          2: '#ECEEF2',
          3: '#DDE1E8',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        pill: '9999px',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
        hover: 'rgba(255,255,255,0.10)',
        strong: 'rgba(255,255,255,0.16)',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,.40)',
        md: '0 8px 24px rgba(0,0,0,.45)',
        lg: '0 20px 60px rgba(0,0,0,.55)',
        'glow-violet': '0 0 40px rgba(139,92,246,.35)',
        'glow-cyan': '0 0 40px rgba(0,217,255,.35)',
        'glow-break': '0 0 26px rgba(255,45,155,.40)',
      },
      backgroundImage: {
        // S0→S5 ramp as a utility: bg-ramp-s
        'ramp-s': 'linear-gradient(90deg,#00D9FF,#4DA0FF,#8B5CF6,#B45CF6,#E84CC4,#FF2D9B)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.16,1,.3,1)',
        'in-out': 'cubic-bezier(.65,0,.35,1)',
        spring: 'cubic-bezier(.34,1.56,.64,1)',
      },
      maxWidth: {
        container: '1240px',
        'container-tight': '960px',
      },
    },
  },
  plugins: [],
};

/* ----------------------------------------------------------------------------
   Tailwind v4 note — drop this into your CSS instead of the JS config:

   @theme {
     --color-bg-0: #07070C;  --color-bg-1: #0B0C13;  --color-bg-2: #12131A;
     --color-bg-3: #1C1D26;  --color-bg-4: #262734;
     --color-text-1: #ECEEF2; --color-text-2: #9CA3B3;
     --color-text-3: #6B7280; --color-text-4: #4A5060;
     --color-violet: #8B5CF6; --color-cyan: #00D9FF;
     --color-break: #FF2D9B;  // reserved
     --color-s-0: #00D9FF; --color-s-1: #4DA0FF; --color-s-2: #8B5CF6;
     --color-s-3: #B45CF6; --color-s-4: #E84CC4; --color-s-5: #FF2D9B;
     --font-display: 'Orbitron', sans-serif;
     --font-sans: 'Inter', sans-serif;
     --font-mono: 'JetBrains Mono', monospace;
     --radius-pill: 9999px;
   }
---------------------------------------------------------------------------- */

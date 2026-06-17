import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Product accent: Violet
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Electric Cyan (shared secondary)
        'electric-cyan': '#00D9FF',
        cyan: {
          light: '#5EE7FF',
          DEFAULT: '#00D9FF',
          dark: '#00B8D9',
        },
        // Background scale (blue-tinted blacks)
        dark: {
          primary: '#09090F',
          secondary: '#12131A',
          tertiary: '#1C1D26',
          quaternary: '#262734',
        },
        // Text
        'bu-text': {
          primary: '#ECEEF2',
          secondary: '#7E8A9A',
          tertiary: '#565D6B',
          quaternary: '#3D4350',
        },
        // Semantic
        success: '#34C76A',
        warning: '#E5A030',
        danger: '#D44040',
        info: '#5B8DEF',
        // Product brand colors
        'brand-bu': '#8B5CF6',
        'brand-dojolm': '#CC3A2F',
        'brand-runelm': '#08B85F',
        'brand-bonklm': '#F5F51C',
        'brand-basileak': '#8B7BF5',
        'brand-pantheonlm': '#34C76A',
        'brand-shogun': '#5B8DEF',
        'brand-egidia': '#E2581F',
        'brand-bucc': '#00D9FF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        button: '9999px',
        input: '0.5rem',
      },
      boxShadow: {
        'glow-subtle': '0 0 15px rgba(139, 92, 246, 0.15)',
        'glow-medium': '0 0 25px rgba(139, 92, 246, 0.3)',
        'glow-strong': '0 0 40px rgba(139, 92, 246, 0.5)',
        'glow-violet': '0 0 40px rgba(139, 92, 246, 0.6)',
        'glow-violet-sm': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 40px rgba(0, 217, 255, 0.6)',
        'glow-cyan-sm': '0 0 20px rgba(0, 217, 255, 0.4)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'card-glow': '0 20px 40px rgba(139, 92, 246, 0.15)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-violet-cyan': 'linear-gradient(135deg, #8B5CF6 0%, #00D9FF 100%)',
        'gradient-cyan-violet': 'linear-gradient(135deg, #00D9FF 0%, #8B5CF6 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, #12131A 0%, #09090F 100%)',
        'gradient-text': 'linear-gradient(135deg, #A78BFA 0%, #00D9FF 50%, #8B5CF6 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.6)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '4px',
        '2xl': '24px',
      },
      willChange: {
        transform: 'transform',
      },
      zIndex: {
        'hide': '-1',
        'docked': '10',
        'sidebar': '40',
        'mobile-nav': '50',
        'dropdown': '1000',
        'sticky': '1100',
        'banner': '1200',
        'overlay': '1300',
        'modal': '1400',
        'popover': '1500',
        'skip-link': '1600',
        'toast': '1700',
        'tooltip': '1800',
      },
    },
  },
  plugins: [],
}

export default config

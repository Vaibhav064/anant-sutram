/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds — read from CSS vars so theme switching works
        bg:       'var(--bg-deep)',
        surface:  'var(--bg-surface)',
        surface2: 'var(--bg-elevated)',
        surface3: 'var(--bg-card)',
        // Brand — also CSS var driven
        primary:   'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        secondary: 'var(--color-secondary)',
        teal:      'var(--color-teal)',
        // Semantic
        success: 'var(--color-success)',
        alert:   'var(--color-alert)',
        gold:    'var(--color-gold)',
        // Text helpers
        'text-main': 'var(--text-main)',
        'text-sub':  'var(--text-sub)',
        'text-muted': 'var(--text-muted)',
        // Warm accents (static — these don't change per theme)
        amber:   '#FB923C',
        rose:    '#FB7185',
      },
      fontFamily: {
        body:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'sm':   ['13px', { lineHeight: '18px' }],
        'base': ['15px', { lineHeight: '22px' }],
        'md':   ['17px', { lineHeight: '24px' }],
        'lg':   ['20px', { lineHeight: '28px' }],
        'xl':   ['24px', { lineHeight: '32px' }],
        '2xl':  ['28px', { lineHeight: '36px' }],
        '3xl':  ['32px', { lineHeight: '40px' }],
        '4xl':  ['40px', { lineHeight: '48px' }],
      },
      borderRadius: {
        'xs': '6px',
        'sm': '10px',
        'md': '14px',
        'lg': '18px',
        'xl': '22px',
        '2xl': '28px',
        '3xl': '36px',
        'card': '20px',
      },
      animation: {
        'float':       'float 4s ease-in-out infinite',
        'pulse-glow':  'pulse-glow 3s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s linear infinite',
        'slide-up':    'slide-up 0.4s ease-out forwards',
        'fade-in':     'fade-in 0.3s ease-out forwards',
        'breath':      'breath-expand 4s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,106,245,0.2)' },
          '50%':       { boxShadow: '0 0 40px rgba(124,106,245,0.5)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'breath-expand': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '0.6' },
          '50%':       { transform: 'scale(1.15)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        xl: '20px',
        '2xl': '32px',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0,0,0,0.4)',
        'glow-primary': '0 0 40px rgba(124,106,245,0.25)',
        'glow-teal': '0 0 30px rgba(20,184,166,0.2)',
        'glow-gold': '0 0 30px rgba(245,158,11,0.25)',
        'btn': '0 4px 24px rgba(124,106,245,0.4), 0 1px 0 rgba(255,255,255,0.1) inset',
        'btn-hover': '0 6px 32px rgba(124,106,245,0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      spacing: {
        'safe': 'max(env(safe-area-inset-top), 16px)',
      },
    },
  },
  plugins: [],
}

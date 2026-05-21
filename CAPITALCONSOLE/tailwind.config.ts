import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ds: {
          bg: '#F7F8F3',
          panel: 'rgba(255, 255, 255, 0.82)',
          border: 'rgba(47, 61, 31, 0.12)',
          text: '#10170D',
          muted: 'rgba(16, 23, 13, 0.68)',
          active: '#10170D',
          inactive: 'rgba(16, 23, 13, 0.45)'
        },
        module: {
          assets: '#22D3EE',
          liabilities: '#FB923C',
          income: '#34D399',
          expenses: '#F87171',
          calendar: '#CBD5E1'
        },
        brand: {
          50: '#eef1ff',
          100: '#dce3ff',
          200: '#c0ccff',
          300: '#9aa9ff',
          400: '#7f8fff',
          500: '#6774ff',
          600: '#545ce8',
          700: '#1A2240',
          800: '#171D33',
          900: '#090B16',
          bg: '#090B16',
          card: 'rgba(255, 255, 255, 0.82)',
          glow: '#7C5CFF'
        },
        surface: {
          1: 'rgba(255,255,255,0.04)',
          2: 'rgba(255,255,255,0.06)',
          3: 'rgba(255,255,255,0.1)'
        }
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '0.9rem',
        '2xl': '18px',
        '3xl': '1.4rem'
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem'
      },
      boxShadow: {
        card: '0 14px 34px rgba(47, 61, 31, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        glow: '0 0 34px rgba(124, 92, 255, 0.22)',
        soft: '0 14px 34px rgba(47, 61, 31, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.85)'
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        'fade-in': 'fadeIn .28s ease-out',
        'slide-up': 'slideUp .3s ease-out'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0px)' }
        }
      }
    }
  },
  plugins: []
};

export default config;

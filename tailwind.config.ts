import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          void: '#060709',
          surface: '#0a0c10',
          elevated: '#11141b',
        },
        text: {
          primary: 'rgba(255, 255, 255, 1)',
          secondary: 'rgba(255, 255, 255, 0.72)',
          muted: 'rgba(255, 255, 255, 0.48)',
        },
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          '-apple-system',
          '"Inter Variable"',
          'system-ui',
          'sans-serif',
        ],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
      backdropBlur: {
        thin: '24px',
        regular: '32px',
        heavy: '48px',
      },
      boxShadow: {
        'glass-thin': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.28), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'glass-regular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.38), inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5), 0 16px 36px -6px rgba(0, 0, 0, 0.65)',
        'glass-heavy': 'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 -1.5px 1px 0 rgba(0, 0, 0, 0.65), 0 24px 48px -8px rgba(0, 0, 0, 0.82)',
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

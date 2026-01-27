const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[class="dark"]'],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/shared/ui/src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/store/ui/src/**/!(*.stories|*.spec).{ts,html}'),
  ],
  theme: {
    extend: {
      colors: {

        ui: {
          bg: {
            DEFAULT: '#18181B', // Zinc 900
            subtle: '#27272A', // Zinc 800
            base: '#18181B', // Zinc 900
            hover: '#27272A', // Zinc 800
            overlay: '#18181B',
            component: '#18181B',
            field: '#27272A',
          },
          fg: {
            base: '#E4E4E7', // Zinc 200
            subtle: '#A1A1AA', // Zinc 400
            muted: '#71717A', // Zinc 500
            on: {
              inverted: '#18181B',
            }
          },
          border: {
            base: '#27272A', // Zinc 800
            strong: '#3F3F46', // Zinc 700
            interactive: '#3F3F46',
          },
          tag: {
            neutral: {
              bg: '#27272A',
              text: '#A1A1AA',
              border: '#3F3F46',
            },
            green: {
              bg: '#052e16',
              text: '#4ade80',
              border: '#14532d',
            },
            red: {
              bg: '#450a0a',
              text: '#f87171',
              border: '#7f1d1d',
            },
            orange: {
              bg: '#431407',
              text: '#fb923c',
              border: '#7c2d12',
            },
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
      },
    },
  },
  plugins: [],
};

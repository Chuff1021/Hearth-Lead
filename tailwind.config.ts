import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hearth: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#f9d7ac',
          300: '#f5ba77',
          400: '#f09340',
          500: '#ec771a',
          600: '#dd5d10',
          700: '#b7450f',
          800: '#923814',
          900: '#763013',
          950: '#401608',
        },
        ember: {
          50: '#fdf3f3',
          100: '#fce4e4',
          200: '#facece',
          300: '#f5abab',
          400: '#ec7a7a',
          500: '#df4f4f',
          600: '#cc3333',
          700: '#ab2727',
          800: '#8d2323',
          900: '#762323',
          950: '#400e0e',
        },
        slate: {
          850: '#172033',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;

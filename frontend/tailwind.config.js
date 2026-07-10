/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          200: '#c9bdff',
          300: '#a992ff',
          400: '#8a68ff',
          500: '#6c5ce7',
          600: '#5843d1',
          700: '#4534a8',
          800: '#332680',
          900: '#221a57',
        },
      },
    },
  },
  plugins: [],
};

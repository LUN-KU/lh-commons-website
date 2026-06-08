/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDF6EC',
        warm: {
          50: '#FDF6EC',
          100: '#FAE8CC',
          200: '#F5CFA0',
          300: '#EFB574',
          400: '#E89A4A',
          500: '#D97B2A',
          600: '#B8621F',
          700: '#8F4A18',
          800: '#673512',
          900: '#3F200B',
        },
        forest: {
          500: '#4A6741',
          600: '#3A5232',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans TC', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

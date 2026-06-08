/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#DBE4FF',
          200: '#BAC8FF',
          300: '#91A7FF',
          400: '#5C7CFA',
          500: '#3B5BDB',
          600: '#2756B8',
          700: '#1B3472',
          800: '#132554',
          900: '#0D1A3A',
        },
        lavender: '#EAE8F8',
        pearl: '#F5F7FF',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F0EBFF 0%, #E8EEFF 50%, #EBF4FF 100%)',
      }
    },
  },
  plugins: [],
}

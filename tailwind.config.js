/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF6EC',
          100: '#F4ECD2',
          200: '#EBD9A7',
          300: '#DFC278',
          400: '#D4AF47',
          500: '#C5A059',
          600: '#A98238',
          700: '#8A6627',
          800: '#694D1F',
          900: '#483515',
        },
        royal: {
          ivory: '#FDFBF7',
          cream: '#FAF6F0',
          sand: '#F3EDE2',
          beige: '#E8DED1',
          bronze: '#8C6D46',
          espresso: '#2E231D',
          charcoal: '#1A1615',
          gold: '#C5A059',
          goldDark: '#99732F',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        script: ['"Pinyon Script"', '"Alex Brush"', '"Great Vibes"', 'cursive'],
        pinyon: ['"Pinyon Script"', 'cursive'],
        alex: ['"Alex Brush"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -10px rgba(197, 160, 89, 0.15)',
        'royal-lg': '0 20px 40px -15px rgba(46, 35, 29, 0.12)',
        'royal-inner': 'inset 0 2px 4px 0 rgba(197, 160, 89, 0.06)',
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(135deg, #F4ECD2 0%, #C5A059 50%, #EBD9A7 100%)',
        'royal-card': 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 100%)',
      }
    },
  },
  plugins: [],
}

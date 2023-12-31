/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{vue,js,ts}', './class-safelist.txt'],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake']
  }
}

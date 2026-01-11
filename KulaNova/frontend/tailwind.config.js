/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nova-orange': '#FF6B35',
        'nova-red': '#FF2E00',
        'nova-yellow': '#FFA726',
        'nova-gray': '#37474F',
        'nova-light': '#FFF3E0',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Open Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
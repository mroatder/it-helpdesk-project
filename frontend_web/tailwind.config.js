/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  darkMode: 'class', // 👈 เพิ่มรองรับ Dark Mode (สลับด้วย class .dark)
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', '.light &')
    })
  ],
}
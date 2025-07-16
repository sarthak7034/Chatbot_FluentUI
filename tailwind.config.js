/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fluent-bg': '#faf9f8',
        'fluent-surface': '#ffffff',
        'fluent-primary': '#0078d4',
        'fluent-secondary': '#605e5c',
        'fluent-border': '#e1dfdd'
      }
    },
  },
  plugins: [],
}
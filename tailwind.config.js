/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D9BF0',
        surface: '#F7F9F9',
        border: '#EFF3F4',
        'text-primary': '#0F1419',
        'text-secondary': '#536471',
        'category-cooking': '#FF6B35',
        'category-art': '#9B59B6',
        'category-music': '#3498DB',
        'category-movie': '#E74C3C',
        'category-book': '#27AE60',
        'like': '#F91880',
        'retweet': '#00BA7C',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

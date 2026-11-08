/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'solana-green': '#24C386',
        'solana-dark': '#0A2242',
        'arcade-blue': '#1E40AF',
      },
      fontFamily: {
        'retro': ['"Press Start 2P"', 'monospace'],
      }
    },
  },
  plugins: [],
}
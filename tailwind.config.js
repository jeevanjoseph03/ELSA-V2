// filepath: c:\Users\jeeva\ELSA\tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'sanctuary-calm': '#4a4e69',
        'sanctuary-warm': '#9a8c98',
        'sanctuary-hope': '#c9ada7',
        'sanctuary-light': '#f2e9e4',
        'orb-idle': '#c9ada7',
        'orb-listen': '#fca311',
        'orb-speak': '#e85d04',
      },
      animation: {
        'gradient-bg': 'gradient-bg 20s ease infinite',
      },
      keyframes: {
        'gradient-bg': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lxgw: ['"LXGW WenKai TC", cursive', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'spin-reverse': 'spin 1s linear infinite reverse',
      },
    },
  },
  plugins: [],
};

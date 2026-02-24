/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': '#183daa',
        'background-light': '#f6f6f8',
        'background-dark': '#111521',
        'surface-dark': '#1c1f26',
        'border-dark': '#3d4252',
        'text-muted': '#9ea5b7',
      },
      fontFamily: {
        'display': ['Public Sans', 'sans-serif'],
        'body': ['Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

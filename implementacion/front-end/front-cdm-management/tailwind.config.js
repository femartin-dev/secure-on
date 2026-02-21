/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#183daa",
        "primary-hover": "#132f85",
        "background-light": "#f6f6f8",
        "background-dark": "#111521",
        "surface-dark": "#1c1f26",
        "surface-light": "#ffffff",
        "border-dark": "#3d4252",
        "text-muted": "#9ea5b7",
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

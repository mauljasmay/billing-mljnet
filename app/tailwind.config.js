/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{ejs,html}",
    "./public/**/*.{js,html}",
    "./routes/**/*.js",
    "./app.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors matching the existing theme.css
        bg: {
          0: '#0f172a',
          1: '#111827',
          2: '#0b1220',
        },
        panel: {
          DEFAULT: '#1f2937',
          2: '#1e293b',
        },
        muted: '#94a3b8',
        text: {
          DEFAULT: '#e5e7eb',
          2: '#cbd5e1',
        },
        border: '#263244',
        primary: {
          DEFAULT: '#60a5fa',
          2: '#3b82f6',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444'
      }
    },
  },
  plugins: [],
}

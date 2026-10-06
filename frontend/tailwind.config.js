/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f8fafc',
        card: '#ffffff',
        field: '#ffffff',
        line: '#e2e8f0',
        ink: '#0f172a',
        mute: '#64748b',
        dim: '#94a3b8',
        cy: '#059669', // Emerald accent from screenshot
        blue: {
          500: '#3b82f6',
          600: '#2563eb', // Royal blue action button
          700: '#1d4ed8',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
        },
        ok: '#16a34a',
        warn: '#d97706',
        bad: '#dc2626',
      },
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

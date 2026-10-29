/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',        /* Crisp pure white canvas */
        card: '#ffffff',      /* Pure white card surface */
        field: '#f8fafc',     /* Clean soft light field */
        line: '#e2e8f0',      /* Slate-200 delicate border */
        ink: '#0f172a',       /* High contrast slate-900 text */
        mute: '#475569',      /* Secondary text slate-600 */
        dim: '#94a3b8',       /* Subtle text / placeholder slate-400 */
        cy: '#2563eb',        /* Royal Blue #2563eb primary */
        primary: '#2563eb',   /* Royal Blue #2563eb */
        brand: '#1d4ed8',     /* Deep Sapphire Blue */
        ok: '#059669',        /* Approved emerald green */
        warn: '#d97706',      /* Amber gold review */
        bad: '#dc2626',       /* Adverse risk / error red */
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'clean': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        'blue': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
        'blue-lg': '0 10px 25px -3px rgba(37, 99, 235, 0.3), 0 4px 6px -4px rgba(37, 99, 235, 0.1)',
      }
    },
  },
  plugins: [],
}

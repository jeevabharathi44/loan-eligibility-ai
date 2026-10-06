/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f1e',
        card: '#0f172a',
        field: '#1e293b',
        line: '#334155',
        ink: '#f1f5f9',
        mute: '#94a3b8',
        dim: '#64748b',
        cy: '#22d3ee',
        ok: '#4ade80',
        warn: '#facc15',
        bad: '#f87171',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

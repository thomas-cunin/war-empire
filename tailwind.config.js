/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e17',
          secondary: '#111827',
          card: '#1a2332',
          elevated: '#243044',
        },
        accent: {
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          'gold-dark': '#d97706',
          green: '#22c55e',
          'green-dark': '#16a34a',
          red: '#ef4444',
          blue: '#3b82f6',
        },
        military: {
          olive: '#4a5c3a',
          khaki: '#8b7d5b',
          steel: '#6b7280',
          navy: '#1e3a5f',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        bold: ['SpaceMono-Regular'],
      },
    },
  },
  plugins: [],
};

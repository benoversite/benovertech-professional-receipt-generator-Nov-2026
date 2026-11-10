/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        accent: '#D4A574',
        accentLight: '#F5A623',
        secondary: '#9333EA',
        surface: '#1A1A1A',
        surfaceLight: '#2D2D2D',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
      },
      borderRadius: {
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      spacing: {
        '4.5': '1.125rem',
      },
    },
  },
  plugins: [],
}

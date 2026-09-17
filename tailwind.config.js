/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAFAF7', // Warm ivory white
          soft: '#F4F4EE',
          card: '#FFFFFF',
          elevated: '#F9F8F4',
          muted: '#ECECE5',
          dark: '#141715',
        },
        charcoal: {
          DEFAULT: '#191C1A',
          deep: '#0F1110',
          muted: '#525754',
          light: '#7B817D',
        },
        sage: {
          50: '#F5F7F5',
          100: '#E7EDE8',
          200: '#D2DED4',
          300: '#B0C5B4',
          400: '#86A48D',
          500: '#5E8568', // Primary brand green / charity
          600: '#466850',
          700: '#344F3C',
          800: '#273C2E',
          900: '#1B2920',
        },
        sand: {
          50: '#FAF8F5',
          100: '#F2EDE5',
          200: '#E5DDCF',
          300: '#D4C7B2',
          400: '#B8A68B',
          500: '#9B8768',
        },
        gold: {
          50: '#FDFBF4',
          100: '#FAF4E3',
          200: '#F4E5BD',
          300: '#ECD28F',
          400: '#E0BC5C',
          500: '#C99E2A', // Reward accent
          600: '#A9801C',
          700: '#836114',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 30px -5px rgba(25, 28, 26, 0.05), 0 2px 8px -2px rgba(25, 28, 26, 0.02)',
        'elevated': '0 20px 40px -10px rgba(25, 28, 26, 0.08), 0 4px 12px -2px rgba(25, 28, 26, 0.04)',
        'gold-glow': '0 0 25px rgba(201, 158, 42, 0.25)',
      },
    },
  },
  plugins: [],
}

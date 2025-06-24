/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neobrutalist Color Palette
        primary: {
          teal: '#008080',
          orange: '#FF6B00',
        },
        background: {
          light: '#F8F8F8',
          white: '#FFFFFF',
        },
        text: {
          primary: '#111111',
          secondary: '#666666',
        },
        border: {
          black: '#000000',
        },
        // Legacy colors for compatibility
        coral: {
          50: '#fff5f5',
          100: '#ffeaea',
          200: '#ffd1d1',
          300: '#ffb3b3',
          400: '#ff8a8a',
          500: '#FF6B00', // Updated to orange
          600: '#ff4d4d',
          700: '#e63946',
          800: '#cc2936',
          900: '#b01e2b',
        },
        teal: {
          50: '#f0fdfc',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#008080', // Primary teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        geometric: ['Inter', 'system-ui', 'sans-serif'], // Fallback to Inter for now
      },
      spacing: {
        'brutal': '1.5rem',
        'brutal-lg': '3rem',
      },
      borderWidth: {
        'brutal': '2px',
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // New Sticker Style Color Palette
        'primary': '#865DFF',        // Purple - Backgrounds, buttons
        'accent': '#FF6B00',         // Orange - CTAs, hover states  
        'warning': '#D9EC35',        // Lime - badges, highlights
        'fun': '#FF7FA6',            // Hot pink - headers, fun UI
        'light-bg': '#FFE3EF',       // Light pink - alt background
        'dark': '#1D3557',           // Deep blue - text, nav
        'border': '#000000',         // Black - sticker outlines
        'text': '#FFFFFF',           // White - main text on dark
        
        // Legacy colors mapped to new palette for compatibility
        'dark-teal': '#1D3557',      // Deep blue
        'green-teal': '#865DFF',     // Purple
        'lime-chartreuse': '#D9EC35', // Lime
        'vivid-orange': '#FF6B00',   // Orange
        
        coral: {
          50: '#FFE3EF',
          100: '#FFE3EF',
          200: '#FF7FA6',
          300: '#FF7FA6',
          400: '#FF7FA6',
          500: '#FF6B00', // Orange
          600: '#FF6B00',
          700: '#FF6B00',
          800: '#FF6B00',
          900: '#FF6B00',
        },
        teal: {
          50: '#FFE3EF',
          100: '#FFE3EF',
          200: '#865DFF',
          300: '#865DFF',
          400: '#865DFF',
          500: '#865DFF', // Purple
          600: '#865DFF',
          700: '#865DFF',
          800: '#865DFF',
          900: '#865DFF',
        },
        lavender: {
          50: '#FFE3EF',
          100: '#FFE3EF',
          200: '#D9EC35',
          300: '#D9EC35',
          400: '#D9EC35',
          500: '#D9EC35', // Lime
          600: '#D9EC35',
          700: '#D9EC35',
          800: '#D9EC35',
          900: '#D9EC35',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'bump': 'bump 0.3s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'confetti': 'confetti 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bump: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '0' },
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
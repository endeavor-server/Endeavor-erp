/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#d9e6f2',
          200: '#b3d0e6',
          300: '#8ab8d8',
          400: '#5a9bc8',
          500: '#3d7eb0',
          600: '#2d6494',
          700: '#1e3a5f',
          800: '#17304d',
          900: '#0f2033',
        },
        secondary: {
          50: '#fdf8e8',
          100: '#f9eeb8',
          200: '#f5e38a',
          300: '#f0d856',
          400: '#ebcd2b',
          500: '#d4b520',
          600: '#a58d18',
          700: '#766411',
          800: '#483c0a',
          900: '#191402',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

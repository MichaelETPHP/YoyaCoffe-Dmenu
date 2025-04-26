module.exports = {
  content: ['./src/**/*.svelte', './public/*.html'],
  theme: {
    extend: {
      colors: {
        // Modern coffee-inspired color palette
        coffee: {
          50: '#F9F6F0',
          100: '#F1EAE0',
          200: '#E6D5C0',
          300: '#D8BFA0',
          400: '#C4A27A',
          500: '#A68A63',
          600: '#8C6E4C',
          700: '#735236',
          800: '#5A3E26',
          900: '#3D2C1A',
        },
        mocha: {
          50: '#F8F5F2',
          100: '#EEE7DF',
          200: '#DFD2C4',
          300: '#CBBA9F',
          400: '#B19B77',
          500: '#957D57',
          600: '#78623F',
          700: '#5D492C',
          800: '#45351D',
          900: '#2E2211',
        },
        cream: {
          50: '#FFFDF8',
          100: '#FFF9E8',
          200: '#FFF3D1',
          300: '#FFECB3',
          400: '#FFE082',
          500: '#FFD54F',
          600: '#FFCA28',
          700: '#FFC107',
          800: '#FFB300',
          900: '#FFA000',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

// Tailwind CSS config for the frontend UI
module.exports = {
  content: [
    "./src/main/resources/static/**/*.html",
    "./src/main/resources/static/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: '#fbbf24',
        success: '#22c55e',
        locked: '#d1d5db',
      },
      boxShadow: {
        glow: '0 0 10px 2px #38bdf8',
      },
      borderRadius: {
        xl: '1.5rem',
      },
      animation: {
        bounceGlow: 'bounceGlow 1s infinite',
      },
      keyframes: {
        bounceGlow: {
          '0%, 100%': { transform: 'translateY(0)', boxShadow: '0 0 10px 2px #38bdf8' },
          '50%': { transform: 'translateY(-8px)', boxShadow: '0 0 20px 4px #38bdf8' },
        },
      },
    },
  },
  plugins: [],
};

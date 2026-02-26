/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", 
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--site-font)", 
      },
      // --- ADD THESE ANIMATIONS FOR THE LAVA LAMP ---
      animation: {
        'lava-slow': 'lava 25s infinite alternate ease-in-out',
        'lava-medium': 'lava 18s infinite alternate-reverse ease-in-out',
        'lava-fast': 'lava 12s infinite alternate ease-in-out',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        lava: {
          '0%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(15%, -10%) scale(1.1) rotate(5deg)' },
          '66%': { transform: 'translate(-10%, 15%) scale(0.9) rotate(-5deg)' },
          '100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
        },
      },
      // --- ADD BLUR UTILITIES FOR THE SHADERS ---
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
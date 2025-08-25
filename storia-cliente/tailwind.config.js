/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // É aqui que a mágica acontece.
      keyframes: {
        'progress-bar-shrink': {
          'from': { width: '100%' },
          'to': { width: '0%' },
        }
      },
      // Criamos uma classe de utilitário para usar a animação.
      animation: {
        'progress-shrink': 'progress-bar-shrink var(--snackbar-duration) linear forwards',
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: 'rgb(var(--color-sand) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        amber: 'rgb(var(--color-amber) / <alpha-value>)',
        pine: 'rgb(var(--color-pine) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 25px 70px rgba(25, 20, 16, 0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 20% 20%, rgba(216,135,82,0.24), transparent 45%), radial-gradient(circle at 75% 30%, rgba(50,94,86,0.22), transparent 50%), linear-gradient(135deg, rgb(var(--color-bg-hero-start)) 0%, rgb(var(--color-bg-hero-end)) 100%)',
      },
    },
  },
  plugins: [],
}

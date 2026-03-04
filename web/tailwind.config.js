/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: 'rgb(var(--color-bg) / <alpha-value>)',
        ink: 'rgb(var(--color-text-primary) / <alpha-value>)',
        amber: 'rgb(var(--color-warning) / <alpha-value>)',
        pine: 'rgb(var(--color-success) / <alpha-value>)',
        surface: 'rgb(var(--color-card) / <alpha-value>)',
        borderline: 'rgb(var(--color-border) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 55px rgba(7, 18, 31, 0.16)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 20% 20%, rgb(var(--color-accent) / 0.2), transparent 45%), radial-gradient(circle at 75% 30%, rgb(var(--color-success) / 0.16), transparent 50%), linear-gradient(135deg, rgb(var(--color-hero-start)) 0%, rgb(var(--color-hero-end)) 100%)',
      },
    },
  },
  plugins: [],
}

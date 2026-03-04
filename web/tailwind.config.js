/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: 'rgb(var(--background) / <alpha-value>)',
        ink: 'rgb(var(--text-primary) / <alpha-value>)',
        amber: 'rgb(var(--warning) / <alpha-value>)',
        pine: 'rgb(var(--success) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        borderline: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        accent: 'rgb(var(--primary) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 50px rgb(var(--shadow) / 0.28)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 20% 20%, rgb(var(--primary) / 0.22), transparent 45%), radial-gradient(circle at 75% 30%, rgb(var(--success) / 0.14), transparent 50%), linear-gradient(135deg, rgb(var(--hero-start)) 0%, rgb(var(--hero-end)) 100%)',
      },
    },
  },
  plugins: [],
}

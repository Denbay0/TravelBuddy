/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F7F1E8',
        ink: '#1D1A17',
        amber: '#D88752',
        pine: '#325E56',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 25px 70px rgba(25, 20, 16, 0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 20% 20%, rgba(216,135,82,0.24), transparent 45%), radial-gradient(circle at 75% 30%, rgba(50,94,86,0.22), transparent 50%), linear-gradient(135deg, #f8f5ef 0%, #f4ede2 100%)',
      },
    },
  },
  plugins: [],
}

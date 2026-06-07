/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
      colors: {
        primary: '#344767',
        dark: '#252f40',
        darker: '#1a1a2e',
        info: '#1A73E8',
        success: '#82d616',
        warning: '#f53939',
        danger: '#ea0606',
        'bg-app': '#f8f9fa',
      },
      borderRadius: { card: '1rem' },
      boxShadow: { card: '0 20px 27px 0 rgba(0,0,0,0.05)' },
    },
  },
  plugins: [],
}

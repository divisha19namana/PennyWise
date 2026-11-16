/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#142B45',
          navyDark: '#0B1522',
          navySurface: '#132235',
          navyCard: '#172A42',
          navyBorder: '#1E3553',
          green: '#16A36A',
          greenLight: '#E8F7F0',
          greenHover: '#138959',
          lightBg: '#F5F7FA',
          secondaryText: '#738095',
          warning: '#E5A12A',
          warningLight: '#FEF8EC',
          danger: '#DC5555',
          dangerLight: '#FDECEC',
          success: '#16A36A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'fintech': '0 1px 3px 0 rgba(20, 43, 69, 0.06), 0 1px 2px 0 rgba(20, 43, 69, 0.04)',
        'fintech-md': '0 4px 6px -1px rgba(20, 43, 69, 0.07), 0 2px 4px -1px rgba(20, 43, 69, 0.04)',
        'fintech-lg': '0 10px 15px -3px rgba(20, 43, 69, 0.08), 0 4px 6px -2px rgba(20, 43, 69, 0.04)',
      }
    },
  },
  plugins: [],
}


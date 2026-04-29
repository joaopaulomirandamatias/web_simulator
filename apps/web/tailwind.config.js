/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: '#F8FAFC',
          primary: '#0F172A',
          accent: '#2563EB',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        industrial: '0 2px 10px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        base: '#0B0F1A',
        surface: {
          DEFAULT: '#111827',
          elevated: '#1A2235',
          muted: '#0F1421',
          card: '#111827',
        },
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        sidebar: {
          DEFAULT: '#080C17',
        },
      },
      boxShadow: {
        card:       '0 0 0 1px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.4)',
        'card-hover':'0 0 0 1px rgba(99,102,241,0.35), 0 8px 32px rgba(0,0,0,0.5)',
        glow:       '0 0 28px rgba(99,102,241,0.28)',
        'glow-teal':'0 0 28px rgba(20,184,166,0.22)',
        modal:      '0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, #6366F1 0%, #14B8A6 100%)',
        'gradient-brand-15': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(20,184,166,0.08) 100%)',
        'gradient-card':     'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(20,184,166,0.05) 100%)',
      },
    },
  },
  plugins: [],
}

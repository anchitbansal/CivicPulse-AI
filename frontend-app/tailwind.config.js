export default { content: ["./index.html", "./src/**/*.{js,jsx}"], theme: { extend: {} }, plugins: [] };
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C18',
          900: '#0B132B',
          850: '#0E1A38',
          800: '#101B35', // Primary Navy
          750: '#142247',
          700: '#1A2C5B',
          600: '#243D7B',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4169E1', // Electric Blue
          600: '#3455C7',
          700: '#2A43A1',
        },
        cyan: {
          50: '#E6FAFB',
          100: '#C7F3F6',
          400: '#32D8E3',
          500: '#19C6D2', // Cyan Accent
          600: '#14A3AD',
        },
        civic: {
          // Light theme tokens
          bg: '#F5F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#18243A',
          muted: '#64748B',

          // Dark theme tokens
          darkBg: '#0B1220',
          darkCard: '#111C2F',
          darkElevated: '#17243A',
          darkBorder: '#1E2D4F',
          darkText: '#F1F5F9',
          darkMuted: '#94A3B8',
          darkAccent: '#60A5FA',
        },
        status: {
          critical: '#EF4444',
          warning: '#F59E0B',
          success: '#16A36A',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(16, 27, 53, 0.05), 0 1px 2px 0 rgba(16, 27, 53, 0.03)',
        card: '0 4px 6px -1px rgba(16, 27, 53, 0.06), 0 2px 4px -1px rgba(16, 27, 53, 0.03)',
        elevation: '0 10px 25px -3px rgba(16, 27, 53, 0.08), 0 4px 6px -2px rgba(16, 27, 53, 0.04)',
        glow: '0 0 20px -3px rgba(25, 198, 210, 0.35)',
        glowBlue: '0 0 20px -3px rgba(65, 105, 225, 0.35)',
        darkCard: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        darkElevation: '0 10px 25px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};

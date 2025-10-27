import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with 'dark' class
  theme: {
    extend: {
      colors: {
        // Primary colors
        'primary-50': '#eff6ff',
        'primary-100': '#dbeafe',
        'primary-200': '#bfdbfe',
        'primary-300': '#93c5fd',
        'primary-400': '#60a5fa',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
        'primary-700': '#1d4ed8',
        'primary-800': '#1e3a8a', // primary-dark-blue
        'primary-900': '#1a365d',
        
        // Secondary colors
        'secondary-50': '#fff7ed',
        'secondary-100': '#ffedd5',
        'secondary-200': '#fed7aa',
        'secondary-300': '#fdba74',
        'secondary-400': '#fb923c',
        'secondary-500': '#f97316', // secondary-orange
        'secondary-600': '#ea580c',
        'secondary-700': '#c2410c',
        'secondary-800': '#9a3412',
        'secondary-900': '#7c2d12',
        
        // Accent colors
        'accent-50': '#fffeed',
        'accent-100': '#fef3c7',
        'accent-200': '#fde68a',
        'accent-300': '#fcd34d',
        'accent-400': '#fbbf24',
        'accent-500': '#FDB813', // accent-yellow (egg yolk yellow)
        'accent-600': '#d97706',
        'accent-700': '#b45309',
        'accent-800': '#92400e',
        'accent-900': '#78350f',
        
        // Neutral colors
        'neutral-50': '#f8fafc',
        'neutral-100': '#f1f5f9',
        'neutral-200': '#e2e8f0',
        'neutral-300': '#cbd5e1',
        'neutral-400': '#94a3b8',
        'neutral-500': '#64748b',
        'neutral-600': '#475569',
        'neutral-700': '#334155',
        'neutral-800': '#1e293b',
        'neutral-900': '#0f172a',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        'serif': ['Playfair Display', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      boxShadow: {
        'soft-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
} satisfies Config
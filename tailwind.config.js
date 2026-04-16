/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fi: {
          green:       '#1D9E75',
          'green-light': '#E1F5EE',
          'green-dark':  '#085041',
          amber:       '#BA7517',
          'amber-light': '#FAEEDA',
          red:         '#A32D2D',
          'red-light':   '#FCEBEB',
          blue:        '#185FA5',
          'blue-light':  '#E6F1FB',
          purple:      '#534AB7',
          'purple-light':'#EEEDFE',
          gray:        '#5F5E5A',
          'gray-light':  '#F1EFE8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fadeIn 0.35s ease',
        'slide-up':   'slideUp 0.3s ease',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

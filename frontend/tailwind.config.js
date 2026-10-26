/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mine: {
          dark: '#0B0F17',
          card: '#121824',
          border: '#1E293B',
          hover: '#1B2436',
          accent: '#00F0FF',
          danger: '#FF3366',
          warning: '#F59E0B',
          success: '#10B981',
          muted: '#64748B'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-danger': 'glowDanger 1.5s ease-in-out infinite alternate'
      },
      keyframes: {
        glowDanger: {
          '0%': { boxShadow: '0 0 5px rgba(255, 51, 102, 0.4), inset 0 0 5px rgba(255, 51, 102, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 51, 102, 0.8), inset 0 0 10px rgba(255, 51, 102, 0.4)' }
        }
      }
    }
  },
  plugins: []
};

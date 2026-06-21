/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Base colors
        dark: '#0A0F0D',
        gold: '#FBBF24',
        green: '#10B981',
        
        // FinCash brand colors
        'fincash': {
          'green': '#10B981',
          'green-light': '#34D399',
          'green-lighter': '#6EE7B7',
          'green-dark': '#059669',
          'gold': '#FBBF24',
          'gold-light': '#FCD34D',
          'dark': '#0A0F0D',
          'darker': '#050706',
          'darkest': '#020302',
          'border': '#1A2E2A',
          'text': '#E8F0ED',
          'text-muted': '#94A3B8',
        },
        
        // Semantic colors
        'positive': '#10B981',
        'positive-light': '#D1FAE5',
        'negative': '#EF4444',
        'negative-light': '#FEE2E2',
        'expense': '#F87171',
        'expense-light': '#FEF2F2',
        'asset': '#60A5FA',
        'liability': '#F87171',
      },
      
      // Custom gradients via backgroundImage
      backgroundImage: {
        // Primary gradient for headers and buttons
        'fincash-gradient': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'fincash-gradient-hover': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        
        // Card header gradients (lighter variant)
        'fincash-card-header': 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)',
        
        // Progress bar gradients
        'progress-positive': 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
        'progress-negative': 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
        
        // Bar chart gradients
        'bar-income': 'linear-gradient(90deg, #10B981 0%, #6EE7B7 100%)',
        'bar-expenses': 'linear-gradient(90deg, #F87171 0%, #FCA5A5 100%)',
        'bar-cashflow': 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
        'bar-assets': 'linear-gradient(90deg, #FBBF24 0%, #FCD34D 100%)',
        'bar-liabilities': 'linear-gradient(90deg, #F87171 0%, #FCA5A5 100%)',
        
        // Scrollbar gradient
        'scrollbar': 'linear-gradient(135deg, #10B981 0%, #FBBF24 100%)',
      },
      
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 1vw + 0.5rem, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 1.5vw + 0.5rem, 1rem)',
        'fluid-base': 'clamp(1rem, 2vw + 0.5rem, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 2.5vw + 0.5rem, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 3vw + 0.5rem, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 3.5vw + 0.5rem, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 4vw + 0.5rem, 2.5rem)',
      },
      
      spacing: {
        'mobile-xs': '0.5rem',
        'mobile-sm': '0.75rem',
        'mobile-md': '1rem',
        'mobile-lg': '1.5rem',
        'desktop-xs': '1rem',
        'desktop-sm': '1.5rem',
        'desktop-md': '2rem',
        'desktop-lg': '3rem',
      },
      
      borderRadius: {
        'card': '16px',
        'card-header': '12px',
        'button': '10px',
        'input': '8px',
        'pill': '999px',
      },
      
      boxShadow: {
        'card': '0 4px 15px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 6px 20px rgba(16, 185, 129, 0.2)',
        'header': '0 4px 12px rgba(16, 185, 129, 0.3)',
        'button': '0 4px 12px rgba(52, 211, 153, 0.4)',
        'button-hover': '0 4px 12px rgba(16, 185, 129, 0.3)',
        'input-focus': '0 0 0 2px rgba(52, 211, 153, 0.2)',
        'bar': '0 6px 18px rgba(0, 0, 0, 0.4)',
        'progress': '0 4px 10px rgba(16, 185, 129, 0.18)',
        'graph-card': '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
      },
      
      animation: {
        'spin-slow': 'spin 1s linear infinite',
      },
      
      minHeight: {
        'touch': '44px', // Minimum touch target size
      },
    },
  },
  plugins: [],
}

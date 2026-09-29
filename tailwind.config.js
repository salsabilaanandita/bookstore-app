/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-card': 'var(--color-surface-card)',
        'surface-sand': 'var(--color-surface-sand)',
        'surface-subtle': 'var(--color-surface-subtle)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-subtle': 'var(--color-accent-subtle)',
        'accent-dark': 'var(--color-accent-dark)',
        sage: 'var(--color-sage)',
        'sage-light': 'var(--color-sage-light)',
        'sage-subtle': 'var(--color-sage-subtle)',
        success: 'var(--color-success)',
        'success-subtle': 'var(--color-success-subtle)',
        warning: 'var(--color-warning)',
        'warning-subtle': 'var(--color-warning-subtle)',
        error: 'var(--color-error)',
        'error-subtle': 'var(--color-error-subtle)',
      },
      borderRadius: {
        cover: 'var(--radius-cover)',
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
        pill: 'var(--radius-pill)',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['15px', { lineHeight: '22px' }],
        lg: ['17px', { lineHeight: '24px' }],
        xl: ['22px', { lineHeight: '28px' }],
        '2xl': ['30px', { lineHeight: '36px' }],
      },
      fontFamily: {
        sans: ['InterVariable', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        cover: 'var(--shadow-cover)',
        modal: 'var(--shadow-modal)',
      }
    },
  },
  plugins: [],
}

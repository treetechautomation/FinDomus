import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        positive: {
          DEFAULT: 'hsl(var(--positive))',
          foreground: 'hsl(var(--positive-foreground))',
        },
        negative: {
            DEFAULT: 'hsl(var(--negative))',
            foreground: 'hsl(var(--negative-foreground))',
        },
        fdl: {
          canvas: 'var(--fd-color-canvas)',
          surface: 'var(--fd-color-surface)',
          'surface-raised': 'var(--fd-color-surface-raised)',
          'surface-floating': 'var(--fd-color-surface-floating)',
          overlay: 'var(--fd-color-overlay)',
          'overlay-scrim': 'var(--fd-color-overlay-scrim)',
          'text-primary': 'var(--fd-color-text-primary)',
          'text-secondary': 'var(--fd-color-text-secondary)',
          'text-tertiary': 'var(--fd-color-text-tertiary)',
          'text-disabled': 'var(--fd-color-text-disabled)',
          'border-subtle': 'var(--fd-color-border-subtle)',
          'border-default': 'var(--fd-color-border-default)',
          'border-emphasis': 'var(--fd-color-border-emphasis)',
          'action-primary': 'var(--fd-color-action-primary)',
          'action-primary-hover': 'var(--fd-color-action-primary-hover)',
          'action-primary-pressed': 'var(--fd-color-action-primary-pressed)',
          'action-primary-soft': 'var(--fd-color-action-primary-soft)',
          'action-focus': 'var(--fd-color-action-focus)',
          'state-positive': 'var(--fd-color-state-positive)',
          'state-positive-soft': 'var(--fd-color-state-positive-soft)',
          'state-warning': 'var(--fd-color-state-warning)',
          'state-warning-soft': 'var(--fd-color-state-warning-soft)',
          'state-negative': 'var(--fd-color-state-negative)',
          'state-negative-soft': 'var(--fd-color-state-negative-soft)',
          'state-information': 'var(--fd-color-state-information)',
          premium: 'var(--fd-color-premium)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        'fd-1': 'var(--fd-space-1)',
        'fd-2': 'var(--fd-space-2)',
        'fd-3': 'var(--fd-space-3)',
        'fd-4': 'var(--fd-space-4)',
        'fd-6': 'var(--fd-space-6)',
        'fd-8': 'var(--fd-space-8)',
        'fd-12': 'var(--fd-space-12)',
        'fd-16': 'var(--fd-space-16)',
      },
      fontSize: {
        'fd-hero': ['var(--fd-type-financial-hero-size)', { lineHeight: 'var(--fd-type-financial-hero-line-height)', fontWeight: 'var(--fd-type-financial-hero-weight)' }],
        'fd-h1': ['var(--fd-type-heading-1-size)', { lineHeight: 'var(--fd-type-heading-1-line-height)', fontWeight: 'var(--fd-type-heading-1-weight)' }],
        'fd-h2': ['var(--fd-type-heading-2-size)', { lineHeight: 'var(--fd-type-heading-2-line-height)', fontWeight: 'var(--fd-type-heading-2-weight)' }],
        'fd-h3': ['var(--fd-type-heading-3-size)', { lineHeight: 'var(--fd-type-heading-3-line-height)', fontWeight: 'var(--fd-type-heading-3-weight)' }],
        'fd-body': ['var(--fd-type-body-size)', { lineHeight: 'var(--fd-type-body-line-height)', fontWeight: 'var(--fd-type-body-weight)' }],
        'fd-supporting': ['var(--fd-type-supporting-size)', { lineHeight: 'var(--fd-type-supporting-line-height)', fontWeight: 'var(--fd-type-supporting-weight)' }],
        'fd-caption': ['var(--fd-type-caption-size)', { lineHeight: 'var(--fd-type-caption-line-height)', fontWeight: 'var(--fd-type-caption-weight)' }],
        'fd-button': ['var(--fd-type-button-size)', { lineHeight: 'var(--fd-type-button-line-height)', fontWeight: 'var(--fd-type-button-weight)' }],
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        'fd-float': 'var(--fd-shadow-float)',
        'fd-overlay': 'var(--fd-shadow-overlay)',
      },
      backdropBlur: {
        'fd-subtle': '8px',
        'fd-standard': '12px',
        'fd-strong': '20px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

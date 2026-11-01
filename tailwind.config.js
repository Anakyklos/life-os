import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "oled": "#050505", // Absolute OLED Black
        "glass": "rgba(24, 24, 27, 0.4)", // Standard Glass
        "glass-surface": "rgba(24, 24, 27, 0.4)",
        "glass-border": "rgba(255, 255, 255, 0.05)",
        "primary": "#308ce8", // Electric Blue - text/accent token
        "primary-cta": "#1975d2", // CTA background: white text passes AA (4.65:1)
        "success": "#10b981",
        "warning": "#ef4444",
        "background-light": "#f6f7f8",
        "background-dark": "#050505",
        "accent-glow": "rgba(48, 140, 232, 0.15)",

        // tremor colors
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
        // dark mode tremor colors
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: "#172554",
            subtle: "#1e40af",
            DEFAULT: "#3b82f6",
            emphasis: "#60a5fa",
            inverted: "#030712",
          },
          background: {
            muted: "#131A2B",
            subtle: "#1f2937",
            DEFAULT: "#111827",
            emphasis: "#d1d5db",
          },
          border: {
            DEFAULT: "#1f2937",
          },
          ring: {
            DEFAULT: "#1f2937",
          },
          content: {
            subtle: "#4b5563",
            DEFAULT: "#6b7280",
            emphasis: "#e5e7eb",
            strong: "#f9fafb",
            inverted: "#000000",
          },
        },

        // Keeping existing semantic colors mapping for compatibility
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        'surface-highlight': 'hsl(var(--surface-highlight))',
        border: 'rgba(255, 255, 255, 0.08)',
        input: 'hsl(var(--input))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      boxShadow: {
        // tremor shadows
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark mode tremor shadows
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

        "glass": "0 20px 60px rgba(0, 0, 0, 0.80)",
        "ambient": "0 0 0 1px rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.60)"
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",

        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
      backdropBlur: {
        'xl': '24px',
        '2xl': '40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'enter': 'enter 0.6s ease-out forwards',
        'breathe': 'breathe 4s ease-in-out infinite',
        'draw': 'draw 1.5s ease-out forwards',
      },
      keyframes: {
        enter: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        draw: {
          '0%': { height: '0%' },
          '100%': { height: 'var(--target-height)' },
        }
      }
    },
  },
  plugins: [
    tailwindcssAnimate,
    containerQueries,
    forms,
  ],
}

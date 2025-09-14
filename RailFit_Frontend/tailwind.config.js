/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Existing shadcn/ui colors (preserved)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // RailFIT Indian Railways Color Scheme
        primary: {
          DEFAULT: "#003f7f", // Indian Railways Blue
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#003f7f", // Main IR Blue
          600: "#002d5c",
          700: "#001d3d",
          800: "#001427",
          900: "#000a14",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#64748b", // Neutral gray
          foreground: "#f8fafc",
        },

        // Status Colors
        success: {
          DEFAULT: "#10b981", // Green for healthy assets
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b", // Amber for maintenance
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#ef4444", // Red for critical alerts
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          foreground: "#ffffff",
        },

        // Railway specific colors
        rail: {
          blue: "#003f7f",
          orange: "#ff6600", // IR Orange accent
          gray: "#64748b",
          light: "#f8fafc",
        },

        // Legacy colors (preserved for compatibility)
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}


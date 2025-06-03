/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#10a37f",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // She Hulk Green brand colors
        brand: {
          light: "#4ade80", // Light green
          DEFAULT: "#16a34a", // Medium green
          dark: "#166534", // Dark green
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
        "border-pulse": {
          "0%, 100%": {
            "border-color": "#10a37f",
            "box-shadow": "0 0 0 0 rgba(16, 163, 127, 0.7)",
          },
          "50%": {
            "border-color": "#fff",
            // "border-color": "#4ade80",
            "box-shadow": "0 0 20px 5px rgba(74, 222, 128, 0.4)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            "box-shadow": "0 0 0 0 rgba(16, 163, 127, 0.1)",
          },
          "50%": {
            "box-shadow": "0 0 20px 10px rgba(16, 163, 127, 0.2)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-pulse": "border-pulse 1s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-border": "linear-gradient(90deg, #10a37f, #4ade80, #10a3f7f)",
      },
      // Removed gradient animations and background images
    },
  },
  plugins: [],
};

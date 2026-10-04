/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        // Deep navy used for the sidebar and brand surfaces
        ink: {
          950: "#0a1428",
          900: "#0f1d3a",
          800: "#16284d",
          700: "#1f3560",
          600: "#2b4475",
        },
        brand: {
          50: "#eef3ff",
          100: "#dbe5ff",
          200: "#bfd0ff",
          300: "#93b0fd",
          400: "#6087f9",
          500: "#3b63f3",
          600: "#2647e3",
          700: "#1e37c8",
          800: "#1f31a2",
          900: "#1f2f80",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 29, 58, 0.04), 0 1px 3px rgba(15, 29, 58, 0.06)",
        elevated: "0 10px 30px -12px rgba(15, 29, 58, 0.25)",
      },
    },
  },
  plugins: [],
};

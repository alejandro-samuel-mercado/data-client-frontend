/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5", 
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#EC4899",
          foreground: "#FFFFFF",
        },
        background: "#F3F4F6",
        card: "#FFFFFF",
        text: "#1F2937",
        muted: "#9CA3AF",
      },
    },
  },
  plugins: [],
}

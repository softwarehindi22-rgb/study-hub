/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a2e",
        accent: "#6c5ce7"
      }
    }
  },
  plugins: []
};

module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.js",
    "./pages/**/*.{md,mdx}",
    "./theme.config.tsx",
  ],
  plugins: [require("@tailwindcss/typography")],
};

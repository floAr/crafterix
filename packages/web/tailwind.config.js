/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // PoE-inspired color palette
        poe: {
          bg: "#0c0c0e",
          panel: "#1a1a1f",
          border: "#3d3d3d",
          normal: "#c8c8c8",
          magic: "#8888ff",
          rare: "#ffff77",
          unique: "#af6025",
          currency: "#aa9e82",
          gem: "#1ba29b",
        },
      },
      fontFamily: {
        poe: ["Fontin", "serif"],
      },
    },
  },
  plugins: [],
};

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f5e6c8",
        "dark-wizard": "#0d0221",
        "wizard-purple": "#2d1b69",
        "wizard-deep": "#1a0a3e",
        "wizard-gold": "#d4a843",
        "wizard-gold-light": "#f0d78c",
        "wizard-crimson": "#9b1b30",
        "wizard-emerald": "#1a7a4c",
        "wizard-bronze": "#b87333",
        "wizard-slate": "#2a2545",
        "wizard-mist": "#3d3566",
      },
      fontFamily: {
        serif: ['"Crimson Text"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'serif'],
      },
      boxShadow: {
        glow: "0 0 15px rgba(212, 168, 67, 0.3)",
        "glow-lg": "0 0 30px rgba(212, 168, 67, 0.4)",
      },
    },
  },
  plugins: [],
};

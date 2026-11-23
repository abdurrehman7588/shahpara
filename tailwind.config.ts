import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vintage palette: off-white letter paper, beige, walnut and sepia browns, antique gold.
        // ("stamp" is the brand brown #916924, chosen by Shahpara; used for buttons, links and accents.
        //  Text on it uses paper-bright for legibility; long-text bands use the darker stamp-deep.)
        paper: { DEFAULT: "#F6F0E4", deep: "#EBE0CC", edge: "#DDCDB0", bright: "#FFFDF8" },
        ink: { DEFAULT: "#2B2018", soft: "#56473A", mute: "#76665A" },
        stamp: { DEFAULT: "#916924", deep: "#6B4C17", light: "#AA8541" },
        turmeric: { DEFAULT: "#A0702E", text: "#7D5420", light: "#D8B47A" },
        rose: { DEFAULT: "#C29A86", deep: "#8E4B3E", wash: "#F0E1D6" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        urdu: ["var(--font-urdu)", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8.2vw, 7.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.5rem, 5.6vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 3.8vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-sm": ["clamp(1.5rem, 2.4vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
      },
      letterSpacing: { label: "0.22em" },
      keyframes: {
        "scroll-cue": { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(200%)" } },
      },
      maxWidth: { site: "88rem" },
      transitionTimingFunction: {
        paper: "cubic-bezier(0.22, 1, 0.36, 1)",
        ink: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};
export default config;

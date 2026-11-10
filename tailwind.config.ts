import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Taken from the Shahpara stamp logo and the existing site accent.
        paper: { DEFAULT: "#F7F1E6", deep: "#EDE3D1", edge: "#E2D5BE" },
        ink: { DEFAULT: "#1E1B16", soft: "#4A443B", mute: "#6B6358" },
        stamp: { DEFAULT: "#1F4A3A", deep: "#163629", light: "#2E6350" },
        turmeric: { DEFAULT: "#A56600", text: "#8A5500", light: "#D9A54A" },
        rose: { DEFAULT: "#C9908A", deep: "#9E4F52", wash: "#F1DEDA" },
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
      maxWidth: { site: "88rem" },
      transitionTimingFunction: {
        paper: "cubic-bezier(0.22, 1, 0.36, 1)",
        ink: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: { marquee: "marquee 40s linear infinite" },
    },
  },
  plugins: [],
};
export default config;

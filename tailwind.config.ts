import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colours from the live shahpara.pk theme: white page, dark brown text (#2B2018, #56473A, #76665A),
        // brand amber #A56600 for buttons, links, headings and accents, gold #E0AF43 for accents on dark bands.
        // (Token names are kept from the earlier vintage palette so no component had to change.
        //  Text on amber uses paper-bright; long-text bands use the darker stamp-deep. "rose" stays for errors and sale badges.)
        paper: { DEFAULT: "#FFFFFF", deep: "#F9F9F9", edge: "#EAEAEA", bright: "#FFFFFF" },
        ink: { DEFAULT: "#2B2018", soft: "#56473A", mute: "#76665A" },
        stamp: { DEFAULT: "#A56600", deep: "#774A00", light: "#E0AF43" },
        turmeric: { DEFAULT: "#A56600", text: "#A56600", light: "#E0AF43" },
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

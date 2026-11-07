import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * Establishes a global minimum font size baseline (12px / 0.75rem) across all
 * typography tokens via `theme.extend.fontSize`, ensuring all components
 * inherit a legible baseline scale across desktop and mobile viewports.
 */
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        // Global minimum font-size clamp: micro/tiny tokens floor at 12px (0.75rem)
        "2xs": ["0.75rem", { lineHeight: "1.125rem" }], // 12px minimum floor
        xs: ["0.75rem", { lineHeight: "1.125rem" }],    // 12px (global minimum baseline)
        sm: ["0.875rem", { lineHeight: "1.375rem" }],   // 14px
        base: ["1rem", { lineHeight: "1.6rem" }],       // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
        xl: ["1.25rem", { lineHeight: "1.85rem" }],     // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
        "5xl": ["3rem", { lineHeight: "1.15" }],        // 48px
        "6xl": ["3.75rem", { lineHeight: "1.1" }],      // 60px
        "7xl": ["4.5rem", { lineHeight: "1.08" }],      // 72px
      },
    },
  },
  plugins: [],
};

export default config;

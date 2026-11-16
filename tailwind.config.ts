import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { night: "#0F0D2E", deep: "#1E1B4B", gold: "#C9A227", ivory: "#F7F3E8", sage: "#7C9A8B" },
      fontFamily: { serif: ["var(--font-serif)", "serif"], sans: ["var(--font-sans)", "sans-serif"] },
    },
  },
} satisfies Config;

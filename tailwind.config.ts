// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        korean1: ["KoreanSWGIG1", "sans-serif"],
        korean2: ["KoreanSWGIG2", "sans-serif"],
        korean3: ["KoreanSWGIG3", "sans-serif"],
        korean4: ["KoreanSWGIG4", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

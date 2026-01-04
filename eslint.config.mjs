//@ts-check
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig } from "eslint/config";

const config = defineConfig([
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    ignores: [
      "apps/web/.next/**",
      "apps/web/out/**",
      "apps/web/build/**",
      "apps/web/next-env.d.ts",
    ],
    extends: [nextVitals, nextTs],
  },
]);

export default config;

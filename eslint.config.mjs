//@ts-check
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig } from 'eslint/config'

const config = defineConfig([
  {
    files: ['apps/web/src/**/*.{ts,tsx}', 'apps/web/next.config.ts'],
    extends: [nextVitals, nextTs],
  },
  prettierRecommended,
])

export default config

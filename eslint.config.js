/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintPlugin from 'eslint-plugin-eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

const config = defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.turbo/**',
    '**/.next/**',
    'apps/web/next-env.d.ts',
    '**/coverage/**',
  ]),
  {
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.js',
            'prettier.config.js',
            'apps/web/postcss.config.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    extends: [nextVitals, nextTs, reactHooks.configs.flat.recommended],
    settings: {
      next: {
        rootDir: ['apps/web'],
      },
    },
  },
  eslintPlugin.configs['all-type-checked'],
  {
    plugins: {
      import: importPlugin,
    },
    files: ['{packages,apps}/*/src/**/*.{ts,tsx}'],
    rules: {
      'import/extensions': [
        'error',
        'never',
        {
          ts: 'always',
        },
      ],
    },
  },
  prettierRecommended,
])

export default config

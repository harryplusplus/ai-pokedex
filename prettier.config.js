//@ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-pg',
    'prettier-plugin-tailwindcss',
  ],
}

/** @type {import('prettier-plugin-pg').PgOptions} */
const pgOptions = {
  pgSpaces: 2,
}

export default {
  ...config,
  ...pgOptions,
}

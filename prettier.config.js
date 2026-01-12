//@ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-sql-tag-pg',
    'prettier-plugin-tailwindcss',
  ],
}

/** @type {import('prettier-plugin-sql-tag-pg').SqlTagPgOptions} */
const sqlTagPgOptions = {
  sqlTagPgSpaces: 2,
}

export default {
  ...config,
  ...sqlTagPgOptions,
}

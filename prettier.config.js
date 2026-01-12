//@ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-sql-pg-formatter',
    'prettier-plugin-tailwindcss',
  ],
  sqlPgFormatterSpaces: 2,
}

export default config

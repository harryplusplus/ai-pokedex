//@ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-sql-exec',
    'prettier-plugin-tailwindcss',
  ],
  sqlExecCommand: 'perl pgFormatter/pg_format',
}

export default config

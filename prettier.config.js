//@ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-embed',
    'prettier-plugin-sql-adapter',
    'prettier-plugin-tailwindcss',
  ],
}

/** @type {import('prettier-plugin-sql-adapter').SqlAdapterOptions} */
const sqlAdapterOptions = {
  //
}

export default {
  ...config,
  ...sqlAdapterOptions,
}

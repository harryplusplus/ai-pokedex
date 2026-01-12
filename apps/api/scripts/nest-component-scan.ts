import { run, watch } from 'nest-component-scan'

async function main() {
  const args = process.argv.slice(2)
  const isRun = args.some((x) => x === '--run')

  const abortController = new AbortController()

  process.on('SIGINT', () => {
    abortController.abort()
  })

  if (isRun) {
    await run({
      pattern: 'src/**/*.ts',
      ignore: ['**/*.spec.ts'],
    })
  } else {
    await watch({
      paths: 'src',
      ignored: /\.spec\.ts$/,
      signal: abortController.signal,
    })
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

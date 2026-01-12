import { run, watch } from 'nest-component-scan'

async function main() {
  const args = process.argv.slice(2)
  const isRun = args.some((x) => x === '--run')

  const abortController = new AbortController()

  process.on('SIGINT', () => {
    abortController.abort()
  })

  const opts = {
    paths: 'src',
    ignores: '**/*.spec.ts',
    signal: abortController.signal,
  }

  if (isRun) {
    await run(opts)
  } else {
    await watch(opts)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

import { watch } from '@repo/nest-component-scan'

async function main() {
  const abortController = new AbortController()

  process.on('SIGINT', () => {
    abortController.abort()
  })

  await watch({
    paths: 'src',
    signal: abortController.signal,
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

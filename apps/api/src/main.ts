import { Container } from 'es-di'

import { App } from './app.ts'

async function main() {
  const container = new Container()

  const app = await container.resolve(App)
  await app.check()

  await container.destroy()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

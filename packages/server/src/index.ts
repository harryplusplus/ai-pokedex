import { Container } from 'esdi'

import { App } from './app.ts'

export async function main() {
  const container = new Container()

  const app = await container.resolve(App)
  await app.check()

  await container.destroy()
}

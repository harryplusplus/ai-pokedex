import { run } from '@repo/nest-component-scan'

run({
  glob: {
    pattern: 'src/**/*.ts',
    ignore: ['**/*.spec.ts'],
  },
}).catch((e) => {
  console.error(e)
  process.exit(1)
})

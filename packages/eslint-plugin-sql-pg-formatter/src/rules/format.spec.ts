import { RuleTester } from 'eslint'
import { beforeAll, it } from 'vitest'

import format from './format.js'

let ruleTester: RuleTester
let run: (tests: Parameters<RuleTester['run']>[2]) => void

beforeAll(() => {
  ruleTester = new RuleTester()
  run = (tests) => ruleTester.run('format', format, tests)
})

it(`sql\`\``, () => {
  run({
    valid: [
      {
        code: `sql\`\``,
      },
    ],
    invalid: [],
  })
})

it(`sql\`select * from users\``, () => {
  run({
    valid: [
      {
        code: `sql\`
select
    *
from
    users\``,
      },
    ],
    invalid: [],
  })
})

import { RuleTester } from 'eslint'
import { beforeAll, it } from 'vitest'

import format from './format.js'

let ruleTester: RuleTester

beforeAll(() => {
  ruleTester = new RuleTester()
})

it('check format rules', () => {
  ruleTester.run('format', format, {
    valid: [
      {
        code: 'sql`${a}`',
      },
    ],
    invalid: [
      // {
      //   code: 'var invalidVariable = true',
      //   errors: [{ message: 'Unexpected invalid variable.' }],
      // },
      // {
      //   code: 'var invalidVariable = true',
      //   errors: [{ message: /^Unexpected.+variable/ }],
      // },
    ],
  })
})

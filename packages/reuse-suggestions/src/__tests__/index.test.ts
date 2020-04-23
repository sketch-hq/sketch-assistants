import { resolve } from 'path'
import { testRule } from '@sketch-hq/sketch-assistant-utils'

import Assistant from '..'

test('hello-world', async () => {
  expect.assertions(2)

  const { violations, errors } = await testRule(
    resolve(__dirname, './empty.sketch'),
    Assistant,
    '@sketch-hq/sketch-reuse-suggestions-assistant/hello-world',
  )

  expect(violations[0].message).toMatchInlineSnapshot(`"Hello world"`)
  expect(errors).toHaveLength(0)
})

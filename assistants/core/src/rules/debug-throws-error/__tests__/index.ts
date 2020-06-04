import { testRule } from '../../../test-helpers'

describe('debug-throws-error', () => {
  test('throws an error', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './empty.sketch',
      'debug-throws-error',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(1)
  })
})

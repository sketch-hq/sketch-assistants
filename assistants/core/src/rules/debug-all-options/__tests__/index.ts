import { testRule } from '../../../test-helpers'

describe('debug-all-options', () => {
  test('does not error or produce violations', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './empty.sketch',
      'debug-all-options',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

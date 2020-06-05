import { testCoreRule } from '../../../test-helpers'

describe('debug-throws-error', () => {
  test('throws an error', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'debug-throws-error',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(1)
  })
})

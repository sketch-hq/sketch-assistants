import { testCoreRule } from '../../../test-helpers'

describe('symbols-no-detached', () => {
  test('finds violations for detached symbols', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './detached-symbol.sketch',
      'symbols-no-detached',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations normal symbol usage', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './attached-symbol.sketch',
      'symbols-no-detached',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

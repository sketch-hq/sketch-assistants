import { testCoreRule } from '../../../test-helpers'

describe('symbols-no-unsued', () => {
  test('no violations for symbol usage', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './used-symbol.sketch',
      'symbols-no-unused',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for unused shared styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './unused-symbol.sketch',
      'symbols-no-unused',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for symbols used in overrides', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './used-in-override.sketch',
      'symbols-no-unused',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

import { testRule } from '../../../test-helpers'

describe('symbols-no-unsued', () => {
  test('no violations for symbol usage', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './used-symbol.sketch',
      'symbols-no-unused',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for unused shared styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './unused-symbol.sketch',
      'symbols-no-unused',
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

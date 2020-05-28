import { testRule } from '../../../test-helpers'

describe('layers-no-loose', () => {
  test('has no violations for layers in an artboard', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './no-loose-layer.sketch',
      'layers-no-loose',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for loose layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './loose-layer.sketch',
      'layers-no-loose',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for loose symbol layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './loose-layer-symbol.sketch',
      'layers-no-loose',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

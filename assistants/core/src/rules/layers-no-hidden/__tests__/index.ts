import { testRule } from '../../../test-helpers'

describe('layers-no-hidden', () => {
  test('no violations for visible layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './visible-layer.sketch',
      'layers-no-hidden',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for hidden layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './hidden-layer.sketch',
      'layers-no-hidden',
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

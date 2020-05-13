import { testRule } from '../../../test-helpers'

describe('images-no-outsized', () => {
  test('no violations when a bitmap is used correctly at least once', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './multi-use-bitmap.sketch',
      'images-no-outsized',
      {
        active: true,
        maxRatio: 2,
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for outsized bitmap use', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './outsized-bitmap.sketch',
      'images-no-outsized',
      {
        active: true,
        maxRatio: 2,
      },
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for outsized bitmap fills in layer styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './outsized-bitmap-fill.sketch',
      'images-no-outsized',
      {
        active: true,
        maxRatio: 2,
      },
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

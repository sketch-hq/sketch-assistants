import { testRule } from '../../../test-helpers'

describe('borders-no-disabled', () => {
  test('no violations for enabled borders', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './enabled-border.sketch',
      'borders-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for disabled borders', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './disabled-border.sketch',
      'borders-no-disabled',
    )

    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('no violations for disabled borders in combined shapes', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './disabled-border-combined-shape.sketch',
      'borders-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })
})

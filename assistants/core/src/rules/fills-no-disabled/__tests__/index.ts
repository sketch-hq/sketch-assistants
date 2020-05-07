import { testRule } from '../../../test-helpers'

describe('fills-no-disabled', () => {
  test('outputs no violations for enabled fills', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './enabled-fill.sketch',
      'fills-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for disabled fills', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './disabled-fill.sketch',
      'fills-no-disabled',
    )

    expect(violations).toHaveLength(2)
    // ^ tests for disabled style in the layer and in the shared style
    expect(errors).toHaveLength(0)
  })

  test('finds violations for disabled fills in shared styles while enabled on the layer', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './disabled-shared-fill.sketch',
      'fills-no-disabled',
    )

    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

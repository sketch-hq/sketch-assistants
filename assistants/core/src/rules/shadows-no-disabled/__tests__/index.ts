import { testRule } from '../../../test-helpers'

describe('shadows-no-disabled', () => {
  test('no violations for enabled shadows', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './enabled-shadow.sketch',
      'shadows-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for disabled shadows', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './disabled-shadow.sketch',
      'shadows-no-disabled',
    )

    expect(violations).toHaveLength(2)
    // ^ tests for disabled style in the layer and in the shared style
    expect(errors).toHaveLength(0)
  })

  test('finds violations for disabled shadows in shared styles while enabled on the layer', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './disabled-shared-shadow.sketch',
      'shadows-no-disabled',
    )

    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

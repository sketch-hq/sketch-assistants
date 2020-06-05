import { testCoreRule } from '../../../test-helpers'

describe('fills-no-disabled', () => {
  test('outputs no violations for enabled fills', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './enabled-fill.sketch',
      'fills-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for disabled fills', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './disabled-fill.sketch',
      'fills-no-disabled',
    )

    expect(violations).toHaveLength(2)
    // ^ tests for disabled style in the layer and in the shared style
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for disabled fills in shared styles while enabled on the layer', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './disabled-shared-fill.sketch',
      'fills-no-disabled',
    )

    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

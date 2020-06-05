import { testCoreRule } from '../../../test-helpers'

describe('inner-shadows-no-disabled', () => {
  test('no violations for enabled inner shadows', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './enabled-inner-shadows.sketch',
      'inner-shadows-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for disabled inner shadows', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './disabled-inner-shadows.sketch',
      'inner-shadows-no-disabled',
    )

    expect(violations).toHaveLength(2)
    // ^ tests for disabled style in the layer and in the shared style
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for disabled inner shadows in shared styles while enabled on the layer', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './disabled-shared-inner-shadows.sketch',
      'inner-shadows-no-disabled',
    )

    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

import { testCoreRule } from '../../../test-helpers'

describe('borders-no-disabled', () => {
  test('no violations for enabled borders', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './enabled-border.sketch',
      'borders-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for disabled borders', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './disabled-border.sketch',
      'borders-no-disabled',
    )

    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for disabled borders in combined shapes', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './disabled-border-combined-shape.sketch',
      'borders-no-disabled',
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

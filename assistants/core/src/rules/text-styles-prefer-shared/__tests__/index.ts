import { testCoreRule } from '../../../test-helpers'

describe('text-styles-prefer-shared', () => {
  test('finds violations for identical text styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './duplicate-text-styles.sketch',
      'text-styles-prefer-shared',
      { active: true, maxIdentical: 1 },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when maxIdentical option is increased to allow up to 2 identical text styles', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './duplicate-text-styles.sketch',
      'text-styles-prefer-shared',
      { active: true, maxIdentical: 2 },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for artboards and pages', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './artboards-and-pages.sketch',
      'text-styles-prefer-shared',
      { active: true, maxIdentical: 1 },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for layer styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './layer-styles.sketch',
      'text-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for shared style usage', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './duplicate-shared-text-styles.sketch',
      'text-styles-prefer-shared',
      { active: true, maxIdentical: 1 },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('only generate violations for duplicate text styles inside symbol masters, not instances', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './symbols.sketch',
      'text-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })
})

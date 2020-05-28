import { testRule } from '../../../test-helpers'

describe('layer-styles-prefer-shared', () => {
  test('finds violations for identical layer styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './duplicate-layer-styles.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when maxIdentical option is increased to allow up to 2 identical styles', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './duplicate-layer-styles.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 2,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for artboards and pages', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './artboards-and-pages.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for text layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './text-layers.sketch',
      'layer-styles-prefer-shared',
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
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './duplicate-shared-styles.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for groups with default styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './groups.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('only generate violations for duplicate styles inside symbol masters, not instances', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './symbols.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })

  test('do not generate violations from layers inside combined shapes', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './combined-shape.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

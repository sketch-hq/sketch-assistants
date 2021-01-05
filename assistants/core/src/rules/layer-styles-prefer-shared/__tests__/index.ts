import { testCoreRule } from '../../../test-helpers'

describe('layer-styles-prefer-shared', () => {
  test('finds violations for identical layer styles with bitmaps', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './unshared-layer-styles-bitmaps.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 2,
      },
    )
    expect(violations).toHaveLength(6)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for identical layer styles with bitmaps', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './shared-layer-styles-bitmaps.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 2,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for identical layer styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './duplicate-layer-styles.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when maxIdentical option is increased to allow up to 2 identical styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
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
    const { violations, ruleErrors } = await testCoreRule(
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
    const { violations, ruleErrors } = await testCoreRule(
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
    const { violations, ruleErrors } = await testCoreRule(
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
    const { violations, ruleErrors } = await testCoreRule(
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

  test('only generate violations for duplicate styles inside symbol masters, not instances', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './symbols.sketch',
      'layer-styles-prefer-shared',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('do not generate violations from layers inside combined shapes', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
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

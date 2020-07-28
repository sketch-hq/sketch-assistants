import { testCoreRule } from '../../../test-helpers'

describe('library-layer-styles-allowed-libraries', () => {
  test('no violations when standard layer styles are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './layer-style.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: ['library-layer-styles'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when local shared styles are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './local-shared-style.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: ['library-layer-styles'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when a valid library style is used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-layer-style.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: ['library-layer-styles'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when the libraries option is empty', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-layer-style.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports violations when an invalid library style is used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-layer-style.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('multiple problems are grouped', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './multi-library-layer-style.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1) // Two offending layers, but one violation
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for library layer styles in overrides', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-layer-style-override.sketch',
      'library-layer-styles-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

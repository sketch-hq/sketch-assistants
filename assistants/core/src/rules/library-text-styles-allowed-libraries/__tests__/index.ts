import { testCoreRule } from '../../../test-helpers'

describe('library-text-styles-allowed-libraries', () => {
  test('no violations when standard layer text styles are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './layer-text-style.sketch',
      'library-text-styles-allowed-libraries',
      {
        active: true,
        libraries: ['library-text-styles'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when local shared text styles are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './local-shared-text-style.sketch',
      'library-text-styles-allowed-libraries',
      {
        active: true,
        libraries: ['library-text-styles'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when a valid library text style is used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-text-style.sketch',
      'library-text-styles-allowed-libraries',
      {
        active: true,
        libraries: ['library-text-styles'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when libraries option is empty', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-text-style.sketch',
      'library-text-styles-allowed-libraries',
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
      './library-text-style.sketch',
      'library-text-styles-allowed-libraries',
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
      './multi-library-text-style.sketch',
      'library-text-styles-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1) // Two offending layers, but one violation
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for library text styles in overrides', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-text-style-override.sketch',
      'library-text-styles-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

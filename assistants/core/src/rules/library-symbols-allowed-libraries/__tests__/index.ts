import { testCoreRule } from '../../../test-helpers'

describe('library-symbols-allowed-libraries', () => {
  test('no violations when local symbols are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './local-symbol.sketch',
      'library-symbols-allowed-libraries',
      {
        active: true,
        libraries: ['library-symbols'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when a valid library symbol is used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-symbol.sketch',
      'library-symbols-allowed-libraries',
      {
        active: true,
        libraries: ['library-symbols'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when the libraries option is empty', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-symbol.sketch',
      'library-symbols-allowed-libraries',
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
      './library-symbol.sketch',
      'library-symbols-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for library symbols in overrides', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './library-symbol-override.sketch',
      'library-symbols-allowed-libraries',
      {
        active: true,
        libraries: ['authorized-library'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

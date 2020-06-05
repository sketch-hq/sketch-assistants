import { testCoreRule } from '../../../test-helpers'

describe('text-styles-prefer-library', () => {
  test('finds no violations if only library styles are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './all-good.sketch',
      'text-styles-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports violations when a text style differs from its library style', async (): Promise<
    void
  > => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './text-differs.sketch',
      'text-styles-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports violations when a text does not have a library style', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './text-no-library.sketch',
      'text-styles-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports violations if an unauthorized library is used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './all-good.sketch',
      'text-styles-prefer-library',
      {
        active: true,
        libraries: ['this-library-does-not-exist-but-is-the-only-authorized-one'],
      },
    )
    expect(violations).toHaveLength(2) // one violation per unauthorized library use
    expect(ruleErrors).toHaveLength(0)
  })
})

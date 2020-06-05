import { testCoreRule } from '../../../test-helpers'

describe('symbols-prefer-library', () => {
  test('finds no violations if only library symbols are used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './all-good.sketch',
      'symbols-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports violations when a symbol is used that does not belong to a library', async (): Promise<
    void
  > => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './local-symbol.sketch',
      'symbols-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports violations if an unauthorized library is used', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './all-good.sketch',
      'symbols-prefer-library',
      {
        active: true,
        libraries: ['this-library-does-not-exist-but-is-the-only-authorized-one'],
      },
    )
    expect(violations).toHaveLength(2) // one violation per unauthorized library use
    expect(ruleErrors).toHaveLength(0)
  })
})

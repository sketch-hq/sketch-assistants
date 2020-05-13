import { testRule } from '../../../test-helpers'

describe('symbols-prefer-library', () => {
  test('finds no violations if only library symbols are used', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './all-good.sketch',
      'symbols-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('reports violations when a symbol is used that does not belong to a library', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './local-symbol.sketch',
      'symbols-prefer-library',
      {
        active: true,
        libraries: [],
      },
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('reports violations if an unauthorized library is used', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './all-good.sketch',
      'symbols-prefer-library',
      {
        active: true,
        libraries: ['this-library-does-not-exist-but-is-the-only-authorized-one'],
      },
    )
    expect(violations).toHaveLength(2) // one violation per unauthorized library use
    expect(errors).toHaveLength(0)
  })
})

import { testRule } from '../../../test-helpers'

describe('shared-styles-no-unused', () => {
  test('no violations for shared style usage', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './used-shared-style.sketch',
      'shared-styles-no-unused',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('no violations when shared styles are used in an override', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './used-shared-style-overrides.sketch',
      'shared-styles-no-unused',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for unused shared styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './unused-shared-style.sketch',
      'shared-styles-no-unused',
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

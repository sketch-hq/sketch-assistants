import { testRule } from '../../../test-helpers'

describe('groups-no-similar', () => {
  test('reports no violations for groups without similarity', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './all-good.sketch',
      'groups-no-similar',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for groups that are similar', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './groups-one-similar.sketch',
      'groups-no-similar',
      {
        active: true,
        maxIdentical: 1,
      },
    )
    expect(violations).toHaveLength(2) // one violation per similar group
    expect(ruleErrors).toHaveLength(0)
  })

  test('reports no violations for a number of similar groups bellow the `maxIdentical` value', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './groups-one-similar.sketch',
      'groups-no-similar',
      {
        active: true,
        maxIdentical: 2,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

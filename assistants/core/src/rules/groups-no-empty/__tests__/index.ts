import { testRule } from '../../../test-helpers'

describe('groups-no-empty', () => {
  test('no violations for groups with contents', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './group-with-contents.sketch',
      'groups-no-empty',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for empty groups', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './empty-group.sketch',
      'groups-no-empty',
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

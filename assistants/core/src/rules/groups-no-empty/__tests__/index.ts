import { testCoreRule } from '../../../test-helpers'

describe('groups-no-empty', () => {
  test('no violations for groups with contents', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './group-with-contents.sketch',
      'groups-no-empty',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for empty groups', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty-group.sketch',
      'groups-no-empty',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for an empty document', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'groups-no-empty',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

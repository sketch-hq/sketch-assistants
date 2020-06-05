import { testCoreRule } from '../../../test-helpers'

describe('artboards-max-ungrouped-layers', () => {
  test('no violations when configured to allow max 5 ungrouped layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './5-ungrouped-artboard-layers.sketch',
      'artboards-max-ungrouped-layers',
      {
        active: true,
        maxUngroupedLayers: 5,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations when configured to allow max 4 ungrouped layers', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './5-ungrouped-artboard-layers.sketch',
      'artboards-max-ungrouped-layers',
      {
        active: true,
        maxUngroupedLayers: 4,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

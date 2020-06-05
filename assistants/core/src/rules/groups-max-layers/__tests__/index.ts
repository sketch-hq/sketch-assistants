import { testCoreRule } from '../../../test-helpers'

describe('groups-max-layers', () => {
  test('no violations for groups with valid layer counts', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './3-layer-group.sketch',
      'groups-max-layers',
      {
        active: true,
        maxLayers: 10,
        skipClasses: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for groups with too many layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './11-layer-group.sketch',
      'groups-max-layers',
      {
        active: true,
        maxLayers: 10,
        skipClasses: [],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('shape groups are ignored', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './11-layer-shape-group.sketch',
      'groups-max-layers',
      {
        active: true,
        maxLayers: 10,
        skipClasses: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('shape groups are ignored', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './11-layer-shape-group.sketch',
      'groups-max-layers',
      {
        active: true,
        maxLayers: 10,
        skipClasses: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('skip classes option works', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './6-artboard-page.sketch',
      'groups-max-layers',
      {
        active: true,
        maxLayers: 5,
        skipClasses: ['artboard'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('errors for missing config option', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './6-artboard-page.sketch',
      'groups-max-layers',
      {
        active: true,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(1)
  })
})

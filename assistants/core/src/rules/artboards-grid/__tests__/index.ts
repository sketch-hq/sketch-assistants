import { testRule } from '../../../test-helpers'

describe('artboards-grid', () => {
  test('no violations for artboards with valid grids', async (): Promise<void> => {
    expect.assertions(2)

    const { violations, errors } = await testRule(
      __dirname,
      './valid-grid-settings.sketch',
      'artboards-grid',
      { active: true, grids: [{ gridBlockSize: 5, thickLinesEvery: 10 }] },
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for artboards with missing grids', async (): Promise<void> => {
    expect.assertions(2)

    const { errors, violations } = await testRule(
      __dirname,
      './missing-grid-settings.sketch',
      'artboards-grid',
      { active: true, grids: [{ gridBlockSize: 5, thickLinesEvery: 10 }] },
    )

    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for artboards with invalid grids', async (): Promise<void> => {
    expect.assertions(2)

    const { violations, errors } = await testRule(
      __dirname,
      './invalid-grid-settings.sketch',
      'artboards-grid',
      { active: true, grids: [{ gridBlockSize: 5, thickLinesEvery: 10 }] },
    )

    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

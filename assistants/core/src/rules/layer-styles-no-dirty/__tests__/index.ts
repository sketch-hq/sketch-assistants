import { testRule } from '../../../test-helpers'

describe('layer-styles-no-dirty', () => {
  test('outputs no violations for layers that do not differ from their shared style', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './all_good.sketch',
      'layer-styles-no-dirty',
      {
        active: true,
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })
  test('finds violations for layer styles that differ from their shared styles', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './rectangles.sketch',
      'layer-styles-no-dirty',
      {
        active: true,
      },
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('outputs no violations for artboards and pages', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './artboards-and-pages.sketch',
      'layer-styles-no-dirty',
      {
        active: true,
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('outputs no violations for text layers', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './text-layers.sketch',
      'layer-styles-no-dirty',
      {
        active: true,
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for groups that differ from their shared style', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './groups_bad.sketch',
      'layer-styles-no-dirty',
      {
        active: true,
      },
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

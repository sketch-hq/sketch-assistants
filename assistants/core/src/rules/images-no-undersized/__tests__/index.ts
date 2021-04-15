import { testCoreRule } from '../../../test-helpers'

describe('images-no-undersized', () => {
  test('no violations when a bitmap is always used correctly', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './correctly-sized-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 1,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for undersized bitmap use', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './undersized-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for undersized bitmap use under a given ratio', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './undersized-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 0.8,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds no violations for undersized bitmap use above a given ratio', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './undersized-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 0.7,
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for bitmaps undersized only at the height', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './undersized-height-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for bitmaps undersized only at the width', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './undersized-width-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for bitmaps used correctly in other places', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './multi-use-bitmap.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for undersized bitmap fills in layer styles', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './undersized-bitmap-fill.sketch',
      'images-no-undersized',
      {
        active: true,
        minRatio: 1,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

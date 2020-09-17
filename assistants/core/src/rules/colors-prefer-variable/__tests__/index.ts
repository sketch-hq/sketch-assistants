import { testCoreRule } from '../../../test-helpers'

describe('colors-prefer-variable', () => {
  test('finds colors applied to text layers', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './colored-strings.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied to text layer attributed string', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './colored-substrings.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied to artboard backgrounds', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './artboard-backgrounds.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied to slice backgrounds', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './slice-backgrounds.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied to symbol master backgrounds', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './symbol-master-backgrounds.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied in style fills', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './style-fills.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied in style borders', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './style-borders.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied in style shadows', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './style-shadows.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds colors applied in style inner shadows', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './style-inner-shadows.sketch',
      'colors-prefer-variable',
      {
        active: true,
        maxIdentical: 0,
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

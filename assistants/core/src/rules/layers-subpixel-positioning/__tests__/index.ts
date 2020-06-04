import { testRule } from '../../../test-helpers'

describe('layers-subpixel-positioning', () => {
  test('no violations for whitelisted whole pixels', async (): Promise<void> => {
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './whole-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for whitelisted half pixels', async (): Promise<void> => {
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './half-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@2x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for whitelisted third pixels', async (): Promise<void> => {
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './third-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@3x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for illegal @2x positioning', async (): Promise<void> => {
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './half-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for illegal @3x positioning', async (): Promise<void> => {
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './third-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x', '@2x'],
      },
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for rotated layers or layers with rotated parents', async (): Promise<
    void
  > => {
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './rotated-layers.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

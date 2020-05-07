import { testRule } from '../../../test-helpers'

describe('layers-subpixel-positioning', () => {
  test('no violations for whitelisted whole pixels', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './whole-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('no violations for whitelisted half pixels', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './half-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@2x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('no violations for whitelisted third pixels', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './third-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@3x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for illegal @2x positioning', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './half-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for illegal @3x positioning', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './third-pixels.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x', '@2x'],
      },
    )
    expect(violations).toHaveLength(2)
    expect(errors).toHaveLength(0)
  })

  test('no violations for rotated layers or layers with rotated parents', async (): Promise<
    void
  > => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './rotated-layers.sketch',
      'layers-subpixel-positioning',
      {
        active: true,
        scaleFactors: ['@1x'],
      },
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })
})

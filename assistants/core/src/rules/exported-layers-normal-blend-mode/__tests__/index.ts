import { testCoreRule } from '../../../test-helpers'

describe('exported-layers-normal-blend-mode', () => {
  test('no violations for exported layers without blend modes', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './exported-layer.sketch',
      'exported-layers-normal-blend-mode',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for exported layers with blended styles', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './blended-styles.sketch',
      'exported-layers-normal-blend-mode',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for exported blended layers', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './blended-layer.sketch',
      'exported-layers-normal-blend-mode',
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations for blended layer exported only as bitmaps', async (): Promise<void> => {
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './blended-layer-bitmap-export.sketch',
      'exported-layers-normal-blend-mode',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

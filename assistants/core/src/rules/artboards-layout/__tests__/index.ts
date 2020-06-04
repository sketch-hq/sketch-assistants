import { testRule } from '../../../test-helpers'
import { RuleConfig } from '@sketch-hq/sketch-assistant-types'

const config: RuleConfig = {
  active: true,
  layouts: [
    {
      columnWidth: 10,
      drawHorizontal: true,
      drawHorizontalLines: true,
      drawVertical: true,
      gutterHeight: 10,
      gutterWidth: 10,
      guttersOutside: true,
      horizontalOffset: 0,
      numberOfColumns: 10,
      rowHeightMultiplication: 5,
      totalWidth: 200,
    },
  ],
}

describe('artboards-layout', () => {
  test('no violations for artboards with valid layouts', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './valid-layout-settings.sketch',
      'artboards-layout',
      config,
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for artboards without layouts', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './missing-layout-settings.sketch',
      'artboards-layout',
      config,
    )

    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('finds violations for invalid artboard layouts', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './invalid-layout-settings.sketch',
      'artboards-layout',
      config,
    )

    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

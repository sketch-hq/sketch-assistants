import { resolve } from 'path'
import { testRule } from '@sketch-hq/sketch-assistant-utils'
import type { RuleConfig } from '@sketch-hq/sketch-assistant-types'

import Assistant from '..'
import { config } from '..'

const testCoreRuleWithConfig = async (fixture: string, ruleId: string, numViolations = 1) => {
  const ruleName = `@sketch-hq/sketch-core-assistant/${ruleId}`
  const { violations, ruleErrors } = await testRule(
    resolve(__dirname, fixture),
    Assistant,
    ruleName,
    config.rules[ruleName] as RuleConfig,
  )
  expect(violations).toHaveLength(numViolations)
  expect(ruleErrors).toHaveLength(0)
}

test('borders-no-disabled', async () => {
  await testCoreRuleWithConfig('./disabled-border.sketch', 'borders-no-disabled')
})

test('fills-no-disabled', async () => {
  await testCoreRuleWithConfig('./disabled-fill.sketch', 'fills-no-disabled')
})

test('shadows-no-disabled', async () => {
  await testCoreRuleWithConfig('./disabled-shadow.sketch', 'shadows-no-disabled')
})

test('inner-shadows-no-disabled', async () => {
  await testCoreRuleWithConfig('./disabled-inner-shadow.sketch', 'inner-shadows-no-disabled')
})

test('groups-no-empty', async () => {
  await testCoreRuleWithConfig('./empty-group.sketch', 'groups-no-empty')
})

test('layer-styles-no-dirty', async () => {
  await testCoreRuleWithConfig('./dirty-style.sketch', 'layer-styles-no-dirty')
})

test('text-styles-no-dirty', async () => {
  await testCoreRuleWithConfig('./dirty-text-style.sketch', 'text-styles-no-dirty')
})

test('groups-no-redundant', async () => {
  await testCoreRuleWithConfig('./redundant-group.sketch', 'groups-no-redundant')
})

test('layers-no-hidden', async () => {
  await testCoreRuleWithConfig('./hidden-layer.sketch', 'layers-no-hidden')
})

test('layers-subpixel-positioning', async () => {
  await testCoreRuleWithConfig('./subpixel-positioning.sketch', 'layers-subpixel-positioning')
})

test('artboards-max-ungrouped-layers', async () => {
  await testCoreRuleWithConfig('./ungrouped-layers.sketch', 'artboards-max-ungrouped-layers')
})

test('layers-no-loose', async () => {
  await testCoreRuleWithConfig('./loose-layers.sketch', 'layers-no-loose')
})

test('shared-styles-no-unused', async () => {
  await testCoreRuleWithConfig('./unused-shared-style.sketch', 'shared-styles-no-unused')
})

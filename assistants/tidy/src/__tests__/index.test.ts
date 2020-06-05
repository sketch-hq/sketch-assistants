import { resolve } from 'path'
import { testRuleInAssistant } from '@sketch-hq/sketch-assistant-utils'

import Assistant from '..'

const testCoreRule = async (fixture: string, ruleName: string) =>
  await testRuleInAssistant(
    resolve(__dirname, fixture),
    Assistant,
    `@sketch-hq/sketch-core-assistant/${ruleName}`,
  )

test('borders-no-disabled', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './disabled-border.sketch',
    'borders-no-disabled',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('fills-no-disabled', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './disabled-fill.sketch',
    'fills-no-disabled',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('shadows-no-disabled', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './disabled-shadow.sketch',
    'shadows-no-disabled',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('inner-shadows-no-disabled', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './disabled-inner-shadow.sketch',
    'inner-shadows-no-disabled',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('groups-no-empty', async () => {
  const { violations, ruleErrors } = await testCoreRule('./empty-group.sketch', 'groups-no-empty')
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('layer-styles-no-dirty', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './dirty-style.sketch',
    'layer-styles-no-dirty',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('text-styles-no-dirty', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './dirty-text-style.sketch',
    'text-styles-no-dirty',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('groups-no-redundant', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './redundant-group.sketch',
    'groups-no-redundant',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('layers-no-hidden', async () => {
  const { violations, ruleErrors } = await testCoreRule('./hidden-layer.sketch', 'layers-no-hidden')
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('layers-subpixel-positioning', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './subpixel-positioning.sketch',
    'layers-subpixel-positioning',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('artboards-max-ungrouped-layers', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './ungrouped-layers.sketch',
    'artboards-max-ungrouped-layers',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('layers-no-loose', async () => {
  const { violations, ruleErrors } = await testCoreRule('./loose-layers.sketch', 'layers-no-loose')
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

test('shared-styles-no-unused', async () => {
  const { violations, ruleErrors } = await testCoreRule(
    './unused-shared-style.sketch',
    'shared-styles-no-unused',
  )
  expect(violations).toHaveLength(1)
  expect(ruleErrors).toHaveLength(0)
})

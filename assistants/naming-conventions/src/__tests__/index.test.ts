import { resolve } from 'path'
import { testRule } from '@sketch-hq/sketch-assistant-utils'
import { RuleConfig } from '@sketch-hq/sketch-assistant-types'

import Assistant, { config } from '..'

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

describe('name-pattern-pages', () => {
  test('no violation for emojis at start', async () => {
    await testCoreRuleWithConfig('./valid-page-names.sketch', 'name-pattern-pages', 0)
  })

  test('violations for no emojis at start', async () => {
    await testCoreRuleWithConfig('./invalid-page-names.sketch', 'name-pattern-pages', 4)
  })
})

describe('name-pattern-artboards', () => {
  test('no violations for properly numbered artboards', async () => {
    await testCoreRuleWithConfig('./valid-artboard-names.sketch', 'name-pattern-artboards', 0)
  })

  test('violations for artboards that haven not been numbered', async () => {
    await testCoreRuleWithConfig('./invalid-artboard-names.sketch', 'name-pattern-artboards', 3)
  })
})

describe('name-pattern-groups', () => {
  test('no violations for properly named groups', async () => {
    await testCoreRuleWithConfig('./valid-group-names.sketch', 'name-pattern-groups', 0)
  })

  test('violations for groups that haven not been properly named', async () => {
    await testCoreRuleWithConfig('./invalid-group-names.sketch', 'name-pattern-groups', 2)
  })
})

describe('name-pattern-symbols', () => {
  test('no violations for symbol names using grouping', async () => {
    await testCoreRuleWithConfig('./valid-symbol-names.sketch', 'name-pattern-symbols', 0)
  })

  test('violations for symbol names not using grouping', async () => {
    await testCoreRuleWithConfig('./invalid-symbol-names.sketch', 'name-pattern-symbols', 3)
  })
})

import { resolve } from 'path'
import { testRuleInAssistant } from '@sketch-hq/sketch-assistant-utils'

import Assistant from '..'

const testCoreRule = async (fixture: string, ruleName: string) =>
  await testRuleInAssistant(
    resolve(__dirname, fixture),
    Assistant,
    `@sketch-hq/sketch-core-assistant/${ruleName}`,
  )

describe('name-pattern-pages', () => {
  test('no violation for emojis at start', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './valid-page-names.sketch',
      'name-pattern-pages',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for no emojis at start', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './invalid-page-names.sketch',
      'name-pattern-pages',
    )
    expect(violations).toHaveLength(4)
    expect(ruleErrors).toHaveLength(0)
  })
})

describe('name-pattern-artboards', () => {
  test('no violations for properly numbered artboards', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './valid-artboard-names.sketch',
      'name-pattern-artboards',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for artboards that haven not been numbered', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './invalid-artboard-names.sketch',
      'name-pattern-artboards',
    )
    expect(violations).toHaveLength(3)
    expect(ruleErrors).toHaveLength(0)
  })
})

describe('name-pattern-groups', () => {
  test('no violations for properly named groups', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './valid-group-names.sketch',
      'name-pattern-groups',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for groups that haven not been properly named', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './invalid-group-names.sketch',
      'name-pattern-groups',
    )
    expect(violations).toHaveLength(2)
    expect(ruleErrors).toHaveLength(0)
  })
})

describe('name-pattern-symbols', () => {
  test('no violations for symbol names using grouping', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './valid-symbol-names.sketch',
      'name-pattern-symbols',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for symbol names not using grouping', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './invalid-symbol-names.sketch',
      'name-pattern-symbols',
    )
    expect(violations).toHaveLength(3)
    expect(ruleErrors).toHaveLength(0)
  })
})

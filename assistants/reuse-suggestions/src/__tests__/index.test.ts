import { resolve } from 'path'
import { testRule, prepare } from '@sketch-hq/sketch-assistant-utils'
import {
  AssistantPackageExport,
  Violation,
  PlainRuleError,
} from '@sketch-hq/sketch-assistant-types'

import Assistant from '..'

const testAllRules = async (file: string, assistant: AssistantPackageExport) => {
  const { config } = await prepare(assistant, { locale: 'en', platform: 'node' })
  let allViolations: Violation[] = []
  let allErrors: PlainRuleError[] = []
  for (const rule of Object.keys(config.rules)) {
    const { violations, ruleErrors } = await testRule(
      file,
      assistant,
      rule,
      config.rules[rule] || undefined,
    )
    allViolations = [...allViolations, ...violations]
    allErrors = [...allErrors, ...errors]
  }
  return { violations: allViolations, errors: allErrors }
}

describe('Reuse Assistant', () => {
  test('produces no errors in empty document', async () => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testAllRules(
      resolve(__dirname, './empty.sketch'),
      Assistant,
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('produces violations in incorrect document', async () => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testAllRules(
      resolve(__dirname, './all-bad.sketch'),
      Assistant,
    )

    expect(violations).toHaveLength(4)
    expect(ruleErrors).toHaveLength(0)
  })

  test('does not produce violations in correct document', async () => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testAllRules(
      resolve(__dirname, './all-good.sketch'),
      Assistant,
    )

    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })
})

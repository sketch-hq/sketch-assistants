import { resolve } from 'path'
import { testRule, prepare } from '@sketch-hq/sketch-assistant-utils'
import {
  AssistantPackage,
  Violation,
  PlainRuleError,
  AssistantRuntime,
} from '@sketch-hq/sketch-assistant-types'

import Assistant from '..'

const testAllRules = async (file: string, assistant: AssistantPackage) => {
  const { config } = await prepare(assistant, { locale: 'en', runtime: AssistantRuntime.Node })
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
    allErrors = [...allErrors, ...ruleErrors]
  }
  return { violations: allViolations, errors: allErrors }
}

describe('Reuse Assistant', () => {
  test('produces no errors in empty document', async () => {
    expect.assertions(2)
    const { violations, errors } = await testAllRules(
      resolve(__dirname, './empty.sketch'),
      Assistant,
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('produces violations in incorrect document', async () => {
    expect.assertions(2)
    const { violations, errors } = await testAllRules(
      resolve(__dirname, './all-bad.sketch'),
      Assistant,
    )

    expect(violations).toHaveLength(4)
    expect(errors).toHaveLength(0)
  })

  test('does not produce violations in correct document', async () => {
    expect.assertions(2)
    const { violations, errors } = await testAllRules(
      resolve(__dirname, './all-good.sketch'),
      Assistant,
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })
})

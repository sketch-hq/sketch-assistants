import { resolve } from 'path'
import { testRule } from '@sketch-hq/sketch-assistant-utils'
import { Assistant, Violation, PlainRuleError } from '@sketch-hq/sketch-assistant-types'

import reuseAssistant from '..'

const testAllRules = async (file: string, assistant: Assistant) => {
  const { config } = await assistant({ locale: 'en', platform: 'node' })
  let allViolations: Violation[] = []
  let allErrors: PlainRuleError[] = []
  for (const rule of Object.keys(config.rules)) {
    const { violations, errors } = await testRule(
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

describe('Naming Conventions Assistant', () => {
  test('produces one violation in the default empty document', async () => {
    expect.assertions(2)
    const { violations, errors } = await testAllRules(
      resolve(__dirname, './empty.sketch'),
      reuseAssistant,
    )

    // Page name is by default incorrect
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('produces violations in incorrect document', async () => {
    expect.assertions(2)
    const { violations, errors } = await testAllRules(
      resolve(__dirname, './all-bad.sketch'),
      reuseAssistant,
    )

    expect(violations).toHaveLength(10)
    expect(errors).toHaveLength(0)
  })

  test('does not produce violations in correct document', async () => {
    expect.assertions(2)
    const { violations, errors } = await testAllRules(
      resolve(__dirname, './all-good.sketch'),
      reuseAssistant,
    )

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })
})

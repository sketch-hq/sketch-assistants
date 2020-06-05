import { resolve } from 'path'
import { testRuleInAssistant } from '@sketch-hq/sketch-assistant-utils'

import Assistant from '..'

const testCoreRule = async (fixture: string, ruleName: string) =>
  await testRuleInAssistant(
    resolve(__dirname, fixture),
    Assistant,
    `@sketch-hq/sketch-core-assistant/${ruleName}`,
  )

describe('text-styles-prefer-shared', () => {
  test('no violation for shared text styles', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './shared-text-styles.sketch',
      'text-styles-prefer-shared',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for unshared text styles', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './unshared-text-styles.sketch',
      'text-styles-prefer-shared',
    )
    expect(violations).toHaveLength(3)
    expect(ruleErrors).toHaveLength(0)
  })
})

describe('layer-styles-prefer-shared', () => {
  test('no violation for shared layer styles', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './shared-layer-styles.sketch',
      'layer-styles-prefer-shared',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for unshared layer styles', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './unshared-layer-styles.sketch',
      'layer-styles-prefer-shared',
    )
    expect(violations).toHaveLength(3)
    expect(ruleErrors).toHaveLength(0)
  })
})

describe('groups-no-similar', () => {
  test('no violation for dissimilar groups', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './dissimilar-groups.sketch',
      'groups-no-similar',
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations for similar groups', async () => {
    const { violations, ruleErrors } = await testCoreRule(
      './similar-groups.sketch',
      'groups-no-similar',
    )
    expect(violations).toHaveLength(3)
    expect(ruleErrors).toHaveLength(0)
  })
})

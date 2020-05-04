import { resolve } from 'path'

import {
  AssistantEnv,
  RuleDefinition,
  AssistantResult,
  AssistantConfig,
} from '@sketch-hq/sketch-assistant-types'
import { runAssistant } from '..'
import { fromFile } from '../../from-file'
import { process } from '../../process'
import { createAssistantDefinition, createRule, createAssistantConfig } from '../../test-helpers'
import { getImageMetadata } from '../../get-image-metadata'

const testRunAssistant = async (
  config: AssistantConfig,
  rule: RuleDefinition,
): Promise<AssistantResult> => {
  const op = { cancelled: false }
  const file = await fromFile(resolve(__dirname, './empty.sketch'))
  const processedFile = await process(file, op)
  const assistant = createAssistantDefinition({ rules: rule ? [rule] : [], config })
  const env: AssistantEnv = { locale: '', platform: 'node' }
  return await runAssistant(processedFile, assistant, env, op, getImageMetadata)
}

describe('runAssistant', () => {
  test('skips unconfigured rules', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(createAssistantConfig(), createRule())
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('can produce violations', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.report({ message: 'Something went wrong' })
        },
      }),
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('skips rules that dont match the current platform', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        platform: 'sketch',
        rule: async (ruleContext) => {
          ruleContext.utils.report({ message: 'Something went wrong' })
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('includes metadata in the result', async (): Promise<void> => {
    expect.assertions(3)
    const { errors, metadata } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({ name: 'rule' }),
    )
    expect(metadata.assistant.name).toMatchInlineSnapshot(`"dummy-assistant"`)
    expect(Object.keys(metadata.rules)).toMatchInlineSnapshot(`
      Array [
        "rule",
      ]
    `)
    expect(errors).toHaveLength(0)
  })

  test('config values can be interpolated into rule metadata', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, metadata } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true, subspaceFrequency: 12 },
        },
      }),
      createRule({
        name: 'rule',
        title: (ruleConfig) => `Subspace frequency should be ${ruleConfig.subspaceFrequency}Hz`,
      }),
    )
    expect(errors).toHaveLength(0)
    expect(metadata.rules['rule'].title).toMatchInlineSnapshot(
      `"Subspace frequency should be 12Hz"`,
    )
  })

  test('configs can set a custom title', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, metadata } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true, ruleTitle: 'Warp speed should not exceed 9.9' },
        },
      }),
      createRule({
        name: 'rule',
      }),
    )
    expect(errors).toHaveLength(0)
    expect(metadata.rules['rule'].title).toMatchInlineSnapshot(`"Warp speed should not exceed 9.9"`)
  })

  test('skips inactive rules', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: false },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.report({ message: 'Something went wrong' })
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('can produce rule errors', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async () => {
          throw new Error('Bang!')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(1)
  })

  test('can produce rule errors during cache iteration', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async (context) => {
          await context.utils.iterateCache({
            page: async () => {
              throw new Error()
            },
          })
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(1)
  })

  test('can produce rule errors for bad config', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.getOption('warpFieldIntegrity')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(1)
  })
})

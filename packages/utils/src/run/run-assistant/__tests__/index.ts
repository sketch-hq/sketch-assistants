import {
  AssistantConfig,
  AssistantEnv,
  AssistantRuntime,
  AssistantSuccessResult,
  IgnoreConfig,
  RuleDefinition,
} from '@sketch-hq/sketch-assistant-types'
import { fromFile } from '@sketch-hq/sketch-file'
import { resolve } from 'path'
import { runAssistant } from '..'
import { getImageMetadata } from '../../../get-image-metadata'
import { process } from '../../../process'
import { createAssistantConfig, createAssistantDefinition, createRule } from '../../../test-helpers'

const testRunAssistant = async (
  config: AssistantConfig,
  rule: RuleDefinition,
  ignoreConfig: IgnoreConfig = { pages: [], assistants: {} },
  ruleTimeout: number = Infinity,
): Promise<AssistantSuccessResult> => {
  const op = { cancelled: false }
  const file = await fromFile(resolve(__dirname, './empty.sketch'))
  const processedFile = await process(file, op)
  const assistant = createAssistantDefinition({ rules: rule ? [rule] : [], config })
  const env: AssistantEnv = { locale: '', runtime: AssistantRuntime.Node }
  return await runAssistant(
    processedFile,
    assistant,
    env,
    op,
    getImageMetadata,
    ignoreConfig,
    ruleTimeout,
  )
}

describe('runAssistant', () => {
  test('skips unconfigured rules', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(createAssistantConfig(), createRule())
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('can produce violations', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.report('Something went wrong')
        },
      }),
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('skips rules that dont match the current platform', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        runtime: AssistantRuntime.Sketch,
        rule: async (ruleContext) => {
          ruleContext.utils.report('Something went wrong')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('includes metadata in the result', async (): Promise<void> => {
    expect.assertions(3)
    const { ruleErrors, metadata } = await testRunAssistant(
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
    expect(ruleErrors).toHaveLength(0)
  })

  test('config values can be interpolated into rule metadata', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, metadata } = await testRunAssistant(
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
    expect(ruleErrors).toHaveLength(0)
    expect(metadata.rules['rule'].title).toMatchInlineSnapshot(
      `"Subspace frequency should be 12Hz"`,
    )
  })

  test('configs can set a custom title', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, metadata } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true, ruleTitle: 'Warp speed should not exceed 9.9' },
        },
      }),
      createRule({
        name: 'rule',
      }),
    )
    expect(ruleErrors).toHaveLength(0)
    expect(metadata.rules['rule'].title).toMatchInlineSnapshot(`"Warp speed should not exceed 9.9"`)
  })

  test('skips inactive rules', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: false },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.report('Something went wrong')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('skips full ignored rules', async (): Promise<void> => {
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.report('Something went wrong')
        },
      }),
      { pages: [], assistants: { 'dummy-assistant': { rules: { rule: { allObjects: true } } } } },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('object and rule combinations can be ignored', async (): Promise<void> => {
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          for (const page of ruleContext.utils.objects.page) {
            ruleContext.utils.report('Something went wrong', page)
          }
        },
      }),
      {
        pages: [],
        assistants: {
          'dummy-assistant': {
            rules: { rule: { objects: ['9AD22B94-A05B-4F49-8EDD-A38D62BD6181'] } },
          },
        },
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('isObjectIgnoredForRule works', async (): Promise<void> => {
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          const page = ruleContext.file.original.contents.document.pages[0]
          if (!ruleContext.utils.isObjectIgnored(page)) {
            ruleContext.utils.report('Something went wrong', page)
          }
        },
      }),
      {
        pages: [],
        assistants: {
          'dummy-assistant': {
            rules: { rule: { objects: ['9AD22B94-A05B-4F49-8EDD-A38D62BD6181'] } },
          },
        },
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('can produce rule errors', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async () => {
          throw new Error('Bang!')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(1)
  })

  test('can produce rule errors during iteration', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async (context) => {
          for (const page of context.utils.objects.page) {
            throw Error(`Page ${page.name} looks wonky`)
          }
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(1)
  })

  test('can produce rule errors for bad config', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async (ruleContext) => {
          ruleContext.utils.getOption('warpFieldIntegrity')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(1)
  })

  test('can produce rule errors from rule timeouts', async (): Promise<void> => {
    expect.assertions(2)
    const { ruleErrors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        },
      }),
      { pages: [], assistants: {} },
      0,
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors[0]).toHaveProperty('code', 'timeout')
  })
})

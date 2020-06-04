import { resolve } from 'path'
import {
  RunInput,
  RunOutput,
  ViolationSeverity,
  Assistant,
  AssistantDefinition,
  AssistantRuntime,
} from '@sketch-hq/sketch-assistant-types'

import { runMultipleAssistants } from '..'
import { createAssistant, createRule, createAssistantConfig } from '../../../test-helpers'
import { getImageMetadata as getImageMetadataNode } from '../../../get-image-metadata'
import { process } from '../../../process'
import { fromFile } from '../../../from-file'

/**
 * Test helper.
 */
const testRunMultiple = async (
  {
    assistants = { 'dummy-assistant': createAssistant() },
    operation = { cancelled: false },
    getImageMetadata = getImageMetadataNode,
    env = { locale: 'en', runtime: AssistantRuntime.Node },
  }: Partial<RunInput>,
  filename = './empty.sketch',
): Promise<RunOutput> => {
  const file = await fromFile(resolve(__dirname, filename))
  const processedFile = await process(file, operation)
  return await runMultipleAssistants({
    assistants,
    processedFile,
    operation,
    getImageMetadata,
    env,
  })
}

test('rejects when no assistants', async (): Promise<void> => {
  await expect(testRunMultiple({ assistants: {} })).rejects.toHaveProperty('code', 'runError')
})

test('outputs an error result for a malformed assistant package', async (): Promise<void> => {
  const promise = testRunMultiple({
    assistants: {
      // @ts-ignore
      foo: {},
    },
  })
  await expect(promise).resolves.toHaveProperty('foo.code', 'error')
})

test('outputs an error result for assistant name mismatch', async (): Promise<void> => {
  const promise = testRunMultiple({
    assistants: {
      foo: createAssistant({ name: 'bar' }),
    },
  })
  await expect(promise).resolves.toHaveProperty('foo.code', 'error')
})

test('bails early if cancelled', async (): Promise<void> => {
  await expect(testRunMultiple({ operation: { cancelled: true } })).rejects.toHaveProperty(
    'code',
    'cancelled',
  )
})

test('works with a no-op assistant', async (): Promise<void> => {
  await expect(testRunMultiple({})).resolves.toBeTruthy()
})

test('works with assistants exported as ESM defaults', async (): Promise<void> => {
  const assistants = {
    'assistant-2': {
      __esModule: true,
      default: [
        {
          __esModule: true,
          default: createAssistant({ name: 'assistant-1' }),
        },
        {
          __esModule: true,
          default: createAssistant({ name: 'assistant-2' }),
        },
      ],
    },
  }
  const res = await testRunMultiple({ assistants })
  expect(res['assistant-2'].code).toBe('success')
  expect(res['assistant-2'].code).toBe('success')
})

test('can generate violations', async (): Promise<void> => {
  const assistants = {
    'dummy-assistant': createAssistant({
      rules: [
        createRule({
          name: 'rule',
          rule: async (ruleContext): Promise<void> => {
            ruleContext.utils.report({ message: 'Subspace anomaly detected' })
          },
        }),
      ],
      config: createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
    }),
  }

  const { 'dummy-assistant': res } = await testRunMultiple({ assistants })

  expect.assertions(3)
  expect(res).toHaveProperty('code', 'success')
  expect(res).toHaveProperty('result.passed', false)
  if (res.code === 'success') {
    expect(res.result.violations).toHaveLength(1)
  }
})

test('will pass an assistant if violations not error-level', async (): Promise<void> => {
  const assistants = {
    'dummy-assistant': createAssistant({
      rules: [
        createRule({
          name: 'rule',
          rule: async (ruleContext): Promise<void> => {
            ruleContext.utils.report({ message: 'Subspace anomaly detected' })
          },
        }),
      ],
      config: createAssistantConfig({
        rules: {
          rule: { active: true, severity: ViolationSeverity.info },
        },
      }),
    }),
  }

  const { 'dummy-assistant': res } = await testRunMultiple({ assistants })

  expect.assertions(3)
  expect(res).toHaveProperty('code', 'success')
  expect(res).toHaveProperty('result.passed', true)
  if (res.code === 'success') {
    expect(res.result.violations).toHaveLength(1)
  }
})

test('can generate rule errors', async (): Promise<void> => {
  const assistants = {
    'dummy-assistant': createAssistant({
      rules: [
        createRule({
          name: 'rule',
          rule: async (): Promise<void> => {
            throw new Error()
          },
        }),
      ],
      config: createAssistantConfig({
        rules: {
          rule: { active: true, severity: ViolationSeverity.warn },
        },
      }),
    }),
  }

  const { 'dummy-assistant': res } = await testRunMultiple({ assistants })
  expect.assertions(2)
  if (res.code === 'success') {
    expect(res.result.violations).toHaveLength(0)
    expect(res.result.ruleErrors).toHaveLength(1)
  }
})

test('can run mulitple assistants', async (): Promise<void> => {
  const assistants = {
    'dummy-assistant-1': createAssistant({
      name: 'dummy-assistant-1',
      rules: [
        createRule({
          name: 'dummy-assistant-1/rule',
          rule: async (ruleContext): Promise<void> => {
            ruleContext.utils.report({ message: '' })
          },
        }),
      ],
      config: createAssistantConfig({
        rules: {
          'dummy-assistant-1/rule': { active: true },
        },
      }),
    }),
    'dummy-assistant-2': createAssistant({
      name: 'dummy-assistant-2',
      rules: [
        createRule({
          name: 'dummy-assistant-2/rule',
          rule: async (ruleContext): Promise<void> => {
            ruleContext.utils.report({ message: '' })
          },
        }),
      ],
      config: createAssistantConfig({
        rules: {
          'dummy-assistant-2/rule': { active: true },
        },
      }),
    }),
  }

  const { 'dummy-assistant-1': res1, 'dummy-assistant-2': res2 } = await testRunMultiple({
    assistants,
  })
  expect.assertions(4)
  if (res1.code === 'success') {
    expect(res1.result.violations).toHaveLength(1)
    expect(res1.result.ruleErrors).toHaveLength(0)
  }
  if (res2.code === 'success') {
    expect(res2.result.violations).toHaveLength(1)
    expect(res2.result.ruleErrors).toHaveLength(0)
  }
})

test('can be internationalized', async (): Promise<void> => {
  const assistant: Assistant = async (env): Promise<AssistantDefinition> => ({
    name: 'dummy-assistant',
    rules: [
      createRule({
        name: 'rule',
        rule: async (ruleContext): Promise<void> => {
          ruleContext.utils.report({
            message: env.locale === 'zh-Hans' ? '世界你好' : 'Hello world',
          })
        },
      }),
    ],
    config: {
      rules: {
        rule: { active: true },
      },
    },
  })

  const assistants = {
    'dummy-assistant': assistant,
  }

  const { 'dummy-assistant': zhRes } = await testRunMultiple({
    assistants,
    env: { runtime: AssistantRuntime.Node, locale: 'zh-Hans' },
  })
  const { 'dummy-assistant': enRes } = await testRunMultiple({
    assistants,
    env: { runtime: AssistantRuntime.Node, locale: 'en' },
  })

  expect.assertions(2)
  if (zhRes.code === 'success' && enRes.code === 'success') {
    expect(zhRes.result.violations[0].message).toBe('世界你好')
    expect(enRes.result.violations[0].message).toBe('Hello world')
  }
})

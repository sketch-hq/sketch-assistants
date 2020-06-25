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
import { fromFile } from '../../../files'

/**
 * Test helper.
 */
const testRunMultiple = async (
  {
    assistants = { 'dummy-assistant': createAssistant() },
    operation = { cancelled: false },
    getImageMetadata = getImageMetadataNode,
    env = { locale: 'en', runtime: AssistantRuntime.Node },
    ignore = { pages: [], assistants: {} },
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
    ignore,
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
  await expect(promise).resolves.toHaveProperty('assistants.foo.code', 'error')
})

test('outputs an error result for assistant name mismatch', async (): Promise<void> => {
  const promise = testRunMultiple({
    assistants: {
      foo: createAssistant({ name: 'bar' }),
    },
  })
  await expect(promise).resolves.toHaveProperty('assistants.foo.code', 'error')
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
  const output = await testRunMultiple({ assistants })
  expect(output.assistants['assistant-2'].code).toBe('success')
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

  const output = await testRunMultiple({ assistants })
  const res = output.assistants['dummy-assistant']

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

  const output = await testRunMultiple({ assistants })
  const res = output.assistants['dummy-assistant']

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

  const output = await testRunMultiple({ assistants })
  const res = output.assistants['dummy-assistant']

  expect.assertions(2)
  if (res.code === 'success') {
    expect(res.result.violations).toHaveLength(0)
    expect(res.result.ruleErrors).toHaveLength(1)
  }
})

test('generates rule errors when ignored objects are reported', async (): Promise<void> => {
  const assistants = {
    'dummy-assistant': createAssistant({
      rules: [
        createRule({
          name: 'rule',
          rule: async (context) => {
            context.utils.report({
              object: context.file.file.contents.document.pages[0],
              message: '',
            })
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

  const output = await testRunMultiple({
    assistants,
    ignore: {
      pages: [],
      assistants: {
        'dummy-assistant': {
          rules: { rule: { objects: ['9AD22B94-A05B-4F49-8EDD-A38D62BD6181'] } },
        },
      },
    },
  })
  const res = output.assistants['dummy-assistant']

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
  const output = await testRunMultiple({ assistants })
  const res1 = output.assistants['dummy-assistant-1']
  const res2 = output.assistants['dummy-assistant-2']

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

  const zhOutput = await testRunMultiple({
    assistants,
    env: { runtime: AssistantRuntime.Node, locale: 'zh-Hans' },
  })
  const zhRes = zhOutput.assistants['dummy-assistant']

  const enOutput = await testRunMultiple({
    assistants,
    env: { runtime: AssistantRuntime.Node, locale: 'en' },
  })
  const enRes = enOutput.assistants['dummy-assistant']

  expect.assertions(2)
  if (zhRes.code === 'success' && enRes.code === 'success') {
    expect(zhRes.result.violations[0].message).toBe('世界你好')
    expect(enRes.result.violations[0].message).toBe('Hello world')
  }
})

test('prunes missing assistants from ignore data', async (): Promise<void> => {
  const { ignore } = await testRunMultiple({
    ignore: {
      pages: [],
      assistants: { 'missing-assistant': { rules: {} }, 'dummy-assistant': { rules: {} } },
    },
  })
  expect(ignore.assistants).not.toHaveProperty('missing-assistant')
  expect(ignore.assistants).toHaveProperty('dummy-assistant')
})

test('prunes missing rules from ignore data', async (): Promise<void> => {
  const { ignore } = await testRunMultiple({
    assistants: {
      'dummy-assistant': createAssistant({ rules: [createRule({ name: 'rule' })] }),
    },
    ignore: {
      pages: [],
      assistants: {
        'dummy-assistant': { rules: { rule: { allObjects: true }, missing: { allObjects: true } } },
      },
    },
  })
  expect(ignore.assistants['dummy-assistant'].rules).toHaveProperty('rule')
  expect(ignore.assistants['dummy-assistant'].rules).not.toHaveProperty('missing')
})

test('prunes missing objects from ignore data', async (): Promise<void> => {
  const { ignore } = await testRunMultiple({
    assistants: {
      'dummy-assistant': createAssistant({ rules: [createRule({ name: 'rule' })] }),
    },
    ignore: {
      pages: [],
      assistants: {
        'dummy-assistant': {
          rules: { rule: { objects: ['9AD22B94-A05B-4F49-8EDD-A38D62BD6181', 'missing-id'] } },
        },
      },
    },
  })
  expect.assertions(2)
  if ('objects' in ignore.assistants['dummy-assistant'].rules.rule) {
    expect(ignore.assistants['dummy-assistant'].rules.rule.objects).toContain(
      '9AD22B94-A05B-4F49-8EDD-A38D62BD6181',
    )
    expect(ignore.assistants['dummy-assistant'].rules.rule.objects).not.toContain('missing-id')
  }
})

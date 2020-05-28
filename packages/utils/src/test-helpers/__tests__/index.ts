import { testRule, createAssistant, createRule } from '..'
import { resolve } from 'path'

describe('testRule', () => {
  test('runs no-op rule without issues', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      createAssistant({ rules: [createRule({ name: 'rule' })] }),
      'rule',
    )
    expect(res.violations).toHaveLength(0)
    expect(res.ruleErrors).toHaveLength(0)
  })

  test('can return violations', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      createAssistant({
        rules: [
          createRule({
            name: 'rule',
            rule: async (context) => context.utils.report({ message: '' }),
          }),
        ],
      }),
      'rule',
    )
    expect(res.violations).toHaveLength(1)
    expect(res.ruleErrors).toHaveLength(0)
  })

  test('works when passed an array of extendable Assistants', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      [
        createAssistant({
          rules: [
            createRule({
              name: 'rule-a',
              rule: async (context) => context.utils.report({ message: '' }),
            }),
          ],
        }),
        createAssistant({
          rules: [
            createRule({
              name: 'rule-b',
              rule: async (context) => context.utils.report({ message: '' }),
            }),
          ],
        }),
      ],
      'rule-a',
    )
    expect(res.violations).toHaveLength(1)
    expect(res.ruleErrors).toHaveLength(0)
  })

  test('can return rule errors', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      createAssistant({
        rules: [
          createRule({
            name: 'rule',
            rule: async () => {
              throw new Error()
            },
          }),
        ],
      }),
      'rule',
    )
    expect(res.violations).toHaveLength(0)
    expect(res.ruleErrors).toHaveLength(1)
  })

  test('throws when an unavailable rule is configured', async (): Promise<void> => {
    expect.assertions(1)
    try {
      await testRule(
        resolve(__dirname, './empty.sketch'),
        createAssistant({
          rules: [createRule({ name: 'rule' })],
        }),
        'reticulating-splines',
      )
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})

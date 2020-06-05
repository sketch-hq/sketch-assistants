import { testRuleInAssistant, testRule, testAssistant, createAssistant, createRule } from '..'
import { resolve } from 'path'

describe('testRuleInAssistant', () => {
  test('can return violations', async () => {
    const { violations } = await testRuleInAssistant(
      resolve(__dirname, './empty.sketch'),
      createAssistant({
        rules: [
          createRule({ name: 'rule', rule: async (ctx) => ctx.utils.report({ message: '' }) }),
        ],
        config: {
          rules: { rule: { active: true } },
        },
      }),
      'rule',
    )
    expect(violations).toHaveLength(1)
  })

  test('rules not under-test are excluded', async () => {
    const { violations } = await testRuleInAssistant(
      resolve(__dirname, './empty.sketch'),
      createAssistant({
        rules: [
          createRule({ name: 'rule1', rule: async (ctx) => ctx.utils.report({ message: '' }) }),
          createRule({ name: 'rule2', rule: async (ctx) => ctx.utils.report({ message: '' }) }),
        ],
        config: {
          rules: { rule1: { active: true }, rule2: { active: true } },
        },
      }),
      'rule1',
    )
    expect(violations).toHaveLength(1)
  })

  test('can be supplied a custom config', async () => {
    const { violations } = await testRuleInAssistant(
      resolve(__dirname, './empty.sketch'),
      createAssistant({
        rules: [
          createRule({ name: 'rule', rule: async (ctx) => ctx.utils.report({ message: '' }) }),
        ],
        config: {
          rules: { rule: { active: true } },
        },
      }),
      'rule',
      { active: false },
    )
    expect(violations).toHaveLength(0)
  })
})

describe('testRule', () => {
  test('can return violations', async () => {
    const { violations } = await testRule(
      resolve(__dirname, './empty.sketch'),
      createRule({ name: 'rule', rule: async (ctx) => ctx.utils.report({ message: '' }) }),
    )
    expect(violations).toHaveLength(1)
  })
})

describe('testAssistant', () => {
  test('can return violations', async () => {
    const { violations } = await testAssistant(
      resolve(__dirname, './empty.sketch'),
      createAssistant({
        rules: [
          createRule({ name: 'rule', rule: async (ctx) => ctx.utils.report({ message: '' }) }),
        ],
        config: {
          rules: { rule: { active: true } },
        },
      }),
    )
    expect(violations).toHaveLength(1)
  })
})

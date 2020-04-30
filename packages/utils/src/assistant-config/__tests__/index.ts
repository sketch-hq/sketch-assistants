import {
  getRuleConfig,
  isRuleConfigured,
  getRuleOption,
  isRuleActive,
  getRuleSeverity,
  isRuleConfigValid,
} from '..'
import { createAssistantConfig, createRule } from '../../test-helpers'
import { ViolationSeverity } from '@sketch-hq/sketch-assistant-types'

describe('getRuleConfig', () => {
  test('can retrieve rule configuration', () => {
    expect(
      getRuleConfig(
        createAssistantConfig({
          rules: {
            foo: { active: true },
          },
        }),
        'foo',
      ),
    ).toMatchInlineSnapshot(`
      Object {
        "active": true,
      }
    `)
  })
})

describe('isRuleConfigured', () => {
  test('returns true for a configured rule', () => {
    expect(
      isRuleConfigured(
        createAssistantConfig({
          rules: {
            foo: { active: true },
          },
        }),
        'foo',
      ),
    ).toBe(true)
  })

  test('returns false for an un-configured rule', () => {
    expect(isRuleConfigured(createAssistantConfig(), 'foo')).toBe(false)
  })
})

describe('getRuleOption', () => {
  test('returns option value', () => {
    expect(
      getRuleOption(
        createAssistantConfig({
          rules: {
            foo: {
              active: true,
              option: 1,
            },
          },
        }),
        'foo',
        'option',
      ),
    ).toBe(1)
  })

  test('returns null for missing option', () => {
    expect(
      getRuleOption(
        createAssistantConfig({
          rules: {
            foo: {
              active: true,
              option: 1,
            },
          },
        }),
        'foo',
        'missing',
      ),
    ).toBe(null)
  })
})

describe('isRuleActive', () => {
  test('returns true for activated rule', () => {
    expect(
      isRuleActive(
        createAssistantConfig({
          rules: {
            foo: { active: true },
          },
        }),
        'foo',
      ),
    ).toBe(true)
  })

  test('returns false for de-activated rule', () => {
    expect(
      isRuleActive(
        createAssistantConfig({
          rules: {
            foo: { active: false },
          },
        }),
        'foo',
      ),
    ).toBe(false)
  })

  test('returns false for un-configured rule', () => {
    expect(isRuleActive(createAssistantConfig(), 'foo')).toBe(false)
  })
})

describe('getRuleSeverity', () => {
  test('returns `error` severity level when not specified anywhere', () => {
    expect(
      getRuleSeverity(
        createAssistantConfig({
          rules: {
            foo: { active: true },
          },
        }),
        'foo',
      ),
    ).toBe(ViolationSeverity.error)
  })

  test('falls back to configs defaultSeverity if not set in rule', () => {
    expect(
      getRuleSeverity(
        createAssistantConfig({
          defaultSeverity: ViolationSeverity.warn,
          rules: {
            foo: { active: true },
          },
        }),
        'foo',
      ),
    ).toBe(ViolationSeverity.warn)
  })

  test('can be set in rule', () => {
    expect(
      getRuleSeverity(
        createAssistantConfig({
          defaultSeverity: ViolationSeverity.warn,
          rules: {
            foo: { active: true, severity: ViolationSeverity.info },
          },
        }),
        'foo',
      ),
    ).toBe(ViolationSeverity.info)
  })
})

describe('isRuleConfigValid', () => {
  test('returns true for a valid config', () => {
    expect(
      isRuleConfigValid(
        createAssistantConfig({
          rules: {
            foo: { active: true, option: 'bar' },
          },
        }),
        createRule({
          name: 'foo',
          getOptions: (helpers) => [
            helpers.stringOption({
              name: 'option',
              title: '',
              description: '',
            }),
          ],
        }),
      ),
    ).toBe(true)
  })

  test('returns an error for an invalid config', () => {
    expect(
      isRuleConfigValid(
        createAssistantConfig({
          rules: {
            foo: { active: true, option: 1 },
          },
        }),
        createRule({
          name: 'foo',
          getOptions: (helpers) => [
            helpers.stringOption({
              name: 'option',
              title: '',
              description: '',
            }),
          ],
        }),
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "dataPath": ".option",
          "keyword": "type",
          "message": "should be string",
          "params": Object {
            "type": "string",
          },
          "schemaPath": "#/properties/option/type",
        },
      ]
    `)
  })
})

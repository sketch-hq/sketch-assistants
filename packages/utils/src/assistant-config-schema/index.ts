import {
  AssistantConfigSchemaCreator,
  JSONSchemaProps,
  ReservedRuleOptionNames,
  RuleConfig,
  RuleDefinition,
  RuleOption,
} from '@sketch-hq/sketch-assistant-types'
import { JSONSchema7Type } from 'json-schema'
import { buildRuleOptionSchema, helpers } from '../rule-option-schemas'

const getReservedRuleOptions = (config: RuleConfig): JSONSchemaProps => {
  const typeMap = {
    [ReservedRuleOptionNames.active]: 'boolean',
    [ReservedRuleOptionNames.severity]: 'number',
    [ReservedRuleOptionNames.ruleTitle]: 'string',
  }

  return Object.entries(typeMap).reduce((acc, [opt, type]) => {
    if (!(opt in config)) return acc
    return { ...acc, [opt]: { type } }
  }, {})
}

const applyRuleConfig = (ops: JSONSchemaProps, config: RuleConfig): JSONSchemaProps => {
  type DefaultValueMap = {
    [key: string]: { default: JSONSchema7Type | undefined }
  }

  return Object.entries(ops).reduce((acc: DefaultValueMap, [key, schema]) => {
    const val = config[key]
    if (typeof val === 'undefined') return acc
    if (typeof val !== 'boolean' && typeof val !== 'number' && typeof val !== 'string') return acc

    return { ...acc, [key]: { ...schema, default: val } }
  }, {})
}

const buildAssistantConfigSchema: AssistantConfigSchemaCreator = (assistant) => {
  return {
    type: 'object',
    properties: {
      rules: {
        type: 'object',
        properties: assistant.rules.reduce((acc, rule: RuleDefinition) => {
          const config = assistant.config.rules[rule.name]
          if (!config) return acc

          const ops = [
            getReservedRuleOptions(config),
            ...(typeof rule.getOptions !== 'undefined' ? rule.getOptions(helpers) : []),
          ].map((val) => applyRuleConfig(val, config))

          return { ...acc, [rule.name]: buildRuleOptionSchema(ops) }
        }, {}),
      },
    },
  }
}

export { buildAssistantConfigSchema }

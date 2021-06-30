import {
  AssistantConfigSchemaCreator,
  JSONSchemaProps,
  ReservedRuleOptionNames,
  RuleConfig,
  RuleDefinition,
} from '@sketch-hq/sketch-assistant-types'
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
  return Object.entries(ops).reduce((acc, [key, schema]) => {
    return { ...acc, [key]: { ...schema, default: config[key] } }
  }, {})
}

/**
 * Builds the JSON Schema for the configuration accepted by the given
 * assistant. The schema is augmented with assistant's configuration,
 * meaning the options set in the configuration are used as default values
 * for the corresponding properties.
 *
 * @param assistant Assistant to generate the configuration schema from
 * @returns JSON Schema describing the assistant's configuration shape
 */
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

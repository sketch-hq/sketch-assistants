import Ajv, { ErrorObject } from 'ajv'

import {
  AssistantConfig,
  Maybe,
  RuleConfig,
  ViolationSeverity,
  RuleDefinition,
  ReservedRuleOptionNames,
} from '@sketch-hq/sketch-assistant-types'
import { helpers, buildRuleOptionSchema } from '../rule-option-schemas'

/**
 * Get rule configuration from an assistant config.
 */
const getRuleConfig = (config: AssistantConfig, ruleName: string): Maybe<RuleConfig> =>
  config.rules[ruleName]

/**
 * Determine if the rule has been mentioned in a given config.
 */
const isRuleConfigured = (config: AssistantConfig, ruleName: string): boolean =>
  !!getRuleConfig(config, ruleName)

/**
 * Get the value of a specific rule option.
 */
const getRuleOption = (
  config: AssistantConfig,
  ruleName: string,
  optionKey: string,
): null | unknown => {
  const ruleConfig = getRuleConfig(config, ruleName)
  return ruleConfig ? (optionKey in ruleConfig ? ruleConfig[optionKey] : null) : null
}

/**
 * Validate a rule's options in a config object according to the schema defined
 * on the rule module.
 */
const isRuleConfigValid = (config: AssistantConfig, rule: RuleDefinition): true | ErrorObject[] => {
  if (typeof rule.getOptions === 'undefined') {
    // If the rule hasn't defined an options schema we can't validate it
    return true
  }
  const schema = buildRuleOptionSchema(rule.getOptions(helpers))
  const ruleConfig = getRuleConfig(config, rule.name)
  const ajv = new Ajv()
  ajv.validate(schema, ruleConfig)
  return ajv.errors || true
}

/**
 * Determine if a rule is active. An active rule must both be mentioned in the
 * config and have its `active` option set to `true`.
 */
const isRuleActive = (config: AssistantConfig, ruleName: string): boolean => {
  const active = getRuleOption(config, ruleName, ReservedRuleOptionNames.active)
  return typeof active === 'boolean' ? active : false
}

/**
 * Determine a rule's severity, falling back to default values if not specified.
 */
const getRuleSeverity = (config: AssistantConfig, ruleName: string): ViolationSeverity => {
  const severity = getRuleOption(config, ruleName, ReservedRuleOptionNames.severity)
  switch (severity) {
    case ViolationSeverity.info:
    case ViolationSeverity.warn:
    case ViolationSeverity.error:
      return severity
    default:
      return config.defaultSeverity || ViolationSeverity.error
  }
}

/**
 * Return the custom title for a rule if its been defined at configuration-time.
 */
const getRuleTitle = (config: AssistantConfig, ruleName: string): string | null => {
  const ruleTitle = getRuleOption(config, ruleName, ReservedRuleOptionNames.ruleTitle)
  return typeof ruleTitle === 'string' ? ruleTitle : null
}

export {
  getRuleConfig,
  getRuleOption,
  isRuleConfigured,
  isRuleActive,
  getRuleSeverity,
  isRuleConfigValid,
  getRuleTitle,
}

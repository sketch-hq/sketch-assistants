import pMap from 'p-map'

import {
  AssistantDefinition,
  RuleContext,
  ProcessedSketchFile,
  AssistantEnv,
  Violation,
  RunOperation,
  GetImageMetadata,
  AssistantResult,
} from '@sketch-hq/sketch-assistant-types'
import { createRuleUtilsCreator } from '../rule-utils'
import { isRuleActive, getRuleConfig, getRuleTitle } from '../assistant-config'

class RuleInvocationError extends Error {
  public cause: Error
  public assistantName: string
  public ruleName: string

  public constructor(cause: Error, assistantName: string, ruleName: string) {
    super(
      `Error thrown during invocation of rule "${ruleName}" on assistant "${assistantName}": ${cause.message}`,
    )
    this.cause = cause
    this.assistantName = assistantName
    this.ruleName = ruleName
    this.name = 'RuleInvocationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Run an assistant, catching and returning any errors encountered during rule invocation.
 */
const runAssistant = async (
  file: ProcessedSketchFile,
  assistant: AssistantDefinition,
  env: AssistantEnv,
  operation: RunOperation,
  getImageMetadata: GetImageMetadata,
): Promise<AssistantResult> => {
  const violations: Violation[] = []

  const createUtils = createRuleUtilsCreator(
    file,
    violations,
    assistant,
    operation,
    getImageMetadata,
  )

  const context = {
    env,
    file,
    assistant,
    operation,
    getImageMetadata,
  }

  const activeRules = assistant.rules
    .filter((rule) => isRuleActive(assistant.config, rule.name)) // Rule turned on in config
    .filter((rule) => (rule.platform ? rule.platform === env.platform : true)) // Rule platform is supported

  const metadata: AssistantResult['metadata'] = {
    assistant: {
      name: assistant.name,
      config: assistant.config,
    },
    rules: activeRules.reduce((acc, rule) => {
      const ruleConfig = getRuleConfig(assistant.config, rule.name)
      const configTitle = getRuleTitle(assistant.config, rule.name)

      const title = configTitle
        ? configTitle
        : ruleConfig && 'active' in ruleConfig && typeof rule.title === 'function'
        ? rule.title(ruleConfig)
        : rule.title

      const description =
        ruleConfig && 'active' in ruleConfig && typeof rule.description === 'function'
          ? rule.description(ruleConfig)
          : rule.description

      return {
        ...acc,
        [rule.name]: {
          name: rule.name,
          title,
          description,
          debug: rule.debug,
          platform: rule.platform,
        },
      }
    }, {}),
  }

  try {
    await pMap(
      activeRules,
      async (rule): Promise<void> => {
        if (operation.cancelled) return
        const { rule: ruleFunction, name: ruleName } = rule
        const ruleContext: RuleContext = {
          ...context,
          utils: createUtils(ruleName),
        }
        try {
          await ruleFunction(ruleContext)
        } catch (error) {
          throw new RuleInvocationError(error, assistant.name, ruleName)
        }
      },
      { concurrency: 1, stopOnError: false },
    )
  } catch (error) {
    return {
      violations,
      errors: Array.from<RuleInvocationError>(error).map((error) => ({
        assistantName: error.assistantName,
        ruleName: error.ruleName,
        message: error.cause.message,
        stack: error.cause.stack || '',
      })),
      metadata,
    }
  }
  return {
    violations,
    errors: [],
    metadata,
  }
}

export { runAssistant, RuleInvocationError }

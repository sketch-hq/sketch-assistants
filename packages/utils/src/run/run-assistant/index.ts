import pMap from 'p-map'
import {
  AssistantDefinition,
  RuleContext,
  ProcessedSketchFile,
  AssistantEnv,
  Violation,
  RunOperation,
  GetImageMetadata,
  AssistantSuccessResult,
  ViolationSeverity,
  IgnoreConfig,
} from '@sketch-hq/sketch-assistant-types'

import { createRuleUtilsCreator } from '../../rule-utils'
import { isRuleActive, getRuleConfig, getRuleTitle } from '../../assistant-config'
import { isRuleFullIgnored } from '../ignore'

/**
 * Given a set of violations, determine if they represent a "pass" or a "fail".
 * A "fail" means severe error-level violations are present, whereas a "pass"
 * means only info or warn-level violations are present.
 */
const getPassed = (violations: Violation[]): boolean =>
  !!violations.find((violation): boolean => violation.severity > ViolationSeverity.warn)
    ? false
    : true

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
 * Run a single assistant, catching and returning any errors encountered during rule invocation.
 */
const runAssistant = async (
  file: ProcessedSketchFile,
  assistant: AssistantDefinition,
  env: AssistantEnv,
  operation: RunOperation,
  getImageMetadata: GetImageMetadata,
  ignoreConfig: IgnoreConfig,
): Promise<AssistantSuccessResult> => {
  const violations: Violation[] = []

  const createUtils = createRuleUtilsCreator(
    file,
    violations,
    assistant,
    operation,
    getImageMetadata,
    ignoreConfig,
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
    .filter((rule) => (rule.runtime ? rule.runtime === env.runtime : true)) // Rule platform is supported

  const profile: AssistantSuccessResult['profile'] = {
    ruleTimings: {},
  }

  const metadata: AssistantSuccessResult['metadata'] = {
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
          runtime: rule.runtime,
        },
      }
    }, {}),
  }

  // Filter out ignored rules to find the final set of rules to invoke
  const rulesToRun = activeRules.filter(
    (rule) => !isRuleFullIgnored(ignoreConfig, assistant.name, rule.name),
  )

  try {
    await pMap(
      rulesToRun,
      async (rule): Promise<void> => {
        if (operation.cancelled) return
        const { rule: ruleFunction, name: ruleName } = rule
        const ruleContext: RuleContext = {
          ...context,
          utils: createUtils(ruleName),
        }
        const start = Date.now()
        try {
          await ruleFunction(ruleContext)
        } catch (error) {
          throw new RuleInvocationError(error, assistant.name, ruleName)
        }
        profile.ruleTimings[ruleName] = Date.now() - start
      },
      { concurrency: 1, stopOnError: false },
    )
  } catch (error) {
    return {
      passed: getPassed(violations),
      violations,
      ruleErrors: Array.from<RuleInvocationError>(error).map((error) => ({
        assistantName: error.assistantName,
        ruleName: error.ruleName,
        message: error.cause.message,
        stack: error.cause.stack || '',
      })),
      metadata,
      profile,
    }
  }
  return {
    passed: getPassed(violations),
    violations,
    ruleErrors: [],
    metadata,
    profile,
  }
}

export { runAssistant, RuleInvocationError }

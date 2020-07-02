import pMap from 'p-map'
import pTimeout, { TimeoutError } from 'p-timeout'
import {
  AssistantDefinition,
  RuleContext,
  ProcessedSketchFile,
  AssistantEnv,
  Violation,
  GetImageMetadata,
  AssistantSuccessResult,
  ViolationSeverity,
  IgnoreConfig,
  CancelToken,
  TimeoutToken,
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
  public code: 'error' | 'timeout'

  public constructor(
    cause: Error,
    assistantName: string,
    ruleName: string,
    code: 'error' | 'timeout',
  ) {
    super(
      `Error thrown during invocation of rule "${ruleName}" on assistant "${assistantName}": ${cause.message}`,
    )
    this.cause = cause
    this.assistantName = assistantName
    this.ruleName = ruleName
    this.name = 'RuleInvocationError'
    this.code = code
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
  cancelToken: CancelToken,
  getImageMetadata: GetImageMetadata,
  ignoreConfig: IgnoreConfig,
  ruleTimeout: number,
): Promise<AssistantSuccessResult> => {
  const violations: Violation[] = []

  const createUtils = createRuleUtilsCreator(
    file,
    violations,
    assistant,
    cancelToken,
    getImageMetadata,
    ignoreConfig,
  )

  const context = {
    env,
    file,
    assistant,
    cancelToken,
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
        if (cancelToken.cancelled) return
        const timeoutToken: TimeoutToken = { timedOut: false }
        const { rule: ruleFunction, name: ruleName } = rule
        const ruleContext: RuleContext = {
          ...context,
          utils: createUtils(ruleName, timeoutToken),
        }
        const start = Date.now()
        try {
          const rulePromise = ruleFunction(ruleContext)
          await (ruleTimeout === Infinity
            ? rulePromise
            : pTimeout(
                rulePromise,
                ruleTimeout,
                `Rule timed-out after ${ruleTimeout} milliseconds`,
              ))
        } catch (error) {
          const timedOut = error instanceof TimeoutError
          timeoutToken.timedOut = timedOut
          throw new RuleInvocationError(
            error,
            assistant.name,
            ruleName,
            timedOut ? 'timeout' : 'error',
          )
        }
        profile.ruleTimings[ruleName] = Date.now() - start
      },
      { concurrency: 1, stopOnError: false },
    )
  } catch (errors) {
    return {
      passed: getPassed(violations),
      violations,
      ruleErrors: Array.from<RuleInvocationError>(errors).map((error) => ({
        assistantName: error.assistantName,
        ruleName: error.ruleName,
        message: error.cause.message,
        stack: error.cause.stack || '',
        code: error.code,
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

export { runAssistant }

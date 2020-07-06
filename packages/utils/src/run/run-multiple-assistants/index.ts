import {
  RunInput,
  RunOutput,
  RunRejection,
  AssistantDefinition,
  CancelToken,
  AssistantEnv,
  IgnoreConfig,
} from '@sketch-hq/sketch-assistant-types'

import { prepare } from '../../assistant'
import { runAssistant } from '../run-assistant'
import { pruneObjects, pruneAssistants, pruneRules, isRuleFullIgnored } from '../ignore'
import { isRuleActive } from '../../assistant-config'

export function isRunRejection(val: unknown): val is RunRejection {
  if (!val) return false
  if (typeof val !== 'object') return false
  if (!('code' in val!)) return false
  return true
}

/**
 * Create a RunRejection object.
 */
export const createRunRejection = (
  message: string,
  code: RunRejection['code'] = 'runError',
  error?: unknown,
): RunRejection => {
  return {
    message: `Run failed: ${error instanceof Error ? `${message} ${error.message}` : message}`,
    code,
  }
}

/**
 * Throw with a "cancelled" rejection if the current operation signals a cancellation from outside.
 */
const exitIfCancelled = (cancelToken: CancelToken): void | never => {
  if (cancelToken.cancelled) {
    throw createRunRejection('Run cancelled by external signal', 'cancelled')
  }
}

/**
 * Return the set of active rules for an Assistant. Active rules are 1) activated in the config,
 * 2) supported by the current platform and 3) not full ignored.
 */
const getActiveRules = (assistant: AssistantDefinition, env: AssistantEnv, ignore: IgnoreConfig) =>
  assistant.rules
    .filter((rule) => isRuleActive(assistant.config, rule.name)) // Rule turned on in config
    .filter((rule) => (rule.runtime ? rule.runtime === env.runtime : true)) // Rule platform is supported
    .filter((rule) => !isRuleFullIgnored(ignore, assistant.name, rule.name))

/**
 * Wrapped by the exported function so even uncaught errors are consistently returned
 * as RunRejections.
 */
const innerRunMultipleAssistants = async (input: RunInput): Promise<RunOutput> => {
  const { cancelToken, env, processedFile, assistants, getImageMetadata, timeBudgets } = input
  let { ignore } = input

  if (Object.keys(assistants).length === 0) {
    throw createRunRejection('No Assistants found to run')
  }

  ignore = pruneAssistants(ignore, assistants)
  ignore = pruneObjects(ignore, processedFile)

  const results: RunOutput['assistants'] = {}
  const definitions: AssistantDefinition[] = []

  // Prepare assistants, that is, resolve the Assistant package exports into
  // assistant functions ready for running.

  for (const [assistantName, assistant] of Object.entries(assistants)) {
    try {
      const def = await prepare(assistant, env)
      if (def.name !== assistantName) {
        throw Error(
          `Assistant name "${def.name}" does not match it's package name "${assistantName}"`,
        )
      }
      definitions.push(def)
    } catch (error) {
      results[assistantName] = {
        code: 'error',
        error: {
          message: `Assistant preparation failed: ${error.message}`,
        },
      }
    }
  }

  exitIfCancelled(cancelToken)

  // Caculate the rule timeout
  const totalRules = definitions.reduce(
    (acc, assistant) => acc + getActiveRules(assistant, env, ignore).length,
    0,
  )
  const ruleTimeout = Math.min(
    Math.max(Math.trunc(timeBudgets.totalMs / totalRules), timeBudgets.minRuleTimeoutMs),
    timeBudgets.maxRuleTimeoutMs,
  )

  // For each definition prune any ignored rules, no longer present in the
  // Assistant

  for (const assistant of definitions) {
    ignore = pruneRules(ignore, assistant)
  }

  // Run assistants against the file.

  for (const assistant of definitions) {
    if (cancelToken.cancelled) break
    try {
      results[assistant.name] = {
        code: 'success',
        result: await runAssistant(
          processedFile,
          assistant,
          env,
          cancelToken,
          getImageMetadata,
          ignore,
          ruleTimeout,
        ),
      }
    } catch (error) {
      results[assistant.name] = {
        code: 'error',
        error: {
          message: `Assistant run failed: ${error.message}`,
        },
      }
    }
  }

  exitIfCancelled(cancelToken)

  return {
    assistants: results,
    ignore,
    input,
  }
}

/**
 * Run multiple assistants.
 */
export const runMultipleAssistants = async (input: RunInput): Promise<RunOutput> => {
  try {
    return await innerRunMultipleAssistants(input)
  } catch (error) {
    if (isRunRejection(error)) {
      throw error
    } else {
      throw createRunRejection('Unhandled error', 'runError', error)
    }
  }
}

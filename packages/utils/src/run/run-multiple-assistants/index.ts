import {
  RunInput,
  RunOutput,
  RunRejection,
  AssistantDefinition,
  RunOperation,
} from '@sketch-hq/sketch-assistant-types'

import { prepare } from '../../assistant'
import { runAssistant } from '../run-assistant'

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
const exitIfCancelled = (op: RunOperation): void | never => {
  if (op.cancelled) {
    throw createRunRejection('Run cancelled by external signal', 'cancelled')
  }
}

/**
 * Wrapped by the exported function so even uncaught errors are consistently returned
 * as RunRejections.
 */
const innerRunMultipleAssistants = async (input: RunInput): Promise<RunOutput> => {
  const { operation, env, processedFile, assistants, getImageMetadata } = input

  if (Object.keys(assistants).length === 0) {
    throw createRunRejection('No Assistants found to run')
  }

  const output: RunOutput = {}
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
      output[assistantName] = {
        code: 'error',
        result: {
          message: `Assistant preparation failed: ${error.message}`,
        },
      }
    }
  }

  exitIfCancelled(operation)

  // Run assistants against the file.

  for (const assistant of definitions) {
    try {
      output[assistant.name] = {
        code: 'success',
        result: await runAssistant(processedFile, assistant, env, operation, getImageMetadata),
      }
    } catch (error) {
      output[assistant.name] = {
        code: 'error',
        result: {
          message: `Assistant run failed: ${error.message}`,
        },
      }
    }
  }

  exitIfCancelled(operation)

  return output
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

import { RunOutput, RunOutputProfile, FileFormat } from '@sketch-hq/sketch-assistant-types'

type FileProfile = RunOutputProfile['file']
type AssistantsProfile = RunOutputProfile['assistants']

/**
 * Create a profile data object for a given RunOutput. Profile data collates statistics that may
 * help provide insight into Assistant performance, including for example rules that may be taking
 * a long time to execute. One way to view profile data is to pass the `--profile` flag to the
 * Assistants CLI.
 */
export const makeProfile = (output: RunOutput): RunOutputProfile => {
  const { processedFile } = output.input
  const file: FileProfile = {
    time: processedFile.profile.time,
    totalObjects: processedFile.profile.numObjects,
    objectCounts: Object.keys(processedFile.objects).reduce(
      (acc, key) => ({
        ...acc,
        [key]: { count: processedFile.objects[key as FileFormat.ClassValue].length },
      }),
      {},
    ),
  }
  const assistants: AssistantsProfile = Object.keys(output.assistants).reduce<AssistantsProfile>(
    (acc, key) => {
      const result = output.assistants[key]
      if (result.code === 'error') return acc
      const { result: successResult } = result
      const { ruleTimings } = successResult.profile
      return {
        ...acc,
        [key]: {
          violations: successResult.violations.length,
          ruleErrors: successResult.ruleErrors.length,
          time: Object.keys(ruleTimings).reduce((acc, key) => acc + ruleTimings[key], 0),
          rules: Object.keys(ruleTimings).reduce(
            (acc, key) => ({
              ...acc,
              [key]: {
                time: ruleTimings[key],
                violations: successResult.violations.filter(
                  (violation) => violation.ruleName === key,
                ).length,
              },
            }),
            {},
          ),
        },
      }
    },
    {},
  )
  return { file, assistants }
}

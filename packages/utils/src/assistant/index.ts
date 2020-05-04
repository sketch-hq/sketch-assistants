import {
  AssistantDefinition,
  AssistantPackageExport,
  Assistant,
  AssistantEnv,
  Maybe,
  RuleDefinition,
  ESModuleInterop,
} from '@sketch-hq/sketch-assistant-types'

/**
 * Merge assistant definitions together to form a single assistant definition, with a syntax similar
 * to Object.assign(). Assistants are merged from the right-most argument to the left into
 * preceeding arguments, according to the following algorithm:
 *
 *   1. Rule configuration objects are merged together, with values from right-most assistants
 *      overriding those from the next assistant to the left
 *   2. Assistant rule function arrays are concatenated
 *
 * @param sources Assistant definitions to merge
 */
const assign = (...sources: AssistantDefinition[]): AssistantDefinition => {
  return sources.reduceRight((acc, curr) => {
    return {
      name: acc.name || curr.name || '',
      config: {
        ...(typeof acc.config.defaultSeverity === 'undefined'
          ? {}
          : { defaultSeverity: acc.config.defaultSeverity }),
        rules: {
          ...curr.config.rules,
          ...acc.config.rules,
        },
      },
      rules: [...curr.rules, ...acc.rules],
    }
  })
}

/**
 * Prepare an assistant. That is, un-roll its exported value into a flat list of assistant functions,
 * invoke and await them to obtain a flat list of concrete assistant definitions which is then merged
 * to form a final/single assistant definition.
 *
 * Assistant preparation is performed at runtime by an assistant runner.
 *
 * @param source The assistant package to prepare
 * @param context The env within which the assistant package is being prepared
 */
const prepare = async (
  pkgExport: AssistantPackageExport,
  env: AssistantEnv,
): Promise<AssistantDefinition> => {
  const assistant = '__esModule' in pkgExport ? pkgExport.default : pkgExport
  const definitions = await Promise.all(
    (Array.isArray(assistant) ? assistant : [assistant])
      .flat(Infinity)
      .map((item: Assistant | ESModuleInterop<Assistant>) => {
        if ('__esModule' in item) {
          return item.default
        } else {
          return item
        }
      })
      .map((f) => f(env)),
  )
  return assign(...definitions)
}

/**
 * Lookup a rule definition by rule name.
 */
const getRuleDefinition = (
  assistant: AssistantDefinition,
  ruleName: string,
): Maybe<RuleDefinition> => assistant.rules.find((rule) => rule.name === ruleName)

export { prepare, assign, getRuleDefinition }

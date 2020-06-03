import {
  AssistantDefinition,
  Assistant,
  AssistantEnv,
  Maybe,
  RuleDefinition,
} from '@sketch-hq/sketch-assistant-types'

/**
 * Assistant packages should be exported on the default export. However the shape of that export
 * differs depending on the esModuleInterop strategy. This function should consistently return
 * the inner AssistantPackage value either way.
 */
const getDefaultExport = (target: any): unknown =>
  '__esModule' in target ? target.default : target

/**
 * Prepare an assistant package. That is, un-roll its exported value into a flat list of assistant
 * functions, invoke and await them to obtain a flat list of concrete assistant definitions which is
 * then merged to form a final/single assistant definition.
 *
 * Assistant preparation is performed at runtime by an assistant runner.
 *
 * @param source The assistant package to prepare
 * @param context The env within which the assistant package is being prepared
 */
const prepare = async (pkg: unknown, env: AssistantEnv): Promise<AssistantDefinition> => {
  pkg = getDefaultExport(pkg)
  const definitions = await Promise.all(
    (Array.isArray(pkg) ? pkg : [pkg])
      .flat(Infinity)
      .map(getDefaultExport)
      .map((f) => (f as Assistant)(env)),
  )
  return assign(...definitions)
}

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
 * Lookup a rule definition by rule name.
 */
const getRuleDefinition = (
  assistant: AssistantDefinition,
  ruleName: string,
): Maybe<RuleDefinition> => assistant.rules.find((rule) => rule.name === ruleName)

export { prepare, assign, getRuleDefinition }

import {
  IgnoreConfig,
  SketchFile,
  AssistantPackageMap,
  AssistantDefinition,
  ProcessedSketchFile,
} from '@sketch-hq/sketch-assistant-types'

import { getRuleDefinition } from '../../assistant/'

/**
 * Prune ignored pages that are no longer present in a SketchFile.
 */
export const prunePages = (ignore: IgnoreConfig, file: SketchFile): IgnoreConfig => {
  const ids = file.contents.document.pages.map((page) => page.do_objectID)
  return {
    ...ignore,
    pages: ignore.pages.filter((id) => ids.includes(id)),
  }
}

/**
 * Prune ignore directives that relate to Assistants not present in an AssistantPackageMap.
 */
export const pruneAssistants = (
  ignore: IgnoreConfig,
  assistants: AssistantPackageMap,
): IgnoreConfig => ({
  ...ignore,
  assistants: Object.keys(ignore.assistants)
    .filter((assistantName) => assistantName in assistants)
    .reduce(
      (acc, assistantName) => ({
        ...acc,
        [assistantName]: ignore.assistants[assistantName],
      }),
      {},
    ),
})

/**
 * Prune ignored rules not present in an Assistant Definition.
 */
export const pruneRules = (ignore: IgnoreConfig, assistant: AssistantDefinition): IgnoreConfig => {
  if (!(assistant.name in ignore.assistants)) return ignore
  return {
    ...ignore,
    assistants: {
      ...ignore.assistants,
      [assistant.name]: {
        ...ignore.assistants[assistant.name],
        rules: Object.keys(ignore.assistants[assistant.name].rules)
          .filter((ruleName) => !!getRuleDefinition(assistant, ruleName))
          .reduce(
            (rules, ruleName) => ({
              ...rules,
              [ruleName]: ignore.assistants[assistant.name].rules[ruleName],
            }),
            {},
          ),
      },
    },
  }
}

/**
 * Prune ignored objects not present in a ProcessedSketchFile.
 */
export const pruneObjects = (
  ignore: IgnoreConfig,
  processedFile: ProcessedSketchFile,
): IgnoreConfig => ({
  ...ignore,
  assistants: Object.keys(ignore.assistants).reduce(
    (assistants, assistantName) => ({
      ...assistants,
      [assistantName]: {
        ...ignore.assistants[assistantName],
        rules: Object.keys(ignore.assistants[assistantName].rules).reduce((rules, ruleName) => {
          const ruleIgnore = ignore.assistants[assistantName].rules[ruleName]
          return {
            ...rules,
            [ruleName]:
              'objects' in ruleIgnore
                ? {
                    ...ruleIgnore,
                    objects: ruleIgnore.objects.filter((id) => processedFile.objectIds.has(id)),
                  }
                : ruleIgnore,
          }
        }, {}),
      },
    }),
    {},
  ),
})

/**
 * Determine whether a given rule is full ignored, according to a IgnoreConfig. Full ignored means
 * it both has an entry, and has been set to { allObjects: true }.
 */
export const isRuleFullIgnored = (
  ignore: IgnoreConfig,
  assistantName: string,
  ruleName: string,
): boolean => {
  if (!(assistantName in ignore.assistants)) return false
  if (!(ruleName in ignore.assistants[assistantName].rules)) return false
  const ruleIgnore = ignore.assistants[assistantName].rules[ruleName]
  if ('allObjects' in ruleIgnore) {
    return !!ruleIgnore.allObjects
  } else {
    return false
  }
}

/**
 * Return the set of ignored objects for a rule.
 */
export const getIgnoredObjectIdsForRule = (
  ignore: IgnoreConfig,
  assistantName: string,
  ruleName: string,
): string[] => {
  if (!(assistantName in ignore.assistants)) return []
  if (!(ruleName in ignore.assistants[assistantName].rules)) return []
  const ignoreState = ignore.assistants[assistantName].rules[ruleName]
  if ('objects' in ignoreState) {
    return ignoreState.objects
  } else {
    return []
  }
}

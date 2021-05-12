import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { assertArray } from '../../guards'

type SymbolId = string
type LibraryName = string
type ForeignSymbolMap = Map<SymbolId, LibraryName>

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const libraries = utils.getOption('libraries')
    assertArray(libraries)

    if (libraries.length === 0) return // If authorized library list is empty this rule is a noop

    const authorizedLibraries: string = libraries.join(', ')

    const foreignSymbols: ForeignSymbolMap = new Map(
      [...utils.foreignObjects.MSImmutableForeignSymbol].map((o) => [
        o.symbolMaster.symbolID,
        o.sourceLibraryName,
      ]),
    )

    for (const instance of utils.objects.symbolInstance) {
      // Handle overrides

      for (const override of instance.overrideValues) {
        if (typeof override.value !== 'string') continue // Override not referencing an id
        if (!foreignSymbols.has(override.value)) continue // Override not using a library symbol
        const libraryName = foreignSymbols.get(override.value)
        if (!libraries.includes(libraryName!)) {
          utils.report(
            t`Symbol Override is using a Library Symbol from the library "${libraryName}". If using a Library Symbol it must come from one of the authorized libraries: ${authorizedLibraries}`,
            instance,
          )
        }
      }

      // Handle layer symbols

      if (!foreignSymbols.has(instance.symbolID)) continue // Instance is not foreign

      const libraryName = foreignSymbols.get(instance.symbolID)
      if (!libraries.includes(libraryName)) {
        utils.report(
          t`Symbol is from the library "${libraryName}". If using a Library Symbol it must come from one of the authorized libraries: ${authorizedLibraries}`,
          instance,
        )
      }
    }
  }

  return {
    rule,
    name: 'library-symbols-allowed-libraries',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return t`Library Symbols must come from the Libraries ${authorizedLibraries}`;
    },
    description: t`When standardization is important teams may wish to enforce that Library Symbols come from a list of authorized libraries.`,
    getOptions: (helpers) => [
      helpers.stringArrayOption({
        name: 'libraries',
        title: t`Authorized libraries`,
        description: t`Libraries that are valid to use. An error is shown if a library that does not belong to this list is used.`,
        minLength: 1,
      }),
    ],
  };
}

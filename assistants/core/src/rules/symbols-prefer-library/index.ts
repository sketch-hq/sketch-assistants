import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { assertArray } from '../../guards'

type SymbolID = string

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const authorizedLibraries = utils.getOption('libraries')
    assertArray(authorizedLibraries)

    const foreignSymbols: Map<SymbolID, FileFormat.ForeignSymbol> = new Map()
    for (const foreignSymbol of utils.foreignObjects.MSImmutableForeignSymbol) {
      foreignSymbols.set(foreignSymbol.symbolMaster.symbolID, foreignSymbol)
    }

    for (const instance of utils.objects.symbolInstance) {
      const foreignSymbol = foreignSymbols.get(instance.symbolID)
      if (!foreignSymbol) {
        utils.report(i18n._(t`This symbol instance should come from a library`), [instance])
        continue
      }
      const libName = foreignSymbol.sourceLibraryName
      if (!authorizedLibraries.includes(libName) && authorizedLibraries.length > 0) {
        utils.report(i18n._(t`Uses the unauthorized library "${libName}"`), [instance])
      }
    }
  }

  return {
    rule,
    name: 'symbols-prefer-library',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return libraries.length === 0
        ? i18n._(t`Symbols must come from a library`)
        : i18n._(t`Symbols must come from the ${authorizedLibraries} libraries`)
    },
    description: i18n._(
      t`Teams may wish to enforce the usage of libraries within a document, and the presence of local symbols can represent an opportunity to refactor them into a library`,
    ),
    getOptions: (helpers) => [
      helpers.stringArrayOption({
        name: 'libraries',
        title: i18n._(t`Authorized libraries`),
        description: i18n._(
          t`Libraries that are valid to use. An error is shown if a library that does not belong to this list is used.`,
        ),
      }),
    ],
  }
}

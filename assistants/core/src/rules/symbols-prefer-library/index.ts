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
        utils.report([
          {
            object: instance,
            message: i18n._(t`This Layer should use a Symbol from a Library`),
          },
        ])
        continue
      }
      const libName = foreignSymbol.sourceLibraryName
      if (!authorizedLibraries.includes(libName) && authorizedLibraries.length > 0) {
        utils.report([
          {
            object: instance,
            message: i18n._(t`This uses the unauthorized Library "${libName}"`),
          },
        ])
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
        ? i18n._(t`Symbols must come from a Library`)
        : i18n._(t`Symbols must come from the ${authorizedLibraries} Libraries`)
    },
    description: i18n._(
      t`If you want everyone to use Libraries in this document, local Symbols should be refactored into a Library.`,
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

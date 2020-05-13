import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { file, utils } = context
    // Get the array of authorized libraries
    const authorizedLibraries = utils.getOption('libraries') || []
    const doc = file.file.contents.document
    // libSymbols is a Map<symbol id, library symbol>
    const libSymbols = doc.foreignSymbols.reduce(
      (symbolMap, libSymbol) => symbolMap.set(libSymbol.symbolMaster.symbolID, libSymbol),
      new Map(),
    )
    await utils.iterateCache({
      async symbolInstance(node): Promise<void> {
        const symbol = node as FileFormat.SymbolInstance
        // Check if the symbol comes from a library
        const library = libSymbols.get(symbol.symbolID)
        if (!library) {
          // Symbol does not belong to a library
          utils.report([
            {
              node,
              message: i18n._(t`A symbol from a library is expected`),
            },
          ])
          return
        }
        // Determine if the library is one of the allowed libraries
        const libraryName = library.sourceLibraryName
        if (Array.isArray(authorizedLibraries) && authorizedLibraries.length > 0) {
          const isAuthorized = authorizedLibraries.indexOf(libraryName) > -1
          if (!isAuthorized) {
            utils.report([
              {
                node,
                message: i18n._(t`Uses the unauthorized library "${libraryName}"`),
              },
            ])
            return
          }
        }
      },
    })
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
        defaultValue: [],
      }),
    ],
  }
}

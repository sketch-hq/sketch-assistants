import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { file, utils } = context
    // Get the array of authorized libraries
    const authorizedLibraries = utils.getOption('libraries') || []
    const doc = file.file.contents.document
    // libraries is a Map<text style id, library text style>
    const libraries = doc.foreignTextStyles.reduce(
      (styleMap, libStyle) => styleMap.set(libStyle.localSharedStyle.do_objectID, libStyle),
      new Map(),
    )
    await utils.iterateCache({
      async text(node): Promise<void> {
        const layer = utils.nodeToObject<FileFormat.AnyLayer>(node)
        if (typeof layer.sharedStyleID !== 'string') {
          // Report immediately if there is no sharedStyleID
          utils.report([
            {
              node,
              message: i18n._(t`Text styles must be set with the shared styles of a library`),
            },
          ])
          return // don't process this node further
        }
        const library = libraries.get(layer.sharedStyleID)
        if (!library) {
          // the sharedStyleID in use does not belong to a library
          utils.report([
            {
              node,
              message: i18n._(t`A shared style from a library is expected`),
            },
          ])
          return
        }
        const libraryName = library.sourceLibraryName
        // Determine if the library is one of the allowed libraries
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
        // Check if the text styles differ from the library
        const isStyleEq = utils.textStyleEq(layer.style, library.localSharedStyle.value)
        if (!isStyleEq) {
          utils.report([
            {
              node,
              message: i18n._(t`Shared style differs from library`),
            },
          ])
        }
      },
    })
  }

  return {
    rule,
    name: 'text-styles-prefer-library',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return libraries.length === 0
        ? i18n._(t`Text styles must come from a library`)
        : i18n._(t`Text styles must come from the ${authorizedLibraries} libraries`)
    },
    description: i18n._(
      t`Teams may wish to enforce the usage of libraries within a document, and the presence of local shared text styles represent an opportunity to refactor them into the library`,
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

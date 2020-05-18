import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { isCombinedShapeChildLayer } from '../../rule-helpers'

// Do not check for duplicate style properties on these objects
const IGNORE_CLASSES = ['artboard', 'page', 'symbolMaster', 'text']

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { file, utils } = context
    // Gather option value and assert its type
    const authorizedLibraries = utils.getOption('libraries') || []
    const doc = file.file.contents.document
    // libraries is a Map<shared style id strings, library shared styles>
    const libraries = doc.foreignLayerStyles.reduce(
      (styleMap, libStyle) => styleMap.set(libStyle.localSharedStyle.do_objectID, libStyle),
      new Map(),
    )
    // Reports are done in place, while iterating through cache.
    for (const layer of utils.objects.anyLayer) {
      if (IGNORE_CLASSES.includes(layer._class)) continue
      if (isCombinedShapeChildLayer(layer, utils)) continue // Ignore layers in combined shapes
      if (layer._class === 'group' && !layer.style?.shadows?.length) continue // Ignore groups with default styles (i.e. no shadows)
      if (typeof layer.sharedStyleID !== 'string') {
        // Report immediately if there is no sharedStyleID
        utils.report([
          {
            object: layer,
            message: i18n._(t`Layer styles must be set with the shared styles of a library`),
          },
        ])
        continue // don't process this node further
      }
      const library = libraries.get(layer.sharedStyleID)
      if (!library) {
        // sharedStyleID does not belong to a library
        utils.report([
          {
            object: layer,
            message: i18n._(t`A shared style from a library is expected`),
          },
        ])
        continue
      }
      const libraryName = library.sourceLibraryName
      // Determine if the library is one of the allowed libraries
      if (Array.isArray(authorizedLibraries) && authorizedLibraries.length > 0) {
        const isAuthorized = authorizedLibraries.indexOf(libraryName) > -1
        if (!isAuthorized) {
          utils.report([
            {
              object: layer,
              message: i18n._(t`Uses the unauthorized library "${libraryName}"`),
            },
          ])
          continue
        }
      }
      // Check if the layer styles differ from the library
      const isStyleEq = utils.styleEq(layer.style, library.localSharedStyle.value)
      if (!isStyleEq) {
        utils.report([
          {
            object: layer,
            message: i18n._(t`Shared style differs from library`),
          },
        ])
      }
    }
  }

  return {
    rule,
    name: 'layer-styles-prefer-library',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return libraries.length === 0
        ? i18n._(t`Shared styles must come from a library`)
        : i18n._(t`Shared styles must come from the libraries: ${authorizedLibraries}`)
    },
    description: i18n._(
      t`Teams may wish to enforce the usage of libraries within a document, and the presence of local shared layer styles represent an opportunity to refactor them into the library`,
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

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
            message: i18n._(t`Layer Styles must be set with the Shared Styles of a Library`),
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
            message: i18n._(t`This layer should use a Shared Style from a Library`),
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
              message: i18n._(t`This uses the unauthorized Library "${libraryName}"`),
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
            message: i18n._(t`This Shared Style isn't in an authorized Library`),
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
        ? i18n._(t`Shared Styles must come from a Library`)
        : i18n._(t`Shared Styles must come from the Libraries: ${authorizedLibraries}`)
    },
    description: i18n._(
      t`If you want everyone to use Libraries in this document, local shared Layer Styles should be refactored into a Library.`,
    ),
    getOptions: (helpers) => [
      helpers.stringArrayOption({
        name: 'libraries',
        title: i18n._(t`Authorized Libraries`),
        description: i18n._(
          t`Libraries that people can use. If someone uses a Library that isn't in this list, they'll see an error.`,
        ),
        defaultValue: [],
      }),
    ],
  }
}

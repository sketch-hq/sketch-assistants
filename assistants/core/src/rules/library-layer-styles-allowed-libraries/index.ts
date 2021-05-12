import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { assertArray } from '../../guards'
import { isCombinedShapeChildLayer } from '../../rule-helpers'

const IGNORE = ['artboard', 'page', 'symbolMaster', 'text']

type StyleId = string
type LibraryName = string
type ForeignStyleMap = Map<StyleId, LibraryName>
type InvalidResults = Map<LibraryName, FileFormat.AnyLayer[]>

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const libraries = utils.getOption('libraries')
    assertArray(libraries)

    if (libraries.length === 0) return // If authorized library list is empty this rule is a noop

    const authorizedLibraries: string = libraries.join(', ')

    const foreignStyles: ForeignStyleMap = new Map(
      [...utils.foreignObjects.MSImmutableForeignLayerStyle].map((o) => [
        o.localSharedStyle.do_objectID,
        o.sourceLibraryName,
      ]),
    )

    const results: InvalidResults = new Map()

    for (const layer of utils.objects.anyLayer) {
      if (IGNORE.includes(layer._class)) continue // Ignore the ignored layer types

      // Handle overrides

      if (layer._class === FileFormat.ClassValue.SymbolInstance) {
        for (const override of layer.overrideValues) {
          if (typeof override.value !== 'string') continue // Override not referencing an id
          if (!foreignStyles.has(override.value)) continue // Override not using a library style
          const libraryName = foreignStyles.get(override.value)
          if (!libraries.includes(libraryName!)) {
            utils.report(
              t`Symbol Style Override is using a Library Style from the library "${libraryName}". If using a Library Style it must come from one of the authorized libraries: ${authorizedLibraries}`,
              layer,
            )
          }
        }
      }

      // Handle layer styles

      if (typeof layer.sharedStyleID !== 'string') continue // Ignore layers not using a shared style
      if (!foreignStyles.has(layer.sharedStyleID)) continue // Ignore layers using local shared styles
      if (layer._class === 'group' && !layer.style?.shadows?.length) continue // Ignore groups with default styles (i.e. no shadows)
      if (isCombinedShapeChildLayer(layer, utils)) continue // Ignore layers in combined shapes

      const libraryName = foreignStyles.get(layer.sharedStyleID)

      if (!libraries.includes(libraryName!)) {
        results.set(libraryName!, [...(results.get(libraryName!) || []), layer])
      }
    }

    for (const [libraryName, layers] of results) {
      utils.report(
        t`Layer is using a Library Style from the library "${libraryName}". If using a Library Style it must come from one of the authorized libraries: ${authorizedLibraries}`,
        ...layers,
      )
    }
  }

  return {
    rule,
    name: 'library-layer-styles-allowed-libraries',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return t`Library Layer Styles must come from the Libraries ${authorizedLibraries}`;
    },
    description: t`When standardization is important teams may wish to enforce that Library Styles come from a list of authorized libraries.`,
    getOptions: (helpers) => [
      helpers.stringArrayOption({
        name: 'libraries',
        title: t`Authorized Libraries`,
        description: t`Libraries that people can use. If someone uses a Library that isn't in this list, they'll see an error.`,
        defaultValue: [],
        minLength: 1,
      }),
    ],
  };
}

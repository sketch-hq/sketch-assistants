import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { assertArray } from '../../guards'

type StyleId = string
type LibraryName = string
type ForeignStyleMap = Map<StyleId, LibraryName>
type InvalidResults = Map<LibraryName, FileFormat.Text[]>

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const libraries = utils.getOption('libraries')
    assertArray(libraries)

    if (libraries.length === 0) return // If authorized library list is empty this rule is a noop

    const authorizedLibraries: string = libraries.join(', ')

    const foreignStyles: ForeignStyleMap = new Map(
      [...utils.foreignObjects.MSImmutableForeignTextStyle].map((o) => [
        o.localSharedStyle.do_objectID,
        o.sourceLibraryName,
      ]),
    )

    // Handle overrides

    for (const instance of utils.objects.symbolInstance) {
      for (const override of instance.overrideValues) {
        if (typeof override.value !== 'string') continue // Override not referencing an id
        if (!foreignStyles.has(override.value)) continue // Override not using a library style
        const libraryName = foreignStyles.get(override.value)
        if (!libraries.includes(libraryName!)) {
          utils.report(
            i18n._(
              t`Symbol Text Style Override is using a Library Text Style from the library "${libraryName}". If using a Library Text Style it must come from one of the authorized libraries: ${authorizedLibraries}`,
            ),
            instance,
          )
        }
      }
    }

    // Handle layer text styles

    const results: InvalidResults = new Map()

    for (const textLayer of utils.objects.text) {
      if (typeof textLayer.sharedStyleID !== 'string') continue // Ignore layers not using a shared style
      if (!foreignStyles.has(textLayer.sharedStyleID)) continue // Ignore layers using local shared styles

      const libraryName = foreignStyles.get(textLayer.sharedStyleID)

      if (!libraries.includes(libraryName!)) {
        results.set(libraryName!, [...(results.get(libraryName!) || []), textLayer])
      }
    }

    for (const [libraryName, textLayers] of results) {
      utils.report(
        i18n._(
          t`Layer is using a Library Text Style from the library "${libraryName}". If using a Library Text Style it must come from one of the authorized libraries: ${authorizedLibraries}`,
        ),
        ...textLayers,
      )
    }
  }

  return {
    rule,
    name: 'library-text-styles-allowed-libraries',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return i18n._(t`Library Text Styles must come from the Libraries ${authorizedLibraries}`)
    },
    description: i18n._(
      t`When standardization is important teams may wish to enforce that Library Text Styles come from a list of authorized libraries.`,
    ),
    getOptions: (helpers) => [
      helpers.stringArrayOption({
        name: 'libraries',
        title: i18n._(t`Authorized Libraries`),
        description: i18n._(
          t`Libraries that people can use. If someone uses a Library that isn't in this list, they'll see an error.`,
        ),
        defaultValue: [],
        minLength: 1,
      }),
    ],
  }
}

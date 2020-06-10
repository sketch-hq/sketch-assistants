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

    const foreignTextStyles: Map<SymbolID, FileFormat.ForeignTextStyle> = new Map()
    for (const foreignTextStyle of utils.foreignObjects.MSImmutableForeignTextStyle) {
      foreignTextStyles.set(foreignTextStyle.localSharedStyle.do_objectID, foreignTextStyle)
    }

    for (const text of utils.objects.text) {
      if (typeof text.sharedStyleID !== 'string') {
        utils.report([
          {
            object: text,
            message: i18n._(t`This Layer should use a Text Style from a Library`),
          },
        ])
        continue
      }

      const foreignTextStyle = foreignTextStyles.get(text.sharedStyleID)
      if (!foreignTextStyle) {
        utils.report([
          {
            object: text,
            message: i18n._(t`This Layer should use a Text Style from a Library`),
          },
        ])
        continue
      }

      const libName = foreignTextStyle.sourceLibraryName
      if (!authorizedLibraries.includes(libName) && authorizedLibraries.length > 0) {
        utils.report([
          {
            object: text,
            message: i18n._(t`This uses the unauthorized Library "${libName}"`),
          },
        ])
        continue
      }

      if (!utils.textStyleEq(text.style, foreignTextStyle.localSharedStyle.value)) {
        utils.report([
          {
            object: text,
            message: i18n._(t`The Text Style is out of date with the Library`),
          },
        ])
      }
    }
  }

  return {
    rule,
    name: 'text-styles-prefer-library',
    title: (ruleConfig) => {
      const libraries = Array.isArray(ruleConfig.libraries) ? ruleConfig.libraries : []
      const authorizedLibraries = libraries.join(', ')
      return libraries.length === 0
        ? i18n._(t`Text Styles must come from a Library`)
        : i18n._(t`Text Styles must come from the ${authorizedLibraries} Libraries`)
    },
    description: i18n._(
      t`If you want everyone to use Libraries in this document, local Shared Text Styles should be refactored into a Library.`,
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

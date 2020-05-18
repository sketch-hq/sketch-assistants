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
            message: i18n._(t`Text styles should use a shared style from a library`),
          },
        ])
        continue
      }

      const foreignTextStyle = foreignTextStyles.get(text.sharedStyleID)
      if (!foreignTextStyle) {
        utils.report([
          {
            object: text,
            message: i18n._(t`Text styles should use a shared style from a library`),
          },
        ])
        continue
      }

      const libName = foreignTextStyle.sourceLibraryName
      if (!authorizedLibraries.includes(libName) && authorizedLibraries.length > 0) {
        utils.report([
          {
            object: text,
            message: i18n._(t`Uses the unauthorized library "${libName}"`),
          },
        ])
        continue
      }

      if (!utils.textStyleEq(text.style, foreignTextStyle.localSharedStyle.value)) {
        utils.report([
          {
            object: text,
            message: i18n._(t`Shared text style is out of date with the library`),
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

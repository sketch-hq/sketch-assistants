import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

import { CreateRuleFunction } from '../..'

type StyleId = string

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const sharedStyles: Map<StyleId, FileFormat.SharedStyle> = new Map()

    for (const sharedStyle of utils.objects.sharedStyle) {
      if (typeof sharedStyle.do_objectID === 'string') {
        sharedStyles.set(sharedStyle.do_objectID, sharedStyle)
      }
    }

    for (const text of utils.objects.text) {
      if (typeof text.sharedStyleID !== 'string') continue
      const sharedStyle = sharedStyles.get(text.sharedStyleID)
      if (!sharedStyle) continue
      if (!utils.textStyleEq(text.style, sharedStyle.value)) {
        utils.report({
          object: text,
          message: i18n._(t`This text style is different from its shared style`),
        })
      }
    }
  }

  return {
    rule,
    name: 'text-styles-no-dirty',
    title: i18n._(t`Text Styles should be the same as their Shared Styles`),
    description: i18n._(
      t`If your team wants to strictly use shared text styles, you should either create a new shared style or set the text styles to one of the existing styles.`,
    ),
  }
}

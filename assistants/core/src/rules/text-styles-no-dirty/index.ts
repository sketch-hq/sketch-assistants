import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

import { CreateRuleFunction } from '../..'

type SharedStyle = FileFormat.SharedStyle

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    // Shared styles container, useful to quickly get them in the text
    // node iterator bellow
    const sharedStyles: Map<string, SharedStyle> = new Map()

    await utils.iterateCache({
      // Builds the shared styles container
      async sharedStyle(node) {
        const style: SharedStyle = node as SharedStyle
        if (typeof style.do_objectID === 'string') {
          sharedStyles.set(style.do_objectID, style)
        }
      },
      async text(node): Promise<void> {
        const layer = utils.nodeToObject<FileFormat.Text>(node)
        if (typeof layer.sharedStyleID === 'string') {
          // Get the shared style object
          const sharedStyle = sharedStyles.get(layer.sharedStyleID)
          if (sharedStyle) {
            // Report if this text style differs from its shared style
            if (!layer.style || !utils.textStyleEq(layer.style, sharedStyle.value)) {
              utils.report({
                node,
                message: i18n._(t`This text style is different from its shared style`),
              })
            }
          }
        }
      },
    })
  }

  return {
    rule,
    name: 'text-styles-no-dirty',
    title: i18n._(t`Text styles should be the same as their shared styles`),
    description: i18n._(
      t`If your team wants to strictly use shared text styles, you should either create a new shared style or set the text styles to one of the existing styles.`,
    ),
  }
}

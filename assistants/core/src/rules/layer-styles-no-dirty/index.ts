import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

import { CreateRuleFunction } from '../..'

// Do not check for style properties on these objects
const IGNORE_CLASSES = ['artboard', 'page', 'symbolMaster', 'text']

type SharedStyle = FileFormat.SharedStyle

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const sharedStyles: Map<string, SharedStyle> = new Map()

    await utils.iterateCache({
      // Build the shared styles container
      async sharedStyle(node) {
        const style: SharedStyle = node as SharedStyle
        if (typeof style.do_objectID === 'string') {
          sharedStyles.set(style.do_objectID, style)
        }
      },
      async $layers(node): Promise<void> {
        const layer = utils.nodeToObject<FileFormat.AnyLayer>(node)
        if (IGNORE_CLASSES.includes(node._class)) return
        // Ignore groups with default styles (i.e. no shadows)
        if (layer._class === 'group' && !layer.style?.shadows?.length) return
        if (typeof layer.sharedStyleID === 'string') {
          // Get the shared style object
          const sharedStyle = sharedStyles.get(layer.sharedStyleID)
          if (sharedStyle) {
            // Report if this layer style differs from its shared style
            if (!layer.style || !utils.styleEq(layer.style, sharedStyle.value)) {
              utils.report({
                node,
                message: i18n._(t`This layer style is different from its shared style`),
              })
            }
          }
        }
      },
    })
  }

  return {
    rule,
    name: 'layer-styles-no-dirty',
    title: i18n._(t`Layer styles should be the same as their shared style`),
    description: i18n._(
      t`If your team wants to strictly use shared styles, you should either create a new shared style or set the layer styles to one of the existing styles.`,
    ),
  }
}

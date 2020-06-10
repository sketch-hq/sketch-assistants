import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

import { CreateRuleFunction } from '../..'

// Do not check for style properties on these objects
const IGNORE_CLASSES = ['artboard', 'page', 'symbolMaster', 'text']

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

    for (const layer of utils.objects.anyLayer) {
      if (IGNORE_CLASSES.includes(layer._class)) continue // Ignore certain classes
      if (layer._class === 'group' && !layer.style?.shadows?.length) continue // Ignore groups with default styles
      if (typeof layer.sharedStyleID !== 'string') continue // Ignore if no shared style id
      const sharedStyle = sharedStyles.get(layer.sharedStyleID)
      if (!sharedStyle) continue // Ignore if shared style not found
      if (!layer.style || !utils.styleEq(layer.style, sharedStyle.value)) {
        utils.report({
          object: layer,
          message: i18n._(t`This Layers Style is different from its Shared Style`),
        })
      }
    }
  }

  return {
    rule,
    name: 'layer-styles-no-dirty',
    title: i18n._(t`Layers Styles should be the same as their Shared Style`),
    description: i18n._(
      t`If your team wants to strictly use shared styles, you should either create a new shared style or set the layer styles to one of the existing styles.`,
    ),
  }
}

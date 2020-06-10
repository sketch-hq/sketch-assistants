import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { isCombinedShapeChildLayer } from '../../rule-helpers'

const styleHasDisabledShadow = (style: FileFormat.Style): boolean =>
  Array.isArray(style.shadows) && style.shadows.some((shadow) => !shadow.isEnabled)

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    for (const layer of utils.objects.anyLayer) {
      if (isCombinedShapeChildLayer(layer, utils)) continue // Ignore layers in combined shapes
      if (!('style' in layer)) continue // Narrow type to layers with a `style` prop
      if (!layer.style) continue // Narrow type to truthy `style` prop
      if (typeof layer.sharedStyleID === 'string') continue // Ignore layers using a shared style
      if (styleHasDisabledShadow(layer.style)) {
        utils.report({
          object: layer,
          message: i18n._(t`There's a disabled shadow on this Layer Style`),
        })
      }
    }

    for (const sharedStyle of utils.objects.sharedStyle) {
      if (styleHasDisabledShadow(sharedStyle.value)) {
        utils.report({
          object: sharedStyle,
          message: i18n._(t`There's a disabled shadow on this Shared Style`),
        })
      }
    }
  }

  return {
    rule,
    name: 'shadows-no-disabled',
    title: i18n._(t`Styles should not have disabled shadows`),
    description: i18n._(
      t`Depending on what you're creating, disabled properties may cause uncertainty within your team. Removing them can help.`,
    ),
  }
}

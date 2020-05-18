import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const usages: Set<string> = new Set()

    for (const instance of utils.objects.symbolInstance) {
      instance.overrideValues.forEach((override) => {
        if (typeof override.value === 'string') usages.add(override.value)
      })
    }

    for (const layer of utils.objects.anyLayer) {
      if ('sharedStyleID' in layer && typeof layer.sharedStyleID === 'string') {
        usages.add(layer.sharedStyleID)
      }
    }

    const invalid: FileFormat.SharedStyle[] = [...utils.objects.sharedStyle].filter(
      (style) => !usages.has(style.do_objectID),
    )

    utils.report(
      invalid.map((object) => ({
        message: i18n._(t`This shared style is unused`),
        object,
      })),
    )
  }

  return {
    rule,
    name: 'shared-styles-no-unused',
    title: i18n._(t`All shared styles should be used`),
    description: i18n._(
      t`Some teams may consider unused shared styles a document organization issue.`,
    ),
  }
}

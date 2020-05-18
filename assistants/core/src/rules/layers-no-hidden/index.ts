import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    for (const layer of utils.objects.anyLayer) {
      if (layer.isVisible === false) {
        utils.report({
          object: layer,
          message: i18n._(t`This layer is hidden`),
        })
      }
    }
  }

  return {
    rule,
    name: 'layers-no-hidden',
    title: i18n._(t`There should be no hidden layers`),
    description: i18n._(
      t`Hidden layers may cause uncertainty. Some teams may want to remove them.`,
    ),
  }
}

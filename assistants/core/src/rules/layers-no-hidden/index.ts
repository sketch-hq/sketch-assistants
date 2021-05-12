import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    for (const layer of utils.objects.anyLayer) {
      if (layer.isVisible === false) {
        utils.report(t`This layer is hidden`, layer)
      }
    }
  }

  return {
    rule,
    name: 'layers-no-hidden',
    title: t`There should be no hidden layers`,
    description: t`Hidden layers may cause uncertainty. Some teams may want to remove them.`,
  };
}

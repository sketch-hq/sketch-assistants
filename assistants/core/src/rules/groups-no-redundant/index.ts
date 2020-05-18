import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    for (const group of utils.objects.group) {
      const usesSharedStyle = typeof group.sharedStyleID === 'string'
      const isStyled = group.style && group.style.shadows && group.style.shadows.length > 0
      const hasOneChild = group.layers.length === 1
      const onlyChildIsGroup = hasOneChild && group.layers[0]._class === 'group'
      if (!usesSharedStyle && !isStyled && hasOneChild && onlyChildIsGroup) {
        utils.report({
          object: group,
          message: i18n._(t`This group is redundant`),
        })
      }
    }
  }

  return {
    rule,
    name: 'groups-no-redundant',
    title: i18n._(t`Groups should not be redundant`),
    description: i18n._(
      t`Remove redundant groups to avoid document organization or usability issues. These are groups that aren't styled and only contain one layer.`,
    ),
  }
}

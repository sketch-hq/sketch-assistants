import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const symbols = new Map<string, string>()
    for (const master of utils.objects.symbolMaster) {
      symbols.set(master.symbolID, master.name)
    }
    for (const master of utils.foreignObjects.symbolMaster) {
      symbols.set(master.symbolID, master.name)
    }
    for (const group of utils.objects.group) {
      const detachedSymbolID = group?.userInfo?.['com.sketch.detach']?.symbolMaster?.symbolID
      if (symbols.has(detachedSymbolID)) {
        const symbolName = symbols.get(detachedSymbolID)
        utils.report({
          message: i18n._(t`This group was detached from the symbol named "${symbolName}"`),
          object: group,
        })
      }
    }
  }

  return {
    rule,
    name: 'symbols-no-detached',
    title: i18n._(t`Symbols should not be detached`),
    description: i18n._(
      t`Detached symbols could indicate an unwanted divergence from a style guide or library.`,
    ),
  }
}

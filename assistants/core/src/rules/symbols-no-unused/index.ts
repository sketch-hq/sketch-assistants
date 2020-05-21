import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const masters = Array.from(utils.objects.symbolMaster)
    const instances = Array.from(utils.objects.symbolInstance)
    const overrides = Array.from(utils.objects.overrideValue)

    const invalid: FileFormat.SymbolMaster[] = masters.filter((master) => {
      const noInstances =
        instances.findIndex((instance) => instance.symbolID === master.symbolID) === -1
      const noOverrides =
        overrides.findIndex((override) => override.value === master.symbolID) === -1
      return noInstances && noOverrides
    })

    utils.report(
      invalid.map((object) => ({
        message: i18n._(t`This symbol is unused`),
        object,
      })),
    )
  }

  return {
    rule,
    name: 'symbols-no-unused',
    title: i18n._(t`All symbols should be in-use`),
    description: i18n._(t`Some teams may consider unused symbols a document organization issue.`),
  }
}

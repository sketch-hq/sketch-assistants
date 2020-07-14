import { t } from '@lingui/macro'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: async (context) => {
      context.utils.report(i18n._(t`This rule waits 5 seconds after reporting this violation`))
      await new Promise((resolve) => setTimeout(resolve, 5000))
    },
    name: 'debug-timeout',
    title: i18n._(t`Debug timeout`),
    description: i18n._(t`Internal debug rule that times-out`),
    debug: true,
  }
}

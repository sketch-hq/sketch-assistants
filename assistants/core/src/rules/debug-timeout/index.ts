import { t } from '@lingui/macro'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: async (context) => {
      context.utils.report(t`This rule waits 5 seconds after reporting this violation`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    },
    name: 'debug-timeout',
    title: t`Debug timeout`,
    description: t`Internal debug rule that times-out`,
    debug: true,
  };
}

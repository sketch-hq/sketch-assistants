import { t } from '@lingui/macro'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: async () => {
      throw new Error('Test error message')
    },
    name: 'debug-throws-error',
    title: i18n._(t`Debug throws error`),
    description: i18n._(t`Internal debug rule that always throws a rule error`),
    debug: true,
  }
}

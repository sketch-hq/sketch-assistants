import { t } from '@lingui/macro'
import { RuleFunction } from '@sketch-hq/sketch-assistant-types'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context): Promise<void> => {
    context.utils.report(t`Hello world`)
  }

  return {
    rule,
    name: 'debug-i18n',
    title: t`Debug internationalization`,
    description: t`Internal debug rule that generates a violation with a translated message`,
    debug: true,
  };
}

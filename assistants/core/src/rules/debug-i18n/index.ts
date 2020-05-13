import { t } from '@lingui/macro'
import { RuleFunction } from '@sketch-hq/sketch-assistant-types'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context): Promise<void> => {
    context.utils.report({
      message: i18n._(t`Hello world`),
    })
  }

  return {
    rule,
    name: 'debug-i18n',
    title: i18n._(t`Debug internationalization`),
    description: i18n._(
      t`Internal debug rule that generates a violation with a translated message`,
    ),
    debug: true,
  }
}

import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const messages = utils.getOption('messages')

    if (!Array.isArray(messages)) return

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (typeof message === 'string') {
        utils.report({
          message: i18n._(t`Unchecked message "${message}"`),
        })
      }
    }
  }

  return {
    rule,
    name: 'result-messages-include',
    title: i18n._(t`Checklist messages`),
    description: i18n._(t`Define a list of messages to check for`),
    getOptions(helpers) {
      return [
        helpers.stringArrayOption({
          name: 'messages',
          title: i18n._(t`Messages`),
          description: i18n._(t`An array of messages to check for`),
        }),
      ]
    },
  }
}

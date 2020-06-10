import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { assertArray } from '../../guards'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const messages = utils.getOption('messages')
    assertArray(messages)

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (typeof message === 'string') {
        utils.report({
          message: i18n._(t`You have an unread message "${message}"`),
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
          description: i18n._(t`A range of messages to check for`),
        }),
      ]
    },
  }
}

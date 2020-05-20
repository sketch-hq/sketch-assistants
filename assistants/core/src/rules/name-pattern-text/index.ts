import { t } from '@lingui/macro'
import { FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { createNamePatternRuleFunction } from '../../rule-helpers'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: createNamePatternRuleFunction(i18n, [FileFormat.ClassValue.Text]),
    name: 'name-pattern-text',
    title: i18n._(t`Text names should follow the conventions`),
    description: i18n._(
      t`Teams might want to enforce specific naming patterns when it's important that your layers are precisely named.`,
    ),
    getOptions(helpers) {
      return [
        helpers.stringArrayOption({
          name: 'allowed',
          title: i18n._(t`Allowable Patterns`),
          description: i18n._(t`A list of regular expressions that define which names are allowed`),
        }),
        helpers.stringArrayOption({
          name: 'forbidden',
          title: i18n._(t`Forbidden Patterns`),
          description: i18n._(
            t`A list of regular expressions that define which names are forbidden`,
          ),
        }),
      ]
    },
  }
}

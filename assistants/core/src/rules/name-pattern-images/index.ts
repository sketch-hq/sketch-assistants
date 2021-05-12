import { t } from '@lingui/macro'
import { FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { createNamePatternRuleFunction } from '../../rule-helpers'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: createNamePatternRuleFunction(i18n, [FileFormat.ClassValue.Bitmap]),
    name: 'name-pattern-images',
    title: t`Image names should follow the conventions`,
    description: t`Teams might want to enforce specific naming patterns when it's important that your layers are precisely named.`,
    getOptions(helpers) {
      return [
        helpers.stringArrayOption({
          name: 'allowed',
          title: t`Allowable Patterns`,
          description: t`A list of regular expressions that define which names are allowed`,
        }),
        helpers.stringArrayOption({
          name: 'forbidden',
          title: t`Forbidden Patterns`,
          description: t`A list of regular expressions that define which names are forbidden`,
        }),
      ];
    },
  };
}

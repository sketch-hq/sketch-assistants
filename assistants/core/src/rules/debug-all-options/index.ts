import { t } from '@lingui/macro'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: async () => {},
    name: 'debug-all-options',
    title: i18n._(t`Debug all options`),
    description: i18n._(
      t`Internal debug rule that defines examples of all available option schema types`,
    ),
    getOptions(helpers) {
      return [
        helpers.numberOption({
          name: 'numberOption',
          title: i18n._(t`Number Option`),
          defaultValue: 1.5,
          description: i18n._(t`A number option`),
          minimum: 0,
          maximum: 100,
        }),
        helpers.integerOption({
          name: 'integerOption',
          title: i18n._(t`Integer Option`),
          defaultValue: 1,
          description: i18n._(t`An integer option`),
          minimum: 0,
          maximum: 100,
        }),
        helpers.stringOption({
          name: 'stringOption',
          title: i18n._(t`String Option`),
          description: i18n._(t`A string option`),
          pattern: '^[A-Za-z\\s]*$',
          defaultValue: i18n._(t`Default value`),
          minLength: 5,
          maxLength: 20,
        }),
        helpers.booleanOption({
          name: 'booleanOption',
          title: i18n._(t`Boolean Option`),
          description: i18n._(t`A boolean option`),
          defaultValue: true,
        }),
        helpers.stringEnumOption({
          name: 'stringEnumOption',
          title: i18n._(t`String Enum Option`),
          description: i18n._(t`A string enum option`),
          defaultValue: 'foo',
          values: ['foo', 'bar', 'baz'],
          valueTitles: ['Foo', 'Bar', 'Baz'],
        }),
        helpers.stringArrayOption({
          name: 'stringArrayOption',
          title: i18n._(t`String Array Option`),
          description: i18n._(t`A string array option`),
          defaultValue: ['foo'],
          pattern: '^[A-Za-z\\s]*$',
          minLength: 5,
          maxLength: 20,
        }),
        helpers.objectArrayOption({
          name: 'objectArrayOption',
          title: i18n._(t`Object Array Option`),
          description: i18n._(t`An object array option`),
          props: [
            helpers.numberOption({
              name: 'objectArrayNumberOption',
              title: i18n._(t`Object Array Number Option`),
              description: i18n._(t`An object array number option`),
            }),
          ],
        }),
      ]
    },
    debug: true,
  }
}

import { t } from '@lingui/macro'
import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  return {
    rule: async () => {},
    name: 'debug-all-options',
    title: t`Debug all options`,
    description: t`Internal debug rule that defines examples of all available option schema types`,
    getOptions(helpers) {
      return [
        helpers.numberOption({
          name: 'numberOption',
          title: t`Number Option`,
          defaultValue: 1.5,
          description: t`A number option`,
          minimum: 0,
          maximum: 100,
        }),
        helpers.integerOption({
          name: 'integerOption',
          title: t`Integer Option`,
          defaultValue: 1,
          description: t`An integer option`,
          minimum: 0,
          maximum: 100,
        }),
        helpers.stringOption({
          name: 'stringOption',
          title: t`String Option`,
          description: t`A string option`,
          pattern: '^[A-Za-z\\s]*$',
          defaultValue: t`Default value`,
          minLength: 5,
          maxLength: 20,
        }),
        helpers.booleanOption({
          name: 'booleanOption',
          title: t`Boolean Option`,
          description: t`A boolean option`,
          defaultValue: true,
        }),
        helpers.stringEnumOption({
          name: 'stringEnumOption',
          title: t`String Enum Option`,
          description: t`A string enum option`,
          defaultValue: 'foo',
          values: ['foo', 'bar', 'baz'],
          valueTitles: ['Foo', 'Bar', 'Baz'],
        }),
        helpers.stringArrayOption({
          name: 'stringArrayOption',
          title: t`String Array Option`,
          description: t`A string array option`,
          defaultValue: ['foo'],
          pattern: '^[A-Za-z\\s]*$',
          minLength: 5,
          maxLength: 20,
        }),
        helpers.objectArrayOption({
          name: 'objectArrayOption',
          title: t`Object Array Option`,
          description: t`An object array option`,
          props: [
            helpers.numberOption({
              name: 'objectArrayNumberOption',
              title: t`Object Array Number Option`,
              description: t`An object array number option`,
            }),
          ],
        }),
      ];
    },
    debug: true,
  };
}

import { t, plural } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { assertNumber } from '../../guards'
import { isChildOfClass } from '../../rule-helpers'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const maxIdentical = utils.getOption('maxIdentical')
    assertNumber(maxIdentical)

    const results: Map<string, FileFormat.Text[]> = new Map()

    for (const text of utils.objects.text) {
      if (typeof text.sharedStyleID === 'string') continue // Ignore layers using a shared style
      // Determine whether we're inside a symbol instance, if so return early since
      // duplicate layer styles are to be expected across the docucument in instances
      if (isChildOfClass(text, FileFormat.ClassValue.SymbolInstance, utils)) continue
      // Get a string hash of the style object.
      const hash = utils.textStyleHash(text.style)
      // Add the style object hash and current node to the result set
      if (results.has(hash)) {
        const texts = results.get(hash)
        texts?.push(text)
      } else {
        results.set(hash, [text])
      }
    }

    // Loop the results, generating violations as needed
    for (const [, texts] of results) {
      const numIdentical = texts.length
      if (numIdentical > maxIdentical) {
        utils.report(
          texts.map((object) => ({
            object,
            message: i18n._(
              plural({
                value: maxIdentical,
                one: `Expected no identical text styles in the document, but found ${numIdentical} matching this layer's text style. Consider a shared text style instead`,
                other: `Expected a maximum of # identical text styles in the document, but found ${numIdentical} instances of this layer's text style. Consider a shared text style instead`,
              }),
            ),
          })),
        )
      }
    }
  }

  return {
    rule,
    name: 'text-styles-prefer-shared',
    title: (ruleConfig) => {
      const { maxIdentical } = ruleConfig
      if (typeof maxIdentical !== 'number') return ''
      return i18n._(
        plural({
          value: maxIdentical,
          one: 'Text styles should not be identical',
          other: 'No more than # text styles should be identical',
        }),
      )
    },
    description: i18n._(
      t`You could simplify things by removing identical text styles and applying a single style to all affected text.`,
    ),
    getOptions: (helpers) => [
      helpers.integerOption({
        name: 'maxIdentical',
        title: i18n._(t`Max Identical`),
        description: i18n._(t`The maximum allowed number of identical text styles`),
        minimum: 1,
        defaultValue: 1,
      }),
    ],
  }
}

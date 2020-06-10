import { t, plural } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { isCombinedShapeChildLayer, isChildOfClass } from '../../rule-helpers'

function assertMaxIdentical(val: unknown): asserts val is number {
  if (typeof val !== 'number') {
    throw new Error()
  }
}

// Do not check for duplicate style properties on these objects
const IGNORE_CLASSES = ['artboard', 'page', 'symbolMaster', 'text']

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    // Gather option value and assert its type
    const maxIdentical = utils.getOption('maxIdentical')
    assertMaxIdentical(maxIdentical)
    const results: Map<string, FileFormat.AnyLayer[]> = new Map()
    for (const layer of utils.objects.anyLayer) {
      if (IGNORE_CLASSES.includes(layer._class)) continue
      if (isCombinedShapeChildLayer(layer, utils)) continue // Ignore layers in combined shapes
      if (layer._class === 'group' && !layer.style?.shadows?.length) continue // Ignore groups with default styles (i.e. no shadows)
      if (typeof layer.sharedStyleID === 'string') continue // Ignore layers using a shared style

      // Determine whether we're inside a symbol instance, if so return early since
      // duplicate layer styles are to be expected across the docucument in instances
      if (isChildOfClass(layer, FileFormat.ClassValue.SymbolInstance, utils)) {
        continue
      }

      // Get an md5 hash of the style object. Only consider a subset of style
      // object properties when computing the hash (can revisit this to make the
      // check looser or stricter)
      const hash = utils.styleHash(layer.style)
      // Add the style object hash and current node to the result set
      if (results.has(hash)) {
        const layers = results.get(hash)
        layers?.push(layer)
      } else {
        results.set(hash, [layer])
      }
    }
    // Loop the results, generating violations as needed
    for (const [, nodes] of results) {
      const numIdentical = nodes.length
      if (numIdentical > maxIdentical) {
        utils.report(
          nodes.map((object) => ({
            object,
            message: i18n._(
              plural({
                value: maxIdentical,
                one: `Expected no identical layer styles in the document, but found ${numIdentical} matching this layer's style. Consider a shared style instead`,
                other: `Expected a maximum of # identical layer styles in the document, but found ${numIdentical} instances of this layer's style. Consider a shared style instead`,
              }),
            ),
          })),
        )
      }
    }
  }

  return {
    rule,
    name: 'layer-styles-prefer-shared',
    title: (ruleConfig) => {
      const { maxIdentical } = ruleConfig
      if (typeof maxIdentical !== 'number') return ''
      return i18n._(
        plural({
          value: maxIdentical,
          one: 'Layer Styles should not be identical',
          other: 'No more than # Layer Styles should be identical',
        }),
      )
    },
    description: i18n._(
      t`You could simplify things by removing identical shared styles and applying a single Style to all the affected layers.`,
    ),
    getOptions: (helpers) => [
      helpers.integerOption({
        name: 'maxIdentical',
        title: i18n._(t`Max Identical`),
        description: i18n._(t`The maximum allowed number of identical Layer Styles`),
        minimum: 1,
        defaultValue: 1,
      }),
    ],
  }
}

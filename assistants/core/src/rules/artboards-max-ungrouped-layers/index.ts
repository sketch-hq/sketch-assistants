import { t, plural } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

function assertMaxUngrouped(maxUngroupedLayers: unknown): asserts maxUngroupedLayers is number {
  if (typeof maxUngroupedLayers !== 'number') throw Error()
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const maxUngroupedLayers = utils.getOption('maxUngroupedLayers')
    assertMaxUngrouped(maxUngroupedLayers)
    for (const artboard of utils.objects.artboard) {
      const nonGroupLayers = artboard.layers.filter((layer) => layer._class !== 'group').length
      if (nonGroupLayers > maxUngroupedLayers) {
        utils.report({
          object: artboard,
          message: i18n._(
            plural({
              value: nonGroupLayers,
              one: `There is one ungrouped layer within this Artboard`,
              other: `There are # ungrouped layers within this Artboard`,
            }),
          ),
        })
      }
    }
  }

  return {
    rule,
    name: 'artboards-max-ungrouped-layers',
    title: (ruleConfig) => {
      const { maxUngroupedLayers } = ruleConfig
      if (typeof maxUngroupedLayers !== 'number') return ''
      return i18n._(
        plural({
          value: maxUngroupedLayers,
          one: 'Artboards should only have one ungrouped layers',
          other: 'Artboards should have less than # ungrouped layers',
        }),
      )
    },
    description: i18n._(t`Grouping layers within your Artboards will help you stay organized.`),
    getOptions(helpers) {
      return [
        helpers.numberOption({
          name: 'maxUngroupedLayers',
          title: i18n._(t`Maximum Ungrouped Layers`),
          defaultValue: 5,
          description: i18n._(t`The maximum number of ungrouped layers`),
          minimum: 1,
        }),
      ]
    },
  }
}

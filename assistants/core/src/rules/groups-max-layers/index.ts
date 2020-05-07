import { t, plural } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

function assertMaxLayers(maxLayers: unknown): asserts maxLayers is number {
  if (typeof maxLayers !== 'number') throw new Error()
}

function assertSkipClasses(skipClasses: unknown): asserts skipClasses is string[] {
  if (!Array.isArray(skipClasses)) throw new Error()
  for (const el of skipClasses) {
    if (typeof el !== 'string') throw new Error()
  }
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const maxLayers = utils.getOption('maxLayers')
    const skipClasses = utils.getOption('skipClasses')

    assertMaxLayers(maxLayers)
    assertSkipClasses(skipClasses)

    await utils.iterateCache({
      async $groups(node): Promise<void> {
        const group = utils.nodeToObject<FileFormat.AnyGroup>(node)
        if (group._class === 'shapeGroup') return // Do not consider shape groups, its common/expected for these to have many layers
        const numLayers = group.layers.filter((layer) => !skipClasses.includes(layer._class)).length
        if (numLayers > maxLayers) {
          utils.report({
            node,
            message: i18n._(
              plural({
                value: numLayers,
                one: 'There is one layer in this group',
                other: 'There are # layers in this group',
              }),
            ),
          })
        }
      },
    })
  }

  return {
    rule,
    name: 'groups-max-layers',
    title: (ruleConfig) => {
      const { maxLayers } = ruleConfig
      return i18n._(
        plural({
          value: maxLayers as number,
          one: 'Groups should only have one layer',
          other: 'Groups should have less than # layers',
        }),
      )
    },
    description: i18n._(
      t`Groups with large layer counts could be considered a document hygiene or usability concern by some teams who may wish to limit the count.`,
    ),
    getOptions(helpers) {
      return [
        helpers.numberOption({
          name: 'maxLayers',
          title: i18n._(t`Maximum Layers`),
          defaultValue: 50,
          description: i18n._(t`Maximum layers in a group`),
          minimum: 1,
        }),
        helpers.stringArrayOption({
          name: 'skipClasses',
          title: i18n._(t`Skip Classes`),
          description: i18n._(
            t`An array of Sketch file class values for layers that should be skipped and not counted when calculating the number of child layers in a group`,
          ),
        }),
      ]
    },
  }
}

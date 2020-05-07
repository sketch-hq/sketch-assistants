import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { ImageUsage, createImageProcessor } from '../../rule-helpers'

function assertOption(value: unknown): asserts value is number {
  if (typeof value !== 'number') throw new Error()
}

const isValidUsage = (usage: ImageUsage, minRatio: number): boolean => {
  const { frame, imageMetadata } = usage
  const { width, height } = imageMetadata
  const isWidthUndersized = width < frame.width * minRatio
  const isHeightUndersized = height < frame.height * minRatio
  return !isWidthUndersized && !isHeightUndersized
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const minRatio = utils.getOption('minRatio')
    assertOption(minRatio)

    const imageProcessor = createImageProcessor(utils.getImageMetadata, utils.nodeToObject)

    await utils.iterateCache({
      async $layers(node): Promise<void> {
        imageProcessor.handleLayerImages(node)
      },
    })

    const results = await imageProcessor.getResults()

    for (const usages of results.values()) {
      for (const usage of usages) {
        if (!isValidUsage(usage, minRatio)) {
          let message
          switch (usage.type) {
            case 'bitmap':
              message = i18n._(
                t`Unexpected undersized image used in image layer, must fill at least ${
                  minRatio * 100
                }% of the layer frame's width or height`,
              )
              break
            case 'fill':
              message = i18n._(
                t`Unexpected undersized image used in layer style image fill, must fill at least ${
                  minRatio * 100
                }% of the layer frame's width or height`,
              )
              break
          }
          utils.report({
            node: usage.node,
            message,
          })
        }
      }
    }
  }

  return {
    rule,
    name: 'images-no-undersized',
    title: (ruleConfig) =>
      i18n._(t`Images must be no less than ${ruleConfig.minRatio}x smaller than their frame`),
    description: i18n._(
      t`Image bitmaps smaller than their layer might produce poor results in exported graphics. Some teams may wish to put limits in place to prevent this`,
    ),
    getOptions(helpers) {
      return [
        helpers.numberOption({
          name: 'minRatio',
          title: i18n._(t`Minium Allowed Ratio`),
          defaultValue: 1,
          description: i18n._(
            t`How much smaller an image can be in relation to its frame and still be considered valid`,
          ),
          minimum: 0,
          maximum: 1,
        }),
      ]
    },
  }
}

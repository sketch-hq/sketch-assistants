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

    const imageProcessor = createImageProcessor(utils.getImageMetadata)

    for (const layer of utils.objects.anyLayer) {
      imageProcessor.handleLayerImages(layer)
    }

    const results = await imageProcessor.getResults()

    for (const usages of results.values()) {
      for (const usage of usages) {
        if (!isValidUsage(usage, minRatio)) {
          let message
          switch (usage.type) {
            case 'bitmap':
              message = i18n._(
                t`There's an undersized image in this layer. Images must fill at least ${
                  minRatio * 100
                }% of the layer frame's width or height.`,
              )
              break
            case 'fill':
              message = i18n._(
                t`There's an undersized image in this Layer Style image fill. Images must fill at least ${
                  minRatio * 100
                }% of the layer frame's width or height.`,
              )
              break
          }
          utils.report({
            object: usage.object,
            message,
          })
        }
      }
    }
  }

  return {
    rule,
    name: 'images-no-undersized',
    title: (ruleConfig) => {
      const { minRatio } = ruleConfig
      return i18n._(t`Images shouldn't be less than ${minRatio}x bigger than their frame`)
    },
    description: i18n._(
      t`Images that are smaller than their layer might result in low-quality exported assets, so some teams might want to limit this.`,
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

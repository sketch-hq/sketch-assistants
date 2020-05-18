import { t } from '@lingui/macro'
import { RuleContext, RuleFunction } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { ImageUsage, createImageProcessor } from '../../rule-helpers'

function assertOption(value: unknown): asserts value is number {
  if (typeof value !== 'number') throw new Error()
}

const isValidUsage = (usage: ImageUsage, maxRatio: number): boolean => {
  const { frame, imageMetadata } = usage
  const { width, height } = imageMetadata
  const isWidthOversized = frame.width * maxRatio < width
  const isHeightOversized = frame.height * maxRatio < height
  return !isWidthOversized && !isHeightOversized
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const maxRatio = utils.getOption('maxRatio')
    assertOption(maxRatio)

    const imageProcessor = createImageProcessor(utils.getImageMetadata)

    for (const layer of utils.objects.anyLayer) {
      imageProcessor.handleLayerImages(layer)
    }

    const results = await imageProcessor.getResults()

    for (const usages of results.values()) {
      // In order for any usage of an image to be considered invalid, all other
      // usages of it throughout the document must also be invalid - in other words,
      // if an image has been used correctly at least once it has earned its
      // filesize penality in the document

      // Bail early from this loop iteration if at least one usage of this
      // image is valid
      const atLeaseOneValid = usages.map((usage) => isValidUsage(usage, maxRatio)).includes(true)
      if (atLeaseOneValid) continue

      // Having got to this point we know that all usages of the image are
      // invalid, i.e. oversized, so generate a violation for each containing
      // layer
      for (const usage of usages) {
        let message
        switch (usage.type) {
          case 'bitmap':
            message = i18n._(
              t`Unexpected oversized image used in image layer, must be no more than ${maxRatio}x larger than the layer frame's width or height`,
            )
            break
          case 'fill':
            message = i18n._(
              t`Unexpected oversized image used in layer style image fill, must be no more than ${maxRatio}x larger than the layer frame's width or height`,
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

  return {
    rule,
    name: 'images-no-outsized',
    title: (ruleConfig) => {
      const { maxRatio } = ruleConfig
      return i18n._(t`Images should be no more than ${maxRatio}x larger than their frame`)
    },
    description: i18n._(
      t`Image bitmaps much larger than their layer needlessly swell the document size and potentially cause performance problems navigating the document. Some teams may wish to put limits in place to prevent this`,
    ),
    getOptions(helpers) {
      return [
        helpers.numberOption({
          name: 'maxRatio',
          title: i18n._(t`Maximum Ratio`),
          defaultValue: 1,
          description: i18n._(
            t`How much larger an image can be than its frame and still be considered valid`,
          ),
          minimum: 1,
        }),
      ]
    },
  }
}

import { t } from '@lingui/macro'
import {
  RuleContext,
  RuleFunction,
  PointerValue,
  FileFormat,
} from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

const INCREMENTS: { [key: string]: string[] } = {
  '@1x': ['0.00'],
  '@2x': ['0.00', '0.50'],
  '@3x': ['0.00', '0.33', '0.67'],
}

const isRotated = (value: PointerValue) =>
  typeof value === 'object' && 'rotation' in value && value.rotation !== 0

const parseIncrements = (scaleFactors: unknown): string[] => {
  if (!scaleFactors || !Array.isArray(scaleFactors)) return []
  let validIncrements: string[] = []
  for (let i = 0; i < scaleFactors.length; i++) {
    const scaleFactor = scaleFactors[i]
    if (typeof scaleFactor === 'string') {
      const increments = INCREMENTS[scaleFactor]
      if (Array.isArray(increments)) {
        validIncrements = [...validIncrements, ...increments]
      }
    }
  }
  return [...new Set(validIncrements)]
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const increments = parseIncrements(utils.getOption('scaleFactors'))
    await utils.iterateCache({
      async $layers(node): Promise<void> {
        const layer = utils.nodeToObject<FileFormat.AnyLayer>(node)
        if (!('frame' in layer)) return // Narrow type to layers with a `frame` prop
        // If the current layer or any of its parents have rotation return early
        let hasRotation = isRotated(node)
        utils.iterateParents(node, (parent) => {
          if (isRotated(parent)) {
            hasRotation = true
          }
        })
        if (hasRotation) return
        let { x, y } = layer.frame
        // Round x,y values to two decimal places to mimick how Sketch normalises
        // values too. This avoids reporting subpixel violations that don't match
        // with what Sketch displays in the inspector
        x = Math.round(x * 100) / 100
        y = Math.round(y * 100) / 100
        // Convert x,y values to increment values (e.g `12.5` to `0.50`) and check
        // to see if they're valid
        const xValid = increments.includes(Math.abs(x % 1).toFixed(2))
        const yValid = increments.includes(Math.abs(y % 1).toFixed(2))
        if (!xValid || !yValid) {
          utils.report({
            node,
            message: i18n._(t`Unexpected sub-pixel positioning (${x}, ${y})`),
          })
        }
      },
    })
  }

  return {
    rule,
    name: 'layers-subpixel-positioning',
    title: (ruleConfig) => {
      const increments = parseIncrements(ruleConfig.scaleFactors as string[]).join(', ')
      return i18n._(t`Layers must be placed on ${increments} sub-pixel increments`)
    },
    description: i18n._(
      t`Some teams may consider layers place on sub-pixel values a document organization issue. The exception is if you're designing for devices with @2x and @3x pixel density. In this case, you can use 0.5 and 0.33/0.67 increments.`,
    ),
    getOptions(helpers) {
      return [
        helpers.stringArrayOption({
          name: 'scaleFactors',
          title: i18n._(t`Scale Factors`),
          description: i18n._(
            t`Choose the scale factors that the document supports. Accepted values are @1x, @2x and @3x, which allow whole pixel positions, 0.5 increments and 0.33 increments respectively`,
          ),
          minLength: 1,
          maxLength: 3,
          pattern: '^@[1-3]x$',
        }),
      ]
    },
  }
}

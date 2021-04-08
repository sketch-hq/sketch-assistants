import { t, plural } from '@lingui/macro'
import {
  RuleContext,
  RuleFunction,
  FileFormat,
  SketchFileObject,
} from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'
import { isDefined } from '../../guards'

/**
 * Option value type guard.
 */
function assertMaxIdentical(val: unknown): asserts val is number {
  if (typeof val !== 'number') {
    throw new Error()
  }
}

/**
 * Determine whether a Color object is defined and linked to a color variable.
 */
const colorUsesVariable = (color: FileFormat.Color | undefined): boolean =>
  typeof color !== 'undefined' && typeof color.swatchID === 'string'

/**
 * Convert a Color object to a RGBA hex string.
 */
const getRGBA = (color: FileFormat.Color): string => {
  const r = Math.round(color.red * 255)
  const g = Math.round(color.green * 255)
  const b = Math.round(color.blue * 255)
  const a = Math.round(color.alpha * 255)
  const rgb = (b | (g << 8) | (r << 16) | (1 << 24)).toString(16).slice(1)
  const alpha = (a | (1 << 8)).toString(16).slice(1)
  return `${rgb}${alpha}`.toUpperCase()
}

/**
 * Convert a Color object to a RGB hex string.
 */
const getRGB = (color: FileFormat.Color): string => {
  return getRGBA(color).substring(0, 6)
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    // Color variables are only available from Sketch 69 onwards

    if (parseFloat(context.file.original.contents.meta.appVersion) < 69) return

    // Gather option value and assert its type

    const maxIdentical = utils.getOption('maxIdentical')
    assertMaxIdentical(maxIdentical)

    // Setup results data structure. Maps unique Color object string hash (in
    // this case, a hex string) to an array of file objects and color pairs
    // where it sees usage.

    const results: Map<string, [FileFormat.Color, SketchFileObject][]> = new Map()

    const addResult = (color: FileFormat.Color, object: SketchFileObject) => {
      if (colorUsesVariable(color)) return
      const hash = getRGBA(color)
      results.set(hash, [...(results.get(hash) || []), [color, object]])
    }

    // Handle colors applied to text layers and substrings

    for (const text of utils.objects.text) {
      const colors = text.attributedString.attributes
        .map((item) => item.attributes)
        .map((attribute) => attribute.MSAttributedStringColorAttribute)
        .filter(isDefined)

      for (const color of colors) {
        addResult(color, text)
      }
    }

    // Handle Artboard background colors

    for (const artboard of utils.objects.artboard) {
      if (artboard.hasBackgroundColor) addResult(artboard.backgroundColor, artboard)
    }

    // Handle Slice background colors

    for (const slice of utils.objects.slice) {
      if (slice.hasBackgroundColor) addResult(slice.backgroundColor, slice)
    }

    // Handle Symbol Master background colors

    for (const symbolMaster of utils.objects.symbolMaster) {
      if (symbolMaster.hasBackgroundColor) addResult(symbolMaster.backgroundColor, symbolMaster)
    }

    // Handle colors in layer styles

    for (const layer of [
      ...utils.objects.bitmap,
      ...utils.objects.group,
      ...utils.objects.oval,
      ...utils.objects.polygon,
      ...utils.objects.rectangle,
      ...utils.objects.star,
      ...utils.objects.symbolInstance,
      ...utils.objects.text,
      ...utils.objects.triangle,
    ]) {
      for (const fill of layer.style?.fills || []) {
        if (fill.isEnabled) addResult(fill.color, layer)
      }

      for (const border of layer.style?.borders || []) {
        if (border.isEnabled) addResult(border.color, layer)
      }

      for (const shadow of layer.style?.shadows || []) {
        if (shadow.isEnabled) addResult(shadow.color, layer)
      }

      for (const innerShadow of layer.style?.innerShadows || []) {
        if (innerShadow.isEnabled) addResult(innerShadow.color, layer)
      }
    }

    // Report results. We want one report per unique color usage

    for (const [, objects] of results) {
      const color = objects[0][0]
      const hex = getRGB(color)
      const alpha = color.alpha * 100
      const layers = objects.map((o) => o[1])
      const count = layers.length
      if (count <= maxIdentical) continue
      const message =
        alpha === 100
          ? i18n._(
              plural(maxIdentical, {
                1: `Expected the color "${hex}" to only appear once, but found ${count} usages. Consider a color variable instead`,
                other: `Expected the color "${hex}" to appear no more than # times, but found ${count} usages. Consider a color variable instead`,
              }),
            )
          : i18n._(
              plural(maxIdentical, {
                1: `Expected the color "${hex}" with an alpha value of ${alpha}% to only appear once, but found ${count} usages. Consider a color variable instead`,
                other: `Expected the color "${hex}" with an alpha value of ${alpha}% to appear no more than # times, but found ${count} usages. Consider a color variable instead`,
              }),
            )

      utils.report(
        message,
        ...new Set(layers), // De-dupe reported layers, handles case where the same layer may contain multiple usages of the same color
      )
    }
  }

  return {
    rule,
    name: 'colors-prefer-variable',
    title: (ruleConfig) => {
      const { maxIdentical } = ruleConfig
      if (typeof maxIdentical !== 'number') return ''
      return i18n._(
        plural(maxIdentical, {
          0: 'Colors should always use color variables',
          1: 'Identical colors should use color variables',
          other: 'More than # identical colors should use color variables',
        }),
      )
    },
    description: i18n._(t`You could simplify things by using color variables instead.`),
    getOptions: (helpers) => [
      helpers.integerOption({
        name: 'maxIdentical',
        title: i18n._(t`Max Identical`),
        description: i18n._(t`The maximum allowed number of identical colors`),
        minimum: 0,
        defaultValue: 1,
      }),
    ],
  }
}

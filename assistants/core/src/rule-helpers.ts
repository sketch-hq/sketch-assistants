import {
  FileFormat,
  ImageMetadata,
  RuleContext,
  RuleFunction,
  RuleUtils,
  SketchFileObject,
} from '@sketch-hq/sketch-assistant-types'
import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { isSketchFileObject } from './guards'

type ImageRef = string

export type ImageUsage = {
  object: SketchFileObject
  frame: FileFormat.Rect
  type: 'bitmap' | 'fill'
  imageMetadata: ImageMetadata
}

interface ImageProcessor {
  handleLayerImages: (object: FileFormat.AnyLayer) => void
  getResults: () => Promise<Map<ImageRef, ImageUsage[]>>
}

/**
 * Abstracts the creation of a function that gets the node images.
 * This logic to find images in a node is identically used in all the
 * `image-*` rules.
 * These rules only differ at how they validate images.
 *
 * @param getImageMetadata Function used to build the ImageMetaData object
 * @param getLayer Function used to get the layer object from a node
 */
const createImageProcessor = (
  getImageMetadata: (ref: string) => Promise<ImageMetadata>,
): ImageProcessor => {
  // Create a data structure to hold the results from scanning the document.
  // It's a map keyed by image reference, with the values being an array of
  // objects representing instances where that image has been used
  const results: Map<ImageRef, ImageUsage[]> = new Map()

  const addResult = async (
    ref: ImageRef,
    object: SketchFileObject,
    frame: FileFormat.Rect,
    type: 'bitmap' | 'fill',
  ): Promise<void> => {
    const usage: ImageUsage = {
      object,
      frame,
      type,
      imageMetadata: await getImageMetadata(ref),
    }

    if (results.has(ref)) {
      const item = results.get(ref)
      item?.push(usage)
      return
    }

    results.set(ref, [usage])
  }

  const promises: Promise<void>[] = []

  return {
    handleLayerImages(layer: FileFormat.AnyLayer) {
      const { frame } = layer
      // Handle images in bitmap layers
      if (layer._class === 'bitmap') {
        if (layer.image && layer.image._class === 'MSJSONFileReference') {
          promises.push(addResult(layer.image._ref, layer, frame, 'bitmap'))
        }
      }
      // Handle image fills in layer styles
      if (layer.sharedStyleID === 'string') return // Skip shared styles
      if (!layer.style) return // Narrow to truthy style objects
      if (!layer.style.fills) return // Narrow to truthy style fills arrays
      for (const fill of layer.style.fills) {
        if (fill.fillType !== FileFormat.FillType.Pattern) continue
        if (!fill.image) continue
        if (fill.image._class !== 'MSJSONFileReference') continue
        promises.push(addResult(fill.image._ref, layer, frame, 'fill'))
      }
    },
    async getResults() {
      // Await all promises together to benefit from parallelisation
      await Promise.all(promises)
      return results
    },
  }
}

/**
 * Abstracts the creation of a name-pattern-* rule function. All these rules have identical logic,
 * and only differ based on the Sketch layer classes they're interested in.
 *
 * @param i18n I18n instance passed in during normal rule creation
 * @param classes Array of file format `_class` values indicating the types of layers to scan
 */
const createNamePatternRuleFunction = (
  i18n: I18n,
  classes: FileFormat.ClassValue[],
): RuleFunction => {
  function assertOption(value: unknown): asserts value is string[] {
    if (!Array.isArray(value)) {
      throw new Error('Option value is not an array')
    }
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== 'string') {
        throw new Error('Option array element is not a string')
      }
    }
  }

  // This function returns a RuleFunction:
  return async (context: RuleContext) => {
    const { utils } = context

    // Gather options
    const allowed = utils.getOption('allowed')
    const forbidden = utils.getOption('forbidden')
    assertOption(allowed)
    assertOption(forbidden)
    const allowedPatterns = allowed.map((pattern) => new RegExp(pattern))
    const forbiddenPatterns = forbidden.map((pattern) => new RegExp(pattern))

    for (const klass of classes) {
      for (const object of utils.objects[klass]) {
        if (!('name' in object)) continue // Not interested in Sketch objects without a `name`
        // Name is allowed if zero patterns supplied, or name matches _at least one_ of the allowed patterns
        const isAllowed =
          allowedPatterns.length === 0 ||
          allowedPatterns.map((regex) => regex.test(object.name)).includes(true)
        // Name is forbidden if it matches _any_ of the forbidden patterns
        const isForbidden = forbiddenPatterns.map((regex) => regex.test(object.name)).includes(true)

        if (isForbidden) {
          utils.report({
            object,
            message: i18n._(t`Layer name matches one of the forbidden patterns`),
          })
          continue // Contine after reporting name as forbidden, i.e. once a name is forbidden we don't care about the allowed status
        }

        if (!isAllowed) {
          utils.report({
            object,
            message: i18n._(t`Layer name does not match any of the allowed patterns`),
          })
        }
      }
    }
  }
}

/**
 * Indicate whether a given object is a child layer of a ShapeGroup (aka combined shape).
 */
const isCombinedShapeChildLayer = (object: SketchFileObject, utils: RuleUtils): boolean => {
  const parents = utils.getObjectParents(object)
  const grandParent = parents[parents.length - 2]
  return isSketchFileObject(grandParent) && grandParent._class === FileFormat.ClassValue.ShapeGroup
}

/**
 * Determine if an object has a parent with a particular class.
 */
const isChildOfClass = (
  object: SketchFileObject,
  classValue: FileFormat.ClassValue,
  utils: RuleUtils,
): boolean =>
  [
    ...utils
      .getObjectParents(object)
      .filter(isSketchFileObject)
      .map((parent) => parent._class),
    object._class,
  ].includes(classValue)

export {
  createNamePatternRuleFunction,
  createImageProcessor,
  isCombinedShapeChildLayer,
  isChildOfClass,
}

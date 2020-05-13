import {
  FileFormat,
  ImageMetadata,
  Maybe,
  Node,
  NodeCacheVisitor,
  RuleContext,
  RuleFunction,
  RuleOption,
  SketchClass,
  RuleUtils,
} from '@sketch-hq/sketch-assistant-types'
import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'

type ImageRef = string

export type ImageUsage = {
  node: Node
  frame: FileFormat.Rect
  type: 'bitmap' | 'fill'
  imageMetadata: ImageMetadata
}

interface ImageProcessor {
  handleLayerImages: (node: Node) => void
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
  getLayer: (n: Node) => FileFormat.AnyLayer,
): ImageProcessor => {
  // Create a data structure to hold the results from scanning the document.
  // It's a map keyed by image reference, with the values being an array of
  // objects representing instances where that image has been used
  const results: Map<ImageRef, ImageUsage[]> = new Map()

  const addResult = async (
    ref: ImageRef,
    node: Node,
    frame: FileFormat.Rect,
    type: 'bitmap' | 'fill',
  ): Promise<void> => {
    const usage: ImageUsage = {
      node,
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
    handleLayerImages(node) {
      const layer = getLayer(node)
      const { frame } = layer
      // Handle images in bitmap layers
      if (layer._class === 'bitmap') {
        if (layer.image && layer.image._class === 'MSJSONFileReference') {
          promises.push(addResult(layer.image._ref, node, frame, 'bitmap'))
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
        promises.push(addResult(fill.image._ref, node, frame, 'fill'))
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
const createNamePatternRuleFunction = (i18n: I18n, classes: SketchClass[]): RuleFunction => {
  function assertOption(value: Maybe<RuleOption>): asserts value is string[] {
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

    // Define a generic vistor function
    const visitor: NodeCacheVisitor = async (node: Node): Promise<void> => {
      if (!('name' in node)) return // Not interested in Sketch objects without a `name`

      // Name is allowed if zero patterns supplied, or name matches _at least one_ of the allowed patterns
      const isAllowed =
        allowedPatterns.length === 0 ||
        allowedPatterns.map((regex) => regex.test(node.name)).includes(true)

      // Name is forbidden if it matches _any_ of the forbidden patterns
      const isForbidden = forbiddenPatterns.map((regex) => regex.test(node.name)).includes(true)

      if (isForbidden) {
        utils.report({
          node,
          message: i18n._(t`Layer name matches one of the forbidden patterns`),
        })
        return // Return after reporting a name as forbidden, i.e. once a name is forbidden we don't care about the allowed status
      }

      if (!isAllowed) {
        utils.report({
          node,
          message: i18n._(t`Layer name does not match any of the allowed patterns`),
        })
      }
    }

    await utils.iterateCache(classes.reduce((acc, _class) => ({ ...acc, [_class]: visitor }), {}))
  }
}

/**
 * Indicate whether a given Node is a child layer of a ShapeGroup (aka combined shape).
 */
const isCombinedShapeChildLayer = (node: Node, utils: RuleUtils): boolean => {
  const parent = utils.parent(node.$pointer)
  if (!parent || typeof parent !== 'object') return false
  const grandParent = utils.parent(parent.$pointer)
  if (!grandParent || typeof grandParent !== 'object' || !('_class' in grandParent)) return false
  return grandParent._class === 'shapeGroup'
}

export { createNamePatternRuleFunction, createImageProcessor, isCombinedShapeChildLayer }

import {
  PointerMap,
  RunOperation,
  ObjectCache,
  JsonPointer,
  FileFormat,
  ProcessedSketchFile,
  SketchFile,
} from '@sketch-hq/sketch-assistant-types'

const FOREIGN_OBJECT_CONTEXTS = [
  'foreignLayerStyles',
  'foreignSymbols',
  'foreignTextStyles',
  'foreignSwatches',
]

/**
 * Create an empty ObjectCache object.
 */
export const createEmptyObjectCache = (): ObjectCache => ({
  ...Object.values(FileFormat.ClassValue).reduce<ObjectCache>((acc, curr) => {
    return {
      [curr]: [],
      ...acc,
    }
  }, {} as ObjectCache),
  ...{ anyGroup: [], anyLayer: [], document: [] },
})

/**
 * Add a file format object to an ObjectCache instance.
 */
export const addObjectToCache = (
  object: FileFormat.AnyObject | FileFormat.Contents['document'],
  cache: ObjectCache,
) => {
  // Use heuristics to determine whether an object is "groupy" or "layery"
  // and add to the appropriate cache key if so
  if ('layers' in object) cache.anyGroup.push(object)
  if ('frame' in object) cache.anyLayer.push(object)
  // For each class value available in the file format add the object to cache.
  // This approach is long-winded but gives near 100% type safety
  switch (object._class) {
    case FileFormat.ClassValue.MSImmutableColorAsset:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableFlowConnection:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableForeignLayerStyle:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableForeignSwatch:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableForeignSymbol:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableForeignTextStyle:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableFreeformGroupLayout:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableGradientAsset:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableHotspotLayer:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableInferredGroupLayout:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSImmutableOverrideProperty:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSJSONFileReference:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.MSJSONOriginalDataReference:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Artboard:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.AssetCollection:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.AttributedString:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Bitmap:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Blur:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Border:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.BorderOptions:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Color:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ColorControls:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.CurvePoint:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ExportFormat:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ExportOptions:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Fill:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.FontDescriptor:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.FontReference:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Gradient:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.GradientStop:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.GraphicsContextSettings:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Group:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ImageCollection:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.InnerShadow:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.LayoutGrid:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Oval:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.OverrideValue:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Page:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ParagraphStyle:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Polygon:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Rect:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Rectangle:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.RulerData:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Shadow:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ShapeGroup:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.ShapePath:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SharedStyle:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SharedStyleContainer:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SharedTextStyleContainer:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SimpleGrid:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Slice:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Star:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.StringAttribute:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Style:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Swatch:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SwatchContainer:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SymbolContainer:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SymbolInstance:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.SymbolMaster:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Text:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.TextStyle:
      cache[object._class].push(object)
      break
    case FileFormat.ClassValue.Triangle:
      cache[object._class].push(object)
      break
    case 'document':
      cache[object._class].push(object)
      break
  }
}

/**
 * Recursively traverse a Sketch file, while populating various caches and maps.
 */
export const traverse = ({
  target,
  op,
  pointers,
  objects,
  foreignObjects,
  pointer = '',
  foreignContext = false,
}: {
  target?: Record<string, {}>
  op: RunOperation
  pointers: PointerMap
  objects: ObjectCache
  foreignObjects: ObjectCache
  pointer?: JsonPointer
  foreignContext?: boolean
}) => {
  // Bail early if we've been passed a falsey value or the operation is cancelled
  if (!target || op.cancelled) return
  // Bail early if input is not an object
  if (typeof target !== 'object') return
  // If target is an array then traverse into each of its elements
  if (Array.isArray(target)) {
    for (let index = 0; index < target.length; index++) {
      traverse({
        target: target[index],
        op,
        pointers,
        objects,
        foreignObjects,
        pointer: `${pointer}/${index}`,
        foreignContext,
      })
    }
    return
  }
  // If this is a Sketch file object with a `_class` then add it to the pointer maps
  // and cache it
  if ('_class' in target!) {
    pointers.set(target as FileFormat.AnyObject, pointer)
    addObjectToCache(target as FileFormat.AnyObject, foreignContext ? foreignObjects : objects)
  }
  // Loop over its properties
  for (const key in target!) {
    traverse({
      target: target[key],
      op,
      pointers,
      objects,
      foreignObjects,
      pointer: `${pointer}/${key}`,
      foreignContext: foreignContext || FOREIGN_OBJECT_CONTEXTS.includes(key),
    })
  }
}

/**
 * Generate a ProcessedSketchFile object from a SketchFile object.
 */
const process = (file: SketchFile, op: RunOperation): Promise<ProcessedSketchFile> => {
  return new Promise((resolve, reject) => {
    try {
      const objects = createEmptyObjectCache()
      const foreignObjects = createEmptyObjectCache()
      const pointers = new WeakMap()
      traverse({
        target: file.contents as Record<string, {}>,
        op,
        pointers,
        objects,
        foreignObjects,
      })
      resolve({ file, objects, foreignObjects, pointers })
    } catch (error) {
      reject(error)
    }
  })
}

export { process }

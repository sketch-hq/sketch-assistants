import mem from 'mem'
import {
  FileFormat,
  Violation,
  ReportItem,
  RuleUtils,
  RunOperation,
  ImageMetadata,
  RuleUtilsCreator,
  GetImageMetadata,
  AssistantDefinition,
  RuleDefinition,
  ProcessedSketchFile,
  PointerMap,
  GeneratorIterable,
  ObjectCache,
  IterableObjectCache,
  DocumentObject,
} from '@sketch-hq/sketch-assistant-types'

import { getRuleOption, isRuleConfigValid, getRuleSeverity } from '../assistant-config'
import { objectHash, objectsEqual } from '../object-utils'
import { getRuleDefinition } from '../assistant'
import { getParentPointer, evalPointer } from '../pointer-utils'

/**
 * Object hash comparison function that ignores 'do_objectID' attribute
 */
const stableObjectHash = (obj: {}, excludeKeys: string[] = []): string => {
  return objectHash(obj, [...excludeKeys, 'do_objectID'])
}

/**
 * Object comparison function that ignores 'do_objectID' attribute
 */
const stableObjectsEqual = (obj1: {}, obj2: {}, excludeKeys: string[] = []): boolean => {
  return objectsEqual(obj1, obj2, [...excludeKeys, 'do_objectID'])
}

/**
 * Helper function that creates a string hash from a set of attributes of a style
 * object.
 */
const styleHash = (style: Partial<FileFormat.Style> | undefined): string =>
  stableObjectHash({
    borders: style?.borders,
    borderOptions: style?.borderOptions,
    blur: style?.blur,
    fills: style?.fills,
    shadows: style?.shadows,
    innerShadows: style?.innerShadows,
  })

/**
 * Returns a boolean from the equality comparison between two style objects. Useful when
 * comparing two layer styles.
 */
const styleEq = (s1: FileFormat.Style | undefined, s2: FileFormat.Style | undefined): boolean =>
  styleHash(s1) === styleHash(s2)

/**
 * Helper function that creates a string hash from a set of attributes of a text style
 * object.
 */
const textStyleHash = (style: Partial<FileFormat.Style> | undefined): string =>
  stableObjectHash({
    borders: style?.borders,
    borderOptions: style?.borderOptions,
    blur: style?.blur,
    fills: style?.fills,
    shadows: style?.shadows,
    innerShadows: style?.innerShadows,
    textStyle: style && style.textStyle ? stableObjectHash(style?.textStyle) : null,
  })

/**
 * Returns a boolean from the equality comparison between two text style objects. Useful when
 * comparing two text layer styles.
 */
const textStyleEq = (s1: FileFormat.Style | undefined, s2: FileFormat.Style | undefined): boolean =>
  textStyleHash(s1) === textStyleHash(s2)

class RuleNotFoundError extends Error {
  public assistant: AssistantDefinition
  public ruleName: string

  public constructor(assistant: AssistantDefinition, ruleName: string) {
    super(`Rule "${ruleName}" not found on assistant "${assistant.name}"`)
    this.assistant = assistant
    this.ruleName = ruleName
    this.name = 'RuleNotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

class InvalidRuleConfigError extends Error {
  public assistant: AssistantDefinition
  public rule: RuleDefinition
  public details: string

  public constructor(assistant: AssistantDefinition, rule: RuleDefinition, details: string) {
    super(
      `Invalid configuration found for rule "${rule.name}" on assistant "${assistant.name}": ${details}`,
    )
    this.assistant = assistant
    this.rule = rule
    this.details = details
    this.name = 'InvalidRuleConfigError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Add one or more report items into a violations array. Reports from rules just contain a message
 * and optionally a Node, whereas violations container richer contextual information therefore this
 * function maps the former to the latter.
 */
const addReportsToViolations = (
  report: ReportItem | ReportItem[],
  violations: Violation[],
  assistant: AssistantDefinition,
  rule: RuleDefinition,
  pointers: PointerMap,
): void => {
  if (Array.isArray(report) && report.length === 0) return
  const { config } = assistant
  const { name: ruleName } = rule
  const severity = getRuleSeverity(config, ruleName)
  violations.push(
    ...(Array.isArray(report) ? report : [report]).map(
      (item): Violation => {
        return {
          assistantName: assistant.name,
          ruleName: rule.name,
          message: item.message,
          severity,
          pointer: item.object ? pointers.get(item.object) || null : null,
          objectId: item.object
            ? 'do_objectID' in item.object
              ? item.object.do_objectID || null
              : null
            : null,
          objectName: item.object
            ? 'name' in item.object
              ? item.object.name || null
              : null
            : null,
        }
      },
    ),
  )
}

/**
 * Creates a function that rules can use to get an option value by `name`. An InvalidRuleConfigError
 * is thrown if rules attempt to access missing options, or options that are invalid according to
 * the rule's self-declared option schema.
 */
const createOptionGetter = (assistant: AssistantDefinition, rule: RuleDefinition) => <T>(
  optionKey: string,
): T => {
  const result = isRuleConfigValid(assistant.config, rule)
  if (result !== true) {
    const details = result
      .map((error) => {
        if (error.dataPath === '') {
          return error.message
        } else {
          return `"${error.dataPath}" ${error.message}`
        }
      })
      .join('. ')
    throw new InvalidRuleConfigError(assistant, rule, details)
  }
  const value = getRuleOption(assistant.config, rule.name, optionKey)
  if (value === null) {
    throw new InvalidRuleConfigError(
      assistant,
      rule,
      `Option "${optionKey}" not found in assistant configuration`,
    )
  }
  return (value as unknown) as T
}

/**
 * Returns a generator based iterable that can be cancelled by a RunOperation.
 */
export const createIterable = <SketchFileObject>(
  src: SketchFileObject[],
  op: RunOperation,
): GeneratorIterable<SketchFileObject> => {
  return {
    [Symbol.iterator]: function* () {
      for (const element of src) {
        if (op.cancelled) return
        yield element
      }
    },
  }
}

// Alias some concise versions of these since they are used repeatedly just below
type CM = FileFormat.ClassMap
import CV = FileFormat.ClassValue
const cI = createIterable

/**
 * Returns an IterableObjectCache for any given ObjectCache. We want 100% type safety here so
 * when iterating objects we get the real object type back, and don't have to add any guards
 * or checks to rule logic. If there's a more concise way to do this and retain the correct
 * types I'm all ears.
 */
export const createIterableObjectCache = (o: ObjectCache, r: RunOperation): IterableObjectCache => {
  return {
    [CV.MSImmutableColorAsset]: cI<CM[CV.MSImmutableColorAsset]>(o[CV.MSImmutableColorAsset], r),
    [CV.MSImmutableFlowConnection]: cI<CM[CV.MSImmutableFlowConnection]>(
      o[CV.MSImmutableFlowConnection],
      r,
    ),
    [CV.MSImmutableForeignLayerStyle]: cI<CM[CV.MSImmutableForeignLayerStyle]>(
      o[CV.MSImmutableForeignLayerStyle],
      r,
    ),
    [CV.MSImmutableForeignSwatch]: cI<CM[CV.MSImmutableForeignSwatch]>(
      o[CV.MSImmutableForeignSwatch],
      r,
    ),
    [CV.MSImmutableForeignSymbol]: cI<CM[CV.MSImmutableForeignSymbol]>(
      o[CV.MSImmutableForeignSymbol],
      r,
    ),
    [CV.MSImmutableForeignTextStyle]: cI<CM[CV.MSImmutableForeignTextStyle]>(
      o[CV.MSImmutableForeignTextStyle],
      r,
    ),
    [CV.MSImmutableFreeformGroupLayout]: cI<CM[CV.MSImmutableFreeformGroupLayout]>(
      o[CV.MSImmutableFreeformGroupLayout],
      r,
    ),
    [CV.MSImmutableGradientAsset]: cI<CM[CV.MSImmutableGradientAsset]>(
      o[CV.MSImmutableGradientAsset],
      r,
    ),
    [CV.MSImmutableHotspotLayer]: cI<CM[CV.MSImmutableHotspotLayer]>(
      o[CV.MSImmutableHotspotLayer],
      r,
    ),
    [CV.MSImmutableInferredGroupLayout]: cI<CM[CV.MSImmutableInferredGroupLayout]>(
      o[CV.MSImmutableInferredGroupLayout],
      r,
    ),
    [CV.MSImmutableOverrideProperty]: cI<CM[CV.MSImmutableOverrideProperty]>(
      o[CV.MSImmutableOverrideProperty],
      r,
    ),
    [CV.MSJSONFileReference]: cI<CM[CV.MSJSONFileReference]>(o[CV.MSJSONFileReference], r),
    [CV.MSJSONOriginalDataReference]: cI<CM[CV.MSJSONOriginalDataReference]>(
      o[CV.MSJSONOriginalDataReference],
      r,
    ),
    [CV.Artboard]: cI<CM[CV.Artboard]>(o[CV.Artboard], r),
    [CV.AssetCollection]: cI<CM[CV.AssetCollection]>(o[CV.AssetCollection], r),
    [CV.AttributedString]: cI<CM[CV.AttributedString]>(o[CV.AttributedString], r),
    [CV.Bitmap]: cI<CM[CV.Bitmap]>(o[CV.Bitmap], r),
    [CV.Blur]: cI<CM[CV.Blur]>(o[CV.Blur], r),
    [CV.Border]: cI<CM[CV.Border]>(o[CV.Border], r),
    [CV.BorderOptions]: cI<CM[CV.BorderOptions]>(o[CV.BorderOptions], r),
    [CV.Color]: cI<CM[CV.Color]>(o[CV.Color], r),
    [CV.ColorControls]: cI<CM[CV.ColorControls]>(o[CV.ColorControls], r),
    [CV.CurvePoint]: cI<CM[CV.CurvePoint]>(o[CV.CurvePoint], r),
    [CV.ExportFormat]: cI<CM[CV.ExportFormat]>(o[CV.ExportFormat], r),
    [CV.ExportOptions]: cI<CM[CV.ExportOptions]>(o[CV.ExportOptions], r),
    [CV.Fill]: cI<CM[CV.Fill]>(o[CV.Fill], r),
    [CV.FontDescriptor]: cI<CM[CV.FontDescriptor]>(o[CV.FontDescriptor], r),
    [CV.FontReference]: cI<CM[CV.FontReference]>(o[CV.FontReference], r),
    [CV.Gradient]: cI<CM[CV.Gradient]>(o[CV.Gradient], r),
    [CV.GradientStop]: cI<CM[CV.GradientStop]>(o[CV.GradientStop], r),
    [CV.GraphicsContextSettings]: cI<CM[CV.GraphicsContextSettings]>(
      o[CV.GraphicsContextSettings],
      r,
    ),
    [CV.Group]: cI<CM[CV.Group]>(o[CV.Group], r),
    [CV.ImageCollection]: cI<CM[CV.ImageCollection]>(o[CV.ImageCollection], r),
    [CV.InnerShadow]: cI<CM[CV.InnerShadow]>(o[CV.InnerShadow], r),
    [CV.LayoutGrid]: cI<CM[CV.LayoutGrid]>(o[CV.LayoutGrid], r),
    [CV.Oval]: cI<CM[CV.Oval]>(o[CV.Oval], r),
    [CV.OverrideValue]: cI<CM[CV.OverrideValue]>(o[CV.OverrideValue], r),
    [CV.Page]: cI<CM[CV.Page]>(o[CV.Page], r),
    [CV.ParagraphStyle]: cI<CM[CV.ParagraphStyle]>(o[CV.ParagraphStyle], r),
    [CV.Polygon]: cI<CM[CV.Polygon]>(o[CV.Polygon], r),
    [CV.Rect]: cI<CM[CV.Rect]>(o[CV.Rect], r),
    [CV.Rectangle]: cI<CM[CV.Rectangle]>(o[CV.Rectangle], r),
    [CV.RulerData]: cI<CM[CV.RulerData]>(o[CV.RulerData], r),
    [CV.Shadow]: cI<CM[CV.Shadow]>(o[CV.Shadow], r),
    [CV.ShapeGroup]: cI<CM[CV.ShapeGroup]>(o[CV.ShapeGroup], r),
    [CV.ShapePath]: cI<CM[CV.ShapePath]>(o[CV.ShapePath], r),
    [CV.SharedStyle]: cI<CM[CV.SharedStyle]>(o[CV.SharedStyle], r),
    [CV.SharedStyleContainer]: cI<CM[CV.SharedStyleContainer]>(o[CV.SharedStyleContainer], r),
    [CV.SharedTextStyleContainer]: cI<CM[CV.SharedTextStyleContainer]>(
      o[CV.SharedTextStyleContainer],
      r,
    ),
    [CV.SimpleGrid]: cI<CM[CV.SimpleGrid]>(o[CV.SimpleGrid], r),
    [CV.Slice]: cI<CM[CV.Slice]>(o[CV.Slice], r),
    [CV.Star]: cI<CM[CV.Star]>(o[CV.Star], r),
    [CV.StringAttribute]: cI<CM[CV.StringAttribute]>(o[CV.StringAttribute], r),
    [CV.Style]: cI<CM[CV.Style]>(o[CV.Style], r),
    [CV.Swatch]: cI<CM[CV.Swatch]>(o[CV.Swatch], r),
    [CV.SwatchContainer]: cI<CM[CV.SwatchContainer]>(o[CV.SwatchContainer], r),
    [CV.SymbolContainer]: cI<CM[CV.SymbolContainer]>(o[CV.SymbolContainer], r),
    [CV.SymbolInstance]: cI<CM[CV.SymbolInstance]>(o[CV.SymbolInstance], r),
    [CV.SymbolMaster]: cI<CM[CV.SymbolMaster]>(o[CV.SymbolMaster], r),
    [CV.Text]: cI<CM[CV.Text]>(o[CV.Text], r),
    [CV.TextStyle]: cI<CM[CV.TextStyle]>(o[CV.TextStyle], r),
    [CV.Triangle]: cI<CM[CV.Triangle]>(o[CV.Triangle], r),
    document: cI<DocumentObject>(o['document'], r),
    anyGroup: cI<FileFormat.AnyGroup>(o['anyGroup'], r),
    anyLayer: cI<FileFormat.AnyLayer>(o['anyLayer'], r),
  }
}

/**
 * Returns a RuleUtilsCreator function, which can be used to build util objects
 * scoped to a specific rule.
 */
const createRuleUtilsCreator = (
  processedFile: ProcessedSketchFile,
  violations: Violation[],
  assistant: AssistantDefinition,
  operation: RunOperation,
  getImageMetadata: GetImageMetadata,
): RuleUtilsCreator => {
  const { file, pointers, objects, foreignObjects } = processedFile
  const memoizedGetImageMetaData = mem(getImageMetadata)

  const utilsCreator: RuleUtilsCreator = (ruleName: string): RuleUtils => {
    const rule = getRuleDefinition(assistant, ruleName)

    if (!rule) throw new RuleNotFoundError(assistant, ruleName)

    const getOption = createOptionGetter(assistant, rule)
    const utils: RuleUtils = {
      objects: createIterableObjectCache(objects, operation),
      foreignObjects: createIterableObjectCache(foreignObjects, operation),
      getObjectParents: (object) => {
        let pointer = pointers.get(object)
        if (typeof pointer !== 'string') return []
        const parents: string[] = []
        while (pointer) {
          pointer = getParentPointer(pointer)
          if (typeof pointer === 'string') parents.push(pointer)
        }
        return parents.map((ptr) => evalPointer(ptr, file.contents)).reverse()
      },
      getObjectPointer: (object) => pointers.get(object),
      evalPointer: (pointer) => evalPointer(pointer, file.contents),
      getObjectParent: (object) => {
        const pointer = pointers.get(object)
        if (typeof pointer !== 'string') return
        const parentPointer = getParentPointer(pointer)
        return typeof parentPointer === 'string'
          ? evalPointer(parentPointer, file.contents)
          : undefined
      },
      report(items: ReportItem | ReportItem[]): void {
        addReportsToViolations(items, violations, assistant, rule, pointers)
      },
      getImageMetadata: (ref: string): Promise<ImageMetadata> => {
        return memoizedGetImageMetaData(ref, file.filepath || '')
      },
      getOption,
      objectHash: stableObjectHash,
      objectsEqual: stableObjectsEqual,
      styleEq,
      textStyleEq,
      styleHash,
      textStyleHash,
    }
    return utils
  }

  return utilsCreator
}

export { styleHash, styleEq, textStyleHash, textStyleEq, createRuleUtilsCreator }

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
  IgnoreConfig,
  SketchFileObject,
} from '@sketch-hq/sketch-assistant-types'

import { getRuleOption, isRuleConfigValid, getRuleSeverity } from '../assistant-config'
import { objectHash, objectsEqual } from '../object-utils'
import { getRuleDefinition } from '../assistant'
import { getParentPointer, evalPointer } from '../pointer-utils'
import { getIgnoredObjectIdsForRule } from '../run/ignore'

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
  ignoredObjects: string[],
): void => {
  if (Array.isArray(report) && report.length === 0) return
  const { config } = assistant
  const { name: ruleName } = rule
  const severity = getRuleSeverity(config, ruleName)
  violations.push(
    ...(Array.isArray(report) ? report : [report]).map(
      (item): Violation => {
        if (
          item.object &&
          'do_objectID' in item.object &&
          ignoredObjects.includes(item.object.do_objectID!)
        ) {
          throw Error('Attempted to report an ignored object in a violation')
        }
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
export const createIterable = <T>(
  src: T[],
  op: RunOperation,
  ignoredIds: string[],
): GeneratorIterable<T> => {
  return {
    [Symbol.iterator]: function* () {
      for (const element of src) {
        if (op.cancelled) return
        // @ts-ignore Ignore TS error here since this is a hot path, and we don't want to
        // add defensive runtime type checking
        if (ignoredIds.includes(element.do_objectID)) continue
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
export const createIterableObjectCache = (
  o: ObjectCache,
  r: RunOperation,
  i: string[],
): IterableObjectCache => {
  return {
    [CV.MSImmutableColorAsset]: cI<CM[CV.MSImmutableColorAsset]>(o[CV.MSImmutableColorAsset], r, i),
    [CV.MSImmutableFlowConnection]: cI<CM[CV.MSImmutableFlowConnection]>(
      o[CV.MSImmutableFlowConnection],
      r,
      i,
    ),
    [CV.MSImmutableForeignLayerStyle]: cI<CM[CV.MSImmutableForeignLayerStyle]>(
      o[CV.MSImmutableForeignLayerStyle],
      r,
      i,
    ),
    [CV.MSImmutableForeignSwatch]: cI<CM[CV.MSImmutableForeignSwatch]>(
      o[CV.MSImmutableForeignSwatch],
      r,
      i,
    ),
    [CV.MSImmutableForeignSymbol]: cI<CM[CV.MSImmutableForeignSymbol]>(
      o[CV.MSImmutableForeignSymbol],
      r,
      i,
    ),
    [CV.MSImmutableForeignTextStyle]: cI<CM[CV.MSImmutableForeignTextStyle]>(
      o[CV.MSImmutableForeignTextStyle],
      r,
      i,
    ),
    [CV.MSImmutableFreeformGroupLayout]: cI<CM[CV.MSImmutableFreeformGroupLayout]>(
      o[CV.MSImmutableFreeformGroupLayout],
      r,
      i,
    ),
    [CV.MSImmutableGradientAsset]: cI<CM[CV.MSImmutableGradientAsset]>(
      o[CV.MSImmutableGradientAsset],
      r,
      i,
    ),
    [CV.MSImmutableHotspotLayer]: cI<CM[CV.MSImmutableHotspotLayer]>(
      o[CV.MSImmutableHotspotLayer],
      r,
      i,
    ),
    [CV.MSImmutableInferredGroupLayout]: cI<CM[CV.MSImmutableInferredGroupLayout]>(
      o[CV.MSImmutableInferredGroupLayout],
      r,
      i,
    ),
    [CV.MSImmutableOverrideProperty]: cI<CM[CV.MSImmutableOverrideProperty]>(
      o[CV.MSImmutableOverrideProperty],
      r,
      i,
    ),
    [CV.MSJSONFileReference]: cI<CM[CV.MSJSONFileReference]>(o[CV.MSJSONFileReference], r, i),
    [CV.MSJSONOriginalDataReference]: cI<CM[CV.MSJSONOriginalDataReference]>(
      o[CV.MSJSONOriginalDataReference],
      r,
      i,
    ),
    [CV.Artboard]: cI<CM[CV.Artboard]>(o[CV.Artboard], r, i),
    [CV.AssetCollection]: cI<CM[CV.AssetCollection]>(o[CV.AssetCollection], r, i),
    [CV.AttributedString]: cI<CM[CV.AttributedString]>(o[CV.AttributedString], r, i),
    [CV.Bitmap]: cI<CM[CV.Bitmap]>(o[CV.Bitmap], r, i),
    [CV.Blur]: cI<CM[CV.Blur]>(o[CV.Blur], r, i),
    [CV.Border]: cI<CM[CV.Border]>(o[CV.Border], r, i),
    [CV.BorderOptions]: cI<CM[CV.BorderOptions]>(o[CV.BorderOptions], r, i),
    [CV.Color]: cI<CM[CV.Color]>(o[CV.Color], r, i),
    [CV.ColorControls]: cI<CM[CV.ColorControls]>(o[CV.ColorControls], r, i),
    [CV.CurvePoint]: cI<CM[CV.CurvePoint]>(o[CV.CurvePoint], r, i),
    [CV.ExportFormat]: cI<CM[CV.ExportFormat]>(o[CV.ExportFormat], r, i),
    [CV.ExportOptions]: cI<CM[CV.ExportOptions]>(o[CV.ExportOptions], r, i),
    [CV.Fill]: cI<CM[CV.Fill]>(o[CV.Fill], r, i),
    [CV.FontDescriptor]: cI<CM[CV.FontDescriptor]>(o[CV.FontDescriptor], r, i),
    [CV.FontReference]: cI<CM[CV.FontReference]>(o[CV.FontReference], r, i),
    [CV.Gradient]: cI<CM[CV.Gradient]>(o[CV.Gradient], r, i),
    [CV.GradientStop]: cI<CM[CV.GradientStop]>(o[CV.GradientStop], r, i),
    [CV.GraphicsContextSettings]: cI<CM[CV.GraphicsContextSettings]>(
      o[CV.GraphicsContextSettings],
      r,
      i,
    ),
    [CV.Group]: cI<CM[CV.Group]>(o[CV.Group], r, i),
    [CV.ImageCollection]: cI<CM[CV.ImageCollection]>(o[CV.ImageCollection], r, i),
    [CV.InnerShadow]: cI<CM[CV.InnerShadow]>(o[CV.InnerShadow], r, i),
    [CV.LayoutGrid]: cI<CM[CV.LayoutGrid]>(o[CV.LayoutGrid], r, i),
    [CV.Oval]: cI<CM[CV.Oval]>(o[CV.Oval], r, i),
    [CV.OverrideValue]: cI<CM[CV.OverrideValue]>(o[CV.OverrideValue], r, i),
    [CV.Page]: cI<CM[CV.Page]>(o[CV.Page], r, i),
    [CV.ParagraphStyle]: cI<CM[CV.ParagraphStyle]>(o[CV.ParagraphStyle], r, i),
    [CV.Polygon]: cI<CM[CV.Polygon]>(o[CV.Polygon], r, i),
    [CV.Rect]: cI<CM[CV.Rect]>(o[CV.Rect], r, i),
    [CV.Rectangle]: cI<CM[CV.Rectangle]>(o[CV.Rectangle], r, i),
    [CV.RulerData]: cI<CM[CV.RulerData]>(o[CV.RulerData], r, i),
    [CV.Shadow]: cI<CM[CV.Shadow]>(o[CV.Shadow], r, i),
    [CV.ShapeGroup]: cI<CM[CV.ShapeGroup]>(o[CV.ShapeGroup], r, i),
    [CV.ShapePath]: cI<CM[CV.ShapePath]>(o[CV.ShapePath], r, i),
    [CV.SharedStyle]: cI<CM[CV.SharedStyle]>(o[CV.SharedStyle], r, i),
    [CV.SharedStyleContainer]: cI<CM[CV.SharedStyleContainer]>(o[CV.SharedStyleContainer], r, i),
    [CV.SharedTextStyleContainer]: cI<CM[CV.SharedTextStyleContainer]>(
      o[CV.SharedTextStyleContainer],
      r,
      i,
    ),
    [CV.SimpleGrid]: cI<CM[CV.SimpleGrid]>(o[CV.SimpleGrid], r, i),
    [CV.Slice]: cI<CM[CV.Slice]>(o[CV.Slice], r, i),
    [CV.Star]: cI<CM[CV.Star]>(o[CV.Star], r, i),
    [CV.StringAttribute]: cI<CM[CV.StringAttribute]>(o[CV.StringAttribute], r, i),
    [CV.Style]: cI<CM[CV.Style]>(o[CV.Style], r, i),
    [CV.Swatch]: cI<CM[CV.Swatch]>(o[CV.Swatch], r, i),
    [CV.SwatchContainer]: cI<CM[CV.SwatchContainer]>(o[CV.SwatchContainer], r, i),
    [CV.SymbolContainer]: cI<CM[CV.SymbolContainer]>(o[CV.SymbolContainer], r, i),
    [CV.SymbolInstance]: cI<CM[CV.SymbolInstance]>(o[CV.SymbolInstance], r, i),
    [CV.SymbolMaster]: cI<CM[CV.SymbolMaster]>(o[CV.SymbolMaster], r, i),
    [CV.Text]: cI<CM[CV.Text]>(o[CV.Text], r, i),
    [CV.TextStyle]: cI<CM[CV.TextStyle]>(o[CV.TextStyle], r, i),
    [CV.Triangle]: cI<CM[CV.Triangle]>(o[CV.Triangle], r, i),
    document: cI<DocumentObject>(o['document'], r, i),
    anyGroup: cI<FileFormat.AnyGroup>(o['anyGroup'], r, i),
    anyLayer: cI<FileFormat.AnyLayer>(o['anyLayer'], r, i),
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
  ignoreConfig: IgnoreConfig,
): RuleUtilsCreator => {
  const { file, pointers, objects, foreignObjects } = processedFile
  const memoizedGetImageMetaData = mem(getImageMetadata)

  const utilsCreator: RuleUtilsCreator = (ruleName: string): RuleUtils => {
    const rule = getRuleDefinition(assistant, ruleName)

    if (!rule) throw new RuleNotFoundError(assistant, ruleName)

    const ignoredObjects = getIgnoredObjectIdsForRule(ignoreConfig, assistant.name, ruleName)
    const getOption = createOptionGetter(assistant, rule)
    const utils: RuleUtils = {
      isObjectIgnoredForRule: (object: SketchFileObject) =>
        'do_objectID' in object ? ignoredObjects.includes(object.do_objectID!) : false,
      objects: createIterableObjectCache(objects, operation, ignoredObjects),
      foreignObjects: createIterableObjectCache(foreignObjects, operation, ignoredObjects),
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
        addReportsToViolations(items, violations, assistant, rule, pointers, ignoredObjects)
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

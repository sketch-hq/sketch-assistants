import { FileFormat3 } from '@sketch-hq/sketch-file-format-ts'
import { JSONSchema7 } from 'json-schema'
import { CoreProperties as PackageJson } from '@schemastore/package'

//
// Misc
//

/**
 * Re-export the specific version of the file format supported by this package.
 */
export { FileFormat3 as FileFormat }

/**
 * Optional value.
 */
export type Maybe<T> = T | undefined | null

/**
 * Utility function for gathering metadata about Sketch file images. Is isomorphic in the sense that
 * its signature shouldn’t change across platforms.
 */
export type GetImageMetadata = (ref: string, filepath: string) => Promise<ImageMetadata>

/**
 * When rules request metadata for a Sketch file image it is returned in this format.
 */
export type ImageMetadata = {
  width: number
  height: number
  ref: string
}

/**
 * Value or arbitrarily nested array of values.
 */
export type ValueOrArray<T> = T | Array<ValueOrArray<T>>

/**
 * The shape of an ES Module with a default export built with TypeScript or Babel with ES Module
 * interoperability.
 */
export type ESModuleInterop<T> = {
  __esModule: boolean
  default: T
}

/**
 * Module export that is either a CommonJS export or an ES Module interop export.
 */
export type MaybeESModule<T> = T | ESModuleInterop<T>

/**
 * Unwrap an array type up one level, e.g. extract Foo from Foo[].
 */
export type Unarray<T> = T extends Array<infer U> ? U : T

/**
 * Iterable object that uses a generator function.
 */
export type GeneratorIterable<T> = {
  [Symbol.iterator]: () => Generator<T>
}

//
// Sketch file processing
//

/**
 * A simple primitive type alias to represent a JSON Pointer string.
 */
export type JsonPointer = string

/**
 * Represents a Sketch file that is on disk. Collates the filepath with an object typed as Contents
 * from the file format.
 */
export type SketchFile = {
  filepath: string
  contents: FileFormat3.Contents
}

/**
 * The root document object with `_class` `document` in a parsed Sketch file.
 */
export type DocumentObject = FileFormat3.Contents['document']

/**
 * Union of all possible objects in a parsed Sketch file that have a `_class` property, including
 * the root document object.
 */
export type SketchFileObject = FileFormat3.AnyObject | DocumentObject

/**
 * Look-up a pointer value using a Sketch file object reference.
 */
export type PointerMap = Map<SketchFileObject, JsonPointer>

/**
 * A record of all object ids found in the file.
 */
export type ObjectIdSet = Set<string>

/**
 * A cache of Sketch file objects. Each key is a `_class` value from the file
 * format, and the corresponding value is an array of file objects with matching
 * `_class` values.
 */
export type ObjectCache = {
  [key in keyof FileFormat3.ClassMap]: FileFormat3.ClassMap[key][]
} & {
  anyGroup: FileFormat3.AnyGroup[]
  anyLayer: FileFormat3.AnyLayer[]
  document: DocumentObject[]
}

/**
 * Same as ObjectCache, except the cache values are an iterable that yields
 * the file objects, rather than a simple array.
 */
export type IterableObjectCache = {
  [key in keyof ObjectCache]: GeneratorIterable<Unarray<ObjectCache[key]>>
}

/**
 * A processed Sketch file collates a SketchFile object along with various data structures suited
 * for efficiently inspecting its contents.
 */
export type ProcessedSketchFile = {
  /**
   * A cache of all local objects in the file, i.e. objects native to the file, not from a library.
   */
  objects: ObjectCache
  /**
   * A cache of all foreign objects in the file, i.e. objects or children of objects from libraries.
   */
  foreignObjects: ObjectCache
  /**
   * A map of file object references to JSON Pointer strings.
   */
  pointers: PointerMap
  /**
   * A set of all object ids found in the file.
   */
  objectIds: ObjectIdSet
  /**
   * The SketchFile that was processed.
   */
  file: SketchFile
  /**
   * Statistics about the processed file.
   */
  profile: {
    /**
     * Number of Sketch objetcs in the file.
     */
    numObjects: number
    /**
     * Time taken for processing in milliseconds.
     */
    time: number
  }
}

//
// Assistant running
//

/**
 * The expected shape of the Sketch file workspace used with Assistants. This is
 * where Sketch persists a file's Assistants configuration. First and foremost
 * it's a valid package.json, with the dependencies specifying the active
 * Assistants - every dependency is expected to be a package exporting a valid
 * Assistant on its default export. It additionally persists what's being
 * ignored during the Assistant runs.
 */
export type Workspace = PackageJson & { ignore?: IgnoreConfig }

/**
 * Information about what to ignore during an Assistant run. Pages can be
 * ignored entirely, whereas Assistant rules can either be ignored entirely too,
 * or only ignored for certain file objects.
 */
export type IgnoreConfig = {
  pages: string[]
  assistants: {
    [assistantName: string]: {
      rules: {
        [ruleName: string]:
          | { allObjects: true } // Rule full ignored
          | { allObjects: true; objects: [] } // Rule still full ignored, listed objects may be present in the config but they wont affect the run
          | { objects: [] } // Rule part ignored for listed objects
          | {} // Rule not ignored
      }
    }
  }
}

/**
 * Contains a flag indicating whether the run operation has been cancelled by
 * the outer environment. All long running processes happening during a run
 * (like cache creation, rule invocation etc.) should exit early as soon as a
 * cancellation is detected.
 */
export type RunOperation = { cancelled: boolean } | { cancelled: 1 | 0 }

/**
 * A map of Assistant packages, keyed by Assistant package name. Since the
 * package map is often supplied externally, by an outer layer (e.g. by Sketch
 * to the Assistant runner) we type the packages as unknown.
 */
export type AssistantPackageMap = { [assistantName: string]: unknown }

/**
 * Input required for running a group of multiple Assistant packages
 * against a single Sketch file.
 */
export type RunInput = {
  /**
   * The Assistants to run.
   */
  assistants: AssistantPackageMap
  /**
   * What to ignore during the run.
   */
  ignore: IgnoreConfig
  /**
   * Processed Sketch file to run the Assistants against.
   */
  processedFile: ProcessedSketchFile
  /**
   * GetImageMetadata implmentation.
   */
  getImageMetadata: GetImageMetadata
  /**
   * Object from the external environment carrying the cancelled flag.
   */
  operation: RunOperation
  /**
   * Environment.
   */
  env: AssistantEnv
}

/**
 * The output from running a group of Assistants. Results are grouped by Assistant
 * name, and indicate either success or error.
 */
export type RunOutput = {
  /**
   * Mirror input in the output, for easier processing of results.
   */
  input: RunInput
  /**
   * Ignore directives are pruned during the run to remove orphaned data
   * (non-existant pages, assistants, rules and objects), and returned in the
   * output.
   */
  ignore: IgnoreConfig
  /**
   * Results per Assistant.
   * "error": The Assistant run failed entirely.
   * "success": One or more rules ran successfully.
   */
  assistants: {
    [assistantName: string]:
      | { code: 'error'; error: AssistantErrorResult }
      | { code: 'success'; result: AssistantSuccessResult }
  }
}

/**
 * Profiling statistics about a run.
 */
export type RunOutputProfile = {
  file: {
    time: number
    totalObjects: number
    objectCounts: { [key: string]: { count: number } }
  }
  assistants: {
    [assistantName: string]: {
      time: number
      violations: number
      ruleErrors: number
      rules: {
        [ruleName: string]: {
          violations: number
          time: number
        }
      }
    }
  }
}

/**
 * The run has failed to the extent that collating a RunOutput object is not
 * possible, and the runner function promise rejects instead.
 */
export type RunRejection = {
  /**
   * Human readable message describing the rejection.
   */
  message: string
  /**
   * runError: Something unexpected has gone badly wrong.
   * cancelled: Run cancelled via cancellation signal from outside.
   */
  code: 'runError' | 'cancelled'
}

/**
 * JavaScript errors encountered during rule invocation normalised into plain objects.
 */
export type PlainRuleError = {
  assistantName: string
  ruleName: string
  message: string
  stack: string
}

/**
 * The result of running a single Assistant that errored and did not complete.
 */
export type AssistantErrorResult = {
  message: string
}

/**
 * The result of successfully running a single assistant to completion. Note that
 * even if the Assistant encounters some rules that crash and produce `ruleErrors` then that
 * doesn't invalidate the whole result.
 */
export type AssistantSuccessResult = {
  /**
   * The Assistant "passed" if there are no ViolationSeverity.error level violations present.
   */
  passed: boolean
  /**
   * One or more `violations` implies the assistant’s rules found issues with the Sketch document.
   */
  violations: Violation[]
  /**
   * One or more `ruleErrors` implies that some rules didn’t run because they encountered errors.
   */
  ruleErrors: PlainRuleError[]
  /**
   * Metadata relating to the Assistant that produced the result, and the rules that were invoked.
   */
  metadata: {
    assistant: {
      config: AssistantConfig
      name: string
    }
    rules: {
      [ruleName: string]: {
        name: string
        title: string
        description: string
        debug: boolean
        runtime?: AssistantRuntime
      }
    }
  }
  /**
   * Object containing information about how long each rule took to execute.
   */
  profile: {
    ruleTimings: { [ruleName: string]: number }
  }
}

//
// Rule context
//

/**
 * Contains all the values and utils exposed to individual rule functions.
 */
export type RuleContext = {
  utils: RuleUtils
  file: ProcessedSketchFile
  assistant: AssistantDefinition
  operation: RunOperation
  getImageMetadata: GetImageMetadata
  env: AssistantEnv
}

/**
 * Function for creating a rule utilties object scoped to a specific assistant rule.
 */
export type RuleUtilsCreator = (ruleName: string) => RuleUtils

/**
 * Object containing utilities passed into rule functions. Where needed the util functions are
 * scoped to the current rule, e.g. `report` reports a violation for the current rule and
 * `getOption` retrieves an option value for the current rule etc.
 */
export type RuleUtils = {
  /**
   * Report one or more violations.
   */
  report: (report: ReportItem | ReportItem[]) => void
  /**
   * Contains an iterator for each type of object in the Sketch file.
   */
  objects: IterableObjectCache
  /**
   * Contains an iterator for each type of object in the Sketch file, filtered so it contains _only_
   * foreign objects, that is, objects that have been imported from a library.
   */
  foreignObjects: IterableObjectCache
  /**
   * Determine if a given Sketch file object has been ignored in the run's IgnoreConfig. Ignored
   * objects are automatically filtered out while iterating objects, however if you use a different
   * mechanism to traverse the Sketch file you should manually determine whether an object is ignored
   * before reporting it in a violation.
   */
  isObjectIgnoredForRule: (object: SketchFileObject) => boolean
  /**
   * Get a rule option value by name. Should throw if the rule hasn’t been configured properly in
   * the current assistant context, since it’s essential that every rule activated in an assistant is
   * fully configured.
   */
  getOption: <T = unknown>(option: string) => T
  /**
   * Returns metadata for a given Sketch file image.
   */
  getImageMetadata: (ref: string) => Promise<ImageMetadata>
  /**
   * Return the md5 hash of an object. Keys are deeply sorted for a stable hash.
   * Useful for comparing deep similarity of Sketch document objects. By default
   * the keys `do_objectID` and `$pointer` are excluded since they will always
   * be different.
   */
  objectHash: (o: {}, excludeKeys?: string[]) => string
  /**
   * Compare two document objects for deep equality.
   */
  objectsEqual: (o1: {}, o2: {}, excludeKeys?: string[]) => boolean
  /**
   * Resolve a JSON Pointer string to the value in the Sketch file it points to.
   */
  evalPointer: (pointer: JsonPointer) => unknown
  /**
   * Determine the JSON Pointer for a given object in a Sketch file.
   */
  getObjectPointer: (object: SketchFileObject) => JsonPointer | undefined
  /**
   * Returns the immediate parent object of a Sketch file object.
   */
  getObjectParent: (object: SketchFileObject) => unknown
  /**
   * Returns an array of parent objects for a given Sketch file object, all the way to the root.
   */
  getObjectParents: (object: SketchFileObject) => unknown[]
  /**
   * Compares two style objects for equality.
   */
  styleEq: (s1: FileFormat3.Style | undefined, s2: FileFormat3.Style | undefined) => boolean
  /**
   * Compares two text style objects for equality.
   */
  textStyleEq: (s1: FileFormat3.Style | undefined, s2: FileFormat3.Style | undefined) => boolean
  /**
   * Reduces a text style object into a string hash and returns it.
   */
  textStyleHash: (style: Partial<FileFormat3.Style> | undefined) => string
  /**
   * Reduces a style object into a string hash and returns it.
   */
  styleHash: (style: Partial<FileFormat3.Style> | undefined) => string
}

/**
 * Information a rule needs to supply when reporting a violation.
 */
export type ReportItem = {
  message: string
  object?: SketchFileObject
}

/**
 * A violation collates all the information about a problem, and is the fundamental way an assistant
 * communicates results to the outer environment.
 */
export type Violation = {
  message: string
  assistantName: string
  ruleName: string
  severity: ViolationSeverity
  pointer: string | null
  objectId: string | null
  objectName: string | null
}

/**
 * Define the possible violation severity levels.
 */
export enum ViolationSeverity {
  info = 1,
  warn = 2,
  error = 3,
}

//
// Assistant definition
//

/**
 * Type representing the package.json for an Assistant project/package. Extends the standard
 * package.json spec with a `sketch-assistant` object containing human readable `title` and `description`
 * strings, an icon path and an `i18n` object of translations for the `title` and `description`. All
 * properties are defined as optional since package.json files are user supplied, so their contents
 * cannot be strictly enforced.
 *
 * Example
 *
 *   {
 *     "name": "my-assistant",
 *     "sketch-assistant": {
 *       "title": "My Assistant",
 *       "description": "An example Assistant",
 *       "icon": "https://www.domain.com/some/hosted/image.png",
 *       "i18n": {
 *         "zh-Hans": {
 *           "title": "...",
 *           "description": "..."
 *         }
 *       }
 *     },
 *     ...
 *   }
 */
export type AssistantPackageJson = PackageJson &
  Partial<{
    /**
     * The Sketch equivalent to the standard package.json `main` property. Used for indicating the
     * JavaScript entrypoint Sketch should use when running the Assistant in its JavaScriptCore
     * environment. Note that unlike a Node environment which supports CommonJS modules via the
     * `require` function, Sketch's JavaScript environment does not include any module system, so
     * entrypoints for Sketch referenced via this `sketch` property must be bundled into a single
     * file in a similar way to a web app, typically using Webpack. Also note that Sketch's
     * JavaScriptCore environment is based on modern WebKit (minus the browser APIs), so files
     * should only need to be transpiled down to ES6 at the most.
     */
    sketch: string
    /**
     * Object containing configuration specific to the Assistant.
     */
    'sketch-assistant': Partial<{
      /**
       * Human readable Assistant title for display in Sketch.
       */
      title: string
      /**
       * Human readable Assistant description for display in Sketch.
       */
      description: string
      /**
       * Assistant icon/image for display in Sketch. Should be a fully qualified uri to a publicly
       * hosted image file.
       */
      icon: string
      /**
       * Optional object to contain internationalised versions of the above strings. If this object
       * is present, and contains strings for Sketch's currently active locale, then those will be
       * used in preference.
       */
      i18n: Partial<{
        [locale: string]: Partial<{
          title: string
          description: string
          icon: string
        }>
      }>
    }>
  }>

/**
 * Assistants can run within Node, or the JavaScriptCore runtime provided by Sketch. This type
 * enumerates the two possibilities.
 */
export enum AssistantRuntime {
  Sketch = 'Sketch',
  Node = 'Node',
}

/**
 * Ambient environmental information for assistants, typically provided by an outer assistant runner.
 */
export type AssistantEnv = {
  /**
   * Language tag indicating the current user’s locale. Use this to optionally internationalize your
   * assistant’s content. Its exact value is not guaranteed, so an appropriate fallback locale should
   * always be used for unrecognized values. For assistants running in Sketch it’s value is likely
   * to be either `en` or `zh-Hans`.
   */
  locale: string | undefined
  /**
   * Indicates whether the assistant is running in Node or Sketch.
   */
  runtime: AssistantRuntime
}

/**
 * Canonical definition of an assistant, that is, an async function that given an AssistantEnv
 * will resolve with a concrete AssistantDefinition. Assistants therefore are able to defer final
 * creation until invoked by a runner, and which point critical contextual information such as the
 * locale are available.
 */
export type Assistant = (env: AssistantEnv) => Promise<AssistantDefinition>

/**
 * Defines the expected type for the default export from an assistant package entrypoint. It allows
 * an assistant to be expressed as either a single assistant or an array of assistants that should be extended and merged before a run operation.
 */
export type AssistantPackage = ValueOrArray<Assistant>

/**
 * Concrete assistant definition that can be invoked against a Sketch file during a lint run.
 * Fundamentally assistants collate a list of rules with configuration for those rules, alongside
 * metadata about the assistant.
 */
export type AssistantDefinition = {
  /**
   * List of rules owned by the assistant.
   */
  rules: RuleDefinition[]
  /**
   * Assistant configuration activates and configures one or more rules present in its rule list.
   */
  config: AssistantConfig
  /**
   * Assistant name is the same as its package name, i.e. the `name` property in its `package.json`.
   */
  name: string
}

/**
 * Canonical rule definition combining the rule function, its option schema creator with other
 * basic metadata.
 */
export type RuleDefinition = {
  rule: RuleFunction
  /**
   * The rule name acts as its unique id and should combine an identifier for the rule with the parent
   * assistant’s name separated by a slash, e.g. "assistant-name/rule-name"
   */
  name: string
  /**
   * Human readable title for the rule. Can either be a string e.g. "Groups should not be empty", or
   * a function that returns a string, which enables the title to interpolate configuration values
   * e.g. "Maximum height is 44px".
   */
  title: string | ((ruleConfig: RuleConfig) => string)
  /**
   * Longer human readable description for the rule.
   */
  description: string | ((ruleConfig: RuleConfig) => string)
  /**
   * Rules that require options (i.e. are not just simply "on" or "off") need to describe the schema
   * for those options by implementing this function
   */
  getOptions?: RuleOptionsCreator
  /**
   * Flags a rule as for internal/development purposes only
   */
  debug?: boolean
  /**
   * Indicates rule compatibility. For cross-platform rules this property can be omitted.
   */
  runtime?: AssistantRuntime
}

/**
 * A map of rule configs, keyed by the rule’s name.
 */
export type RuleConfigGroup = {
  [ruleName: string]: Maybe<RuleConfig>
}

/**
 * Contains the assistant configuration.
 */
export type AssistantConfig = {
  /**
   * Default severity to be used for violations raised by rules that haven’t been configured with
   * their own explicit severity level.
   */
  defaultSeverity?: Maybe<ViolationSeverity>
  /**
   * Configuration to be applied to the rules available to the assistant.
   */
  rules: RuleConfigGroup
}

/**
 * User-defined rule options with these names are forbidden.
 */
export enum ReservedRuleOptionNames {
  active = 'active',
  severity = 'severity',
  ruleTitle = 'ruleTitle',
}

/**
 * Contains the configuration for an individual rule.
 */
export type RuleConfig = {
  /**
   * Whether the rule is active or not. Alternatively omitting the rule from the assistant config is
   * the same as setting this flag to `false`.
   */
  [ReservedRuleOptionNames.active]: boolean
  /**
   * Optional custom severity for violations reported by the rule. If omitted the default severity is
   * used instead.
   */
  [ReservedRuleOptionNames.severity]?: ViolationSeverity
  /**
   * Optional custom rule title to replace the title defined by the RuleDefinition. Can be used to
   * supply descriptive rule titles that can only be defined alongside configuration - for example
   * to title a rule "Page names should start with emojis" alongside regex patterns that enforces
   * the same.
   */
  [ReservedRuleOptionNames.ruleTitle]?: string
  /**
   * User-defined rule option are mixed into this object.
   */
  [key: string]: Maybe<RuleOption>
}

/**
 * The valid set of types available for individual rule options.
 */
export type RuleOption =
  | string
  | number
  | boolean
  | string[]
  | { [key: string]: Maybe<string | number | boolean | string[]> }[]

/**
 * Async function that is expected to perform the core rule logic using the values and helper
 * functions provided by the passed in RuleInvocationContext object.
 */
export type RuleFunction = (context: RuleContext) => Promise<void>

//
// Rule Options
//
// This section deals with rule option schemas. Rules declare the options they can be configured
// with as JSON Schema. These schemas fulfil a number of roles - a data source for rule documentation
// generation, a way to validate user supplied configuration data and a way to dynamically create
// configuration editor user interfaces.
//

/**
 * JSONSchema `properties` value.
 */
export type JSONSchemaProps = {
  [key: string]: JSONSchema7
}

/**
 * Creates rule option schema properties for a number option.
 */
export type NumberOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for an integer option.
 */
export type IntegerOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a string option.
 */
export type StringOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string
  minLength?: number
  maxLength?: number
  pattern?: string
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a boolean option.
 */
export type BoolOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: boolean
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a string enum option.
 */
export type StringEnumOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string
  values: string[]
  valueTitles: string[]
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a string array option.
 */
export type StringArrayOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string[]
  minLength?: number
  maxLength?: number
  pattern?: string
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for an object array option.
 */
export type ObjectArrayOptionCreator = (ops: {
  name: string
  title: string
  description: string
  props: JSONSchemaProps[]
  minLength?: number
  maxLength?: number
}) => JSONSchemaProps

/**
 * A function that should be implemented on rule definitions if they need to define custom options.
 */
export type RuleOptionsCreator = (helpers: RuleOptionHelpers) => JSONSchemaProps[]

/**
 * An object of helper functions for creating the different types of option schemas.
 */
export type RuleOptionHelpers = {
  numberOption: NumberOptionCreator
  integerOption: IntegerOptionCreator
  stringOption: StringOptionCreator
  booleanOption: BoolOptionCreator
  stringArrayOption: StringArrayOptionCreator
  stringEnumOption: StringEnumOptionCreator
  objectArrayOption: ObjectArrayOptionCreator
}

/**
 * Combines a set of JSON Schema `properties` objects into a single valid JSON Schema.
 */
export type RuleOptionSchemaCreator = (ops: JSONSchemaProps[]) => JSONSchema7

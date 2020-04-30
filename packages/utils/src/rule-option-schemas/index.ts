import {
  JSONSchemaProps,
  IntegerOptionCreator,
  NumberOptionCreator,
  StringOptionCreator,
  BoolOptionCreator,
  StringEnumOptionCreator,
  StringArrayOptionCreator,
  RuleOptionSchemaCreator,
  RuleOptionHelpers,
  ObjectArrayOptionCreator,
  ReservedRuleOptionNames,
} from '@sketch-hq/sketch-assistant-types'

class ReservedRuleOptionNameError extends Error {
  public optionName: string

  public constructor(optionName: string) {
    super(`Error creating rule option schema, option name "${optionName}" is reserved`)
    this.optionName = optionName
    this.name = 'ReservedRuleOptionNameError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function assertOptionNameNotReserved(optionName: string): asserts optionName is string {
  if (Object.values(ReservedRuleOptionNames).includes(optionName as ReservedRuleOptionNames)) {
    throw new ReservedRuleOptionNameError(optionName)
  }
}

/**
 * Combine multiple rule option schemas into one. We treat _all_ custom options
 * as required.
 */
const buildRuleOptionSchema: RuleOptionSchemaCreator = (ops) => ({
  type: 'object',
  properties: ops.reduce<JSONSchemaProps>(
    (acc, props: JSONSchemaProps) => ({
      ...acc,
      ...props,
    }),
    {},
  ),
  required: ops.map((props) => Object.keys(props)).reduce((acc, val) => acc.concat(val), []), // flatten
})

/**
 * Create a floating point number option.
 */
const numberOption: NumberOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'number',
      title: ops.title,
      description: ops.description,
      default: typeof ops.defaultValue === 'number' ? ops.defaultValue : 0,
      ...(typeof ops.minimum === 'number' ? { minimum: ops.minimum } : {}),
      ...(typeof ops.maximum === 'number' ? { maximum: ops.maximum } : {}),
    },
  }
}

/**
 * Create an integer option.
 */
const integerOption: IntegerOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'integer',
      title: ops.title,
      description: ops.description,
      default: typeof ops.defaultValue === 'number' ? ops.defaultValue : 0,
      ...(typeof ops.minimum === 'number' ? { minimum: ops.minimum } : {}),
      ...(typeof ops.maximum === 'number' ? { maximum: ops.maximum } : {}),
    },
  }
}

/**
 * Create a string option.
 */
const stringOption: StringOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'string',
      title: ops.title,
      description: ops.description,
      default: typeof ops.defaultValue === 'string' ? ops.defaultValue : '',
      ...(typeof ops.minLength === 'number' ? { minLength: ops.minLength } : {}),
      ...(typeof ops.maxLength === 'number' ? { maxLength: ops.maxLength } : {}),
      ...(typeof ops.pattern === 'string' ? { pattern: ops.pattern } : {}),
    },
  }
}

/**
 * Create a boolean option.
 */
const booleanOption: BoolOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'boolean',
      title: ops.title,
      description: ops.description,
      default: typeof ops.defaultValue === 'boolean' ? ops.defaultValue : false,
    },
  }
}

/**
 * Create a string option limited to a set of values.
 */
const stringEnumOption: StringEnumOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'string',
      title: ops.title,
      description: ops.description,
      default: typeof ops.defaultValue === 'string' ? ops.defaultValue : ops.values[0],
      enum: ops.values,
      enumDescriptions: ops.valueTitles,
    },
  }
}

/**
 * Create a string list option.
 */
const stringArrayOption: StringArrayOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'array',
      title: ops.title,
      description: ops.description,
      default: Array.isArray(ops.defaultValue) ? ops.defaultValue : [''],
      items: {
        type: 'string',
        ...(typeof ops.minLength === 'number' ? { minLength: ops.minLength } : {}),
        ...(typeof ops.maxLength === 'number' ? { maxLength: ops.maxLength } : {}),
        ...(typeof ops.pattern === 'string' ? { pattern: ops.pattern } : {}),
      },
    },
  }
}

/**
 * Create an object list option.
 */
const objectArrayOption: ObjectArrayOptionCreator = (ops) => {
  assertOptionNameNotReserved(ops.name)
  return {
    [ops.name]: {
      type: 'array',
      title: ops.title,
      description: ops.description,
      items: {
        type: 'object',
        properties: buildRuleOptionSchema(ops.props).properties,
        ...(typeof ops.minLength === 'number' ? { minLength: ops.minLength } : {}),
        ...(typeof ops.maxLength === 'number' ? { maxLength: ops.maxLength } : {}),
      },
    },
  }
}

const helpers: RuleOptionHelpers = {
  numberOption,
  integerOption,
  stringOption,
  booleanOption,
  stringEnumOption,
  stringArrayOption,
  objectArrayOption,
}

export { buildRuleOptionSchema, helpers }

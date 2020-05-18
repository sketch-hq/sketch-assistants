import { SketchFileObject, FileFormat } from '@sketch-hq/sketch-assistant-types'

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null
}

function assertObject(val: unknown): asserts val is Record<string, unknown> {
  if (!isObject(val)) {
    throw Error('AssertionError: value is not an object')
  }
}

function isArray(val: unknown): val is any[] {
  return typeof val === 'object' && val !== null && val.constructor === Array
}

function assertArray(val: unknown): asserts val is any[] {
  if (!isArray(val)) {
    throw Error('AssertionError: value is not an array')
  }
}

function isStringArray(val: unknown): val is string[] {
  return isArray(val) && typeof val[0] === 'string'
}

function assertStringArray(val: unknown): asserts val is string[] {
  if (!isStringArray(val)) {
    throw Error('AssertionError: value is not an array of strings')
  }
}

function isSketchFileObject(val: unknown): val is SketchFileObject {
  if (!isObject(val)) return false
  const klass: string = '_class' in val && typeof val._class === 'string' ? val._class : ''
  return Object.values<string>(FileFormat.ClassValue).includes(klass)
}

function assertSketchFileObject(val: unknown): asserts val is SketchFileObject {
  if (!isSketchFileObject(val)) {
    throw Error('AssertionError: value is not a Sketch file object')
  }
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

function assertNumber(val: unknown): asserts val is number {
  if (!isNumber(val)) {
    throw Error('AssertionError: value is not a number')
  }
}

export {
  isObject,
  assertObject,
  isArray,
  assertArray,
  isSketchFileObject,
  assertSketchFileObject,
  isStringArray,
  assertStringArray,
  isNumber,
  assertNumber,
}

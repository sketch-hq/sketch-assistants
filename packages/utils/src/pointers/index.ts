import Ptr from '@json-schema-spec/json-pointer'

import { Maybe, PointerValue, FileFormat } from '@sketch-hq/sketch-assistant-types'

/**
 * Resolve a JSON Pointer to a value within a SketchFile.
 */
const get = (pointer: string, instance: FileFormat.Contents): Maybe<PointerValue> => {
  try {
    const ptr = Ptr.parse(pointer)
    return ptr.eval(instance)
  } catch (err) {
    return undefined
  }
}

/**
 * Resolve the parent of a JSON Pointer to a value within a SketchFile.
 */
const parent = (pointer: string, instance: FileFormat.Contents): Maybe<PointerValue> => {
  try {
    const ptr = Ptr.parse(pointer)
    if (ptr.tokens.length === 0) return undefined
    try {
      const parentPtr = new Ptr(ptr.tokens.splice(0, ptr.tokens.length - 1)).toString()
      return get(parentPtr, instance)
    } catch (err) {
      return undefined
    }
  } catch (err) {
    return undefined
  }
}

export { get, parent }

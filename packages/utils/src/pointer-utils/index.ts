import Ptr from '@json-schema-spec/json-pointer'

import { JsonPointer } from '@sketch-hq/sketch-assistant-types'

/**
 * Resolve a RFC6901 JSON Pointer to a value with a target object instance.
 */
const evalPointer = (pointer: string, instance: any): unknown => {
  try {
    const ptr = Ptr.parse(pointer)
    return ptr.eval(instance)
  } catch (err) {
    return undefined
  }
}

/**
 * Unwind a RFC6901 JSON Pointer string one level to find the JSON Pointer for its parent,
 * e.g. `/foo/bar/0/baz` => `foo/bar[0]`. If the JSON Pointer is invalid or the parent isn't
 * available (i.e. already at the root) then `undefined` is returned.
 */
const getParentPointer = (pointer: JsonPointer): JsonPointer | undefined => {
  try {
    const ptr = Ptr.parse(pointer)
    if (ptr.tokens.length === 0) return undefined
    try {
      return new Ptr(ptr.tokens.splice(0, ptr.tokens.length - 1)).toString()
    } catch (err) {
      return undefined
    }
  } catch (err) {
    return undefined
  }
}

export { evalPointer, getParentPointer }

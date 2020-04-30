import { Node } from '@sketch-hq/sketch-assistant-types'

class AssertionError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null
}

function assertNode(val: unknown): asserts val is Node {
  if (isObject(val) && '_class' in val && '$pointer' in val) {
    return
  }
  throw new AssertionError('Value is not Node')
}

export { isObject, assertNode }

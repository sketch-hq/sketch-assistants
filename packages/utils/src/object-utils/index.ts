import hash from 'object-hash'

import { Node, FileFormat } from '@sketch-hq/sketch-assistant-types'

/**
 * Convert a Sketch file-walking Node to a specific file format object. Use this
 * to hint the TypeScript compiler which object type you're currently working
 * with. Usage,
 *
 *     const artboard = nodeToObj<FileFormat.Artboard>(node)
 */
const nodeToObject = <T extends FileFormat.AnyObject>(node: Node): T => {
  const { $pointer: _$pointer, ...obj } = node
  return (obj as unknown) as T
}

/**
 * Return the md5 hash of an object. Keys are deeply sorted for a stable hash.
 * Useful for comparing deep similarity of Sketch document objects.
 */
const objectHash = (obj: {}, excludeKeys: string[] = []): string =>
  hash(obj, {
    unorderedObjects: true,
    algorithm: 'md5',
    excludeKeys: (key) => excludeKeys.includes(key),
  })

/**
 * Compares two objects for deep equality.
 */
const objectsEqual = (o1: {}, o2: {}, excludeKeys: string[] = []): boolean =>
  objectHash(o1, excludeKeys) === objectHash(o2, excludeKeys)

export { nodeToObject, objectHash, objectsEqual }

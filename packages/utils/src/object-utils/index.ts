import hash from 'object-hash'

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

export { objectHash, objectsEqual }

import { evalPointer, getParentPointer } from '../'

describe('evalPointer', () => {
  test('can resolve json pointers to object references', () => {
    const instance = { foo: 1 }
    expect(evalPointer('', instance)).toBe(instance)
    expect(evalPointer('/foo', instance)).toBe(1)
  })
})

describe('getParentPointer', () => {
  test('returns the parent pointer', () => {
    expect(getParentPointer('/document/pages/0')).toBe('/document/pages')
  })

  test('returns a root pointer as parent', () => {
    expect(getParentPointer('/document')).toBe('')
  })

  test('returns undefined past the root', () => {
    expect(getParentPointer('')).not.toBeDefined()
  })
})

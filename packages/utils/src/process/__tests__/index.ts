import { resolve } from 'path'

import { fromFile } from '../../files'
import { process } from '..'

describe('process', () => {
  test('finds and caches layers, groups and objects', async (): Promise<void> => {
    const filepath = resolve(__dirname, './empty.sketch')
    const file = await fromFile(filepath)
    const { objects } = await process(file, { cancelled: false })
    expect(objects.anyGroup).toHaveLength(1)
    expect(objects.anyLayer).toHaveLength(1)
    expect(objects.page).toHaveLength(1)
  })

  test('short-circuits when passed a cancelled op', async (): Promise<void> => {
    const filepath = resolve(__dirname, './empty.sketch')
    const file = await fromFile(filepath)
    const { objects } = await process(file, { cancelled: true })
    expect(objects.anyLayer).toHaveLength(0)
  })

  test('objects can be mapped to pointers', async (): Promise<void> => {
    const filepath = resolve(__dirname, './empty.sketch')
    const file = await fromFile(filepath)
    const { pointers } = await process(file, { cancelled: false })
    expect(pointers.get(file.contents.document)).toBe('/document')
    expect(pointers.get(file.contents.document.pages[0])).toBe('/document/pages/0')
  })

  test('foreign symbols can only be found in the foreign cache', async (): Promise<void> => {
    const filepath = resolve(__dirname, './foreign-symbol.sketch')
    const file = await fromFile(filepath)
    const { objects, foreignObjects } = await process(file, { cancelled: false })
    expect(objects.symbolMaster).toHaveLength(0)
    expect(foreignObjects.symbolMaster).toHaveLength(2)
  })
})

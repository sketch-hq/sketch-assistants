import { resolve } from 'path'

import { fromFile } from '../../from-file'
import { process } from '..'
import { get } from '../../pointers'

describe('process', () => {
  test('finds and caches layers, groups and objects', async (): Promise<void> => {
    expect.assertions(3)
    const filepath = resolve(__dirname, './empty.sketch')
    const file = await fromFile(filepath)
    const res = await process(file, { cancelled: false })
    expect(res.cache.$groups).toHaveLength(1)
    expect(res.cache.$layers).toHaveLength(1)
    expect(res.cache['page']).toHaveLength(1)
  })

  test('short-circuits when passed a cancelled op', async (): Promise<void> => {
    expect.assertions(3)
    const filepath = resolve(__dirname, './empty.sketch')
    const file = await fromFile(filepath)
    const res = await process(file, { cancelled: true })
    expect(res.cache.$groups).toHaveLength(0)
    expect(res.cache.$layers).toHaveLength(0)
    expect(res.cache['page']).toBeUndefined()
  })

  test('augments objects with valid JSON Pointers', async (): Promise<void> => {
    expect.assertions(2)
    const filepath = resolve(__dirname, './empty.sketch')
    const file = await fromFile(filepath)
    const res = await process(file, { cancelled: false })
    if (res.cache['page'] && res.cache['page'][0]._class === 'page') {
      const page = res.cache['page'][0]
      expect(page.$pointer).toMatchInlineSnapshot(`"/document/pages/0"`)
      expect(page).toBe(get(page.$pointer, file.contents))
    }
  })

  test('skips foreign symbols', async (): Promise<void> => {
    expect.assertions(1)
    const filepath = resolve(__dirname, './foreign-symbol.sketch')
    const file = await fromFile(filepath)
    const res = await process(file, { cancelled: false })
    expect(res.cache.symbolMaster).toBeUndefined()
  })
})

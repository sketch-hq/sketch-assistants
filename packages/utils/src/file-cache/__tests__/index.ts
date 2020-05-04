import { resolve } from 'path'

import { createCacheIterator } from '..'
import { fromFile } from '../../from-file'
import { process } from '../../process'

describe('createCacheIterator', () => {
  test('calls visitors for nodes', async (): Promise<void> => {
    expect.assertions(1)
    const file = await fromFile(resolve(__dirname, './empty.sketch'))
    const op = { cancelled: false }
    const res = await process(file, op)
    const cacheIterator = createCacheIterator(res.cache, op)
    const results: string[] = []
    await cacheIterator({
      style: async (node): Promise<void> => {
        results.push(node.$pointer)
      },
    })
    expect(results).toMatchInlineSnapshot(`
      Array [
        "/document/pages/0/style",
      ]
    `)
  })

  test('short-circuits when cancelled', async (): Promise<void> => {
    expect.assertions(1)
    const file = await fromFile(resolve(__dirname, './empty.sketch'))
    const op = { cancelled: true }
    const res = await process(file, op)
    const walker = createCacheIterator(res.cache, op)
    const results: string[] = []
    await walker({
      style: async (node): Promise<void> => {
        results.push(node.$pointer)
      },
    })
    expect(results).toMatchInlineSnapshot(`Array []`)
  })
})

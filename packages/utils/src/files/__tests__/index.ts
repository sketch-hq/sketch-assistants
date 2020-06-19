import { resolve } from 'path'

import { fromFile, filterPages } from '..'
import { SketchFile } from '@sketch-hq/sketch-assistant-types'

describe('fromFile', () => {
  test('parses document entry', async (): Promise<void> => {
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.document._class).toMatchInlineSnapshot(`"document"`)
  })

  test('parses document pages as array of page objects', async (): Promise<void> => {
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.document.pages[0]._class).toMatchInlineSnapshot(`"page"`)
  })

  test('parses meta entry', async (): Promise<void> => {
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.meta.version).toMatchInlineSnapshot(`119`)
  })

  test('parses user entry', async (): Promise<void> => {
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.user.document.pageListHeight).toMatchInlineSnapshot(`85`)
  })
})

describe('filterPages', () => {
  test('filters out pages by id', async (): Promise<void> => {
    const file: SketchFile = filterPages(await fromFile(resolve(__dirname, './empty.sketch')), [
      '9AD22B94-A05B-4F49-8EDD-A38D62BD6181',
    ])
    expect(file.contents.document.pages).toHaveLength(0)
  })
})

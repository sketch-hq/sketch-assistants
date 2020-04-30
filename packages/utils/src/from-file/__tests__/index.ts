import { resolve } from 'path'

import { fromFile } from '..'
import { SketchFile } from '@sketch-hq/sketch-assistant-types'

describe('fromFile', () => {
  test('parses document entry', async (): Promise<void> => {
    expect.assertions(1)
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.document._class).toMatchInlineSnapshot(`"document"`)
  })

  test('parses document pages as array of page objects', async (): Promise<void> => {
    expect.assertions(1)
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.document.pages[0]._class).toMatchInlineSnapshot(`"page"`)
  })

  test('parses meta entry', async (): Promise<void> => {
    expect.assertions(1)
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.meta.version).toMatchInlineSnapshot(`119`)
  })

  test('parses user entry', async (): Promise<void> => {
    expect.assertions(1)
    const file: SketchFile = await fromFile(resolve(__dirname, './empty.sketch'))
    expect(file.contents.user.document.pageListHeight).toMatchInlineSnapshot(`85`)
  })
})

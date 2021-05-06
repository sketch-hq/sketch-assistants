import { SketchFile } from '@sketch-hq/sketch-assistant-types'
import { fromFile } from '@sketch-hq/sketch-file'
import { resolve } from 'path'
import { filterPages } from '..'

describe('filterPages', () => {
  test('filters out pages by id', async (): Promise<void> => {
    const file: SketchFile = filterPages(await fromFile(resolve(__dirname, './empty.sketch')), [
      '9AD22B94-A05B-4F49-8EDD-A38D62BD6181',
    ])
    expect(file.contents.document.pages).toHaveLength(0)
  })
})

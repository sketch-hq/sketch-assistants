import { resolve } from 'path'
import { getImageMetadata } from '../'
import { fromFile } from '../../files'

describe('getImageMetadata', () => {
  test('extracts image metadata', async (): Promise<void> => {
    expect.assertions(1)
    const filepath = resolve(__dirname, './image.sketch')
    const file = await fromFile(filepath)
    const layer = file.contents.document.pages[0].layers[0]
    if (layer._class === 'bitmap') {
      const ref: string = layer.image._ref
      expect(await getImageMetadata(ref, filepath)).toMatchInlineSnapshot(`
        Object {
          "height": 749,
          "ref": "images/ec8a987e6eacad3884b6b78293f19cd0f5ec7490.png",
          "width": 500,
        }
      `)
    }
  })
})

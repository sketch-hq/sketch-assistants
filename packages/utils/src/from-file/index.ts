import StreamZip from 'node-stream-zip'
import { SketchFile, FileFormat } from '@sketch-hq/sketch-assistant-types'

/**
 * Given a path to a Sketch file on the file system, this function unzips the
 * JSON entries and parses them out into a SketchFile object.
 */
const fromFile = async (filepath: string): Promise<SketchFile> => {
  const archive = new StreamZip({
    file: filepath,
    storeEntries: true,
  })

  const contents: FileFormat.Contents = await new Promise((resolve): void => {
    archive.on('ready', (): void => {
      const document = JSON.parse(archive.entryDataSync('document.json').toString())
      const pages = document.pages.map((page: { _ref: string }): void =>
        JSON.parse(archive.entryDataSync(`${page._ref}.json`).toString()),
      )
      resolve({
        document: {
          ...document,
          pages,
        },
        meta: JSON.parse(archive.entryDataSync('meta.json').toString()),
        user: JSON.parse(archive.entryDataSync('user.json').toString()),
      })
    })
  })

  archive.close()

  return { filepath, contents }
}

export { fromFile }

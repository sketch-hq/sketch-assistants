import NodeStreamZip from 'node-stream-zip'
import probeImageSize from 'probe-image-size'

import { ImageMetadata, GetImageMetadata } from '@sketch-hq/sketch-assistant-types'

/**
 * Efficiently access image metadata from a zipped Sketch document. Streams
 * the image from the zip, and returns as soon as the image dimensions are
 * parsed from the header chunks.
 */
const getImageMetadata: GetImageMetadata = (
  ref: string,
  filepath: string,
): Promise<ImageMetadata> =>
  new Promise((resolve, reject): void => {
    const zip = new NodeStreamZip({ file: filepath, storeEntries: true })
    zip.on('error', (error: string): void => reject(error))
    zip.on('ready', (): void => {
      zip.stream(ref, (error, stream): void => {
        stream.on('end', (): void => zip.close())
        if (error) {
          reject(error)
        } else {
          probeImageSize(stream)
            .then((result): void => {
              stream.destroy()
              resolve({
                width: result.width,
                height: result.height,
                ref,
              })
            })
            .catch((error): void => reject(error))
        }
      })
    })
  })

export { getImageMetadata }

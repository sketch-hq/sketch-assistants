import { SketchFile } from '@sketch-hq/sketch-assistant-types'

/**
 * Filter pages out of a SketchFile object based on page ids.
 */
const filterPages = (file: SketchFile, excludedPageIds: string[]): SketchFile => ({
  ...file,
  contents: {
    ...file.contents,
    document: {
      ...file.contents.document,
      pages: file.contents.document.pages.filter(
        (page) => !excludedPageIds.includes(page.do_objectID),
      ),
    },
  },
})

export { filterPages }

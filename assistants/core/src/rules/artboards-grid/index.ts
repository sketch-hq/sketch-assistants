import { RuleFunction, RuleContext, SketchFileObject } from '@sketch-hq/sketch-assistant-types'
import { t } from '@lingui/macro'

import { CreateRuleFunction } from '../..'

type GridSpec = {
  gridBlockSize: number
  thickLinesEvery: number
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const invalid: SketchFileObject[] = []
    // Type safe code to extract relevant options from config
    const grids = utils.getOption('grids')
    if (!Array.isArray(grids) || grids.length === 0) return
    const specs: GridSpec[] = []
    for (let i = 0; i < grids.length; i++) {
      const grid = grids[i]
      if (typeof grid !== 'object') continue
      const { gridBlockSize, thickLinesEvery } = grid
      if (typeof gridBlockSize === 'number' && typeof thickLinesEvery === 'number') {
        specs.push({ gridBlockSize, thickLinesEvery })
      }
    }

    for (const artboard of utils.objects.artboard) {
      const { grid } = artboard

      // Treat artboards with null grid settings as invalid.
      // Note there is no way in the UI to remove a grid and reset it to null
      // once enabled for the first time.
      if (!grid) {
        invalid.push(artboard)
        continue
      }

      // The artboard's grid much precisely match one of the grids defined in the options.
      // Whether the grid is enabled (toggled visually) or not is ignored.
      const gridValid = specs
        .map(
          (spec) =>
            grid.gridSize === spec.gridBlockSize && grid.thickGridTimes === spec.thickLinesEvery,
        )
        .includes(true)
      if (!gridValid) {
        invalid.push(artboard)
      }
    }

    invalid.forEach((object) => {
      utils.report(t`Unexpected Artboard grid settings`, object)
    })
  }

  return {
    rule,
    name: 'artboards-grid',
    title: t`Artboard grid settings should match the conventions`,
    description: t`Keep your specific grid settings consistent across a document, team or project.`,
    getOptions(helpers) {
      return [
        helpers.objectArrayOption({
          name: 'grids',
          title: t`Grids`,
          description: t`List of valid grids`,
          props: [
            helpers.integerOption({
              name: 'gridBlockSize',
              title: t`Grid Block Size`,
              description: t`Grid block size in pixels`,
            }),
            helpers.integerOption({
              name: 'thickLinesEvery',
              title: t`Thick Lines Every`,
              description: t`Number of blocks between thick grid lines`,
            }),
          ],
        }),
      ];
    },
  };
}

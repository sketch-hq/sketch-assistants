import {
  RuleFunction,
  RuleContext,
  ReportItem,
  SketchFileObject,
} from '@sketch-hq/sketch-assistant-types'
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
      if (!grid) {
        invalid.push(artboard) // Treat artboards without grid settings as invalid
        continue
      }
      // The artboard's grid much precisely match one of the grids defined in the
      // options
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

    utils.report(
      invalid.map(
        (object): ReportItem => ({
          message: i18n._(t`Unexpected artboard grid settings`),
          object,
        }),
      ),
    )
  }

  return {
    rule,
    name: 'artboards-grid',
    title: i18n._(t`Artboard grid settings should match the conventions`),
    description: i18n._(
      t`Enforce the consistent and precise usage of specific grid settings across a document, team or project`,
    ),
    getOptions(helpers) {
      return [
        helpers.objectArrayOption({
          name: 'grids',
          title: i18n._(t`Grids`),
          description: i18n._(t`List of valid grids`),
          props: [
            helpers.integerOption({
              name: 'gridBlockSize',
              title: i18n._(t`Grid Block Size`),
              description: i18n._(t`Grid block size in pixels`),
            }),
            helpers.integerOption({
              name: 'thickLinesEvery',
              title: i18n._(t`Thick Lines Every`),
              description: i18n._(t`Number of blocks between thick grid lines`),
            }),
          ],
        }),
      ]
    },
  }
}

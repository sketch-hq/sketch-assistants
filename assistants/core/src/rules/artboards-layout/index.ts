import { t } from '@lingui/macro'
import {
  RuleContext,
  RuleFunction,
  ReportItem,
  SketchFileObject,
} from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

type LayoutSpec = {
  drawVertical: boolean
  drawHorizontal: boolean
  columns?: {
    gutterWidth: number
    columnWidth: number
    guttersOutside: boolean
    horizontalOffset: number
    numberOfColumns: number
    totalWidth: number
  }
  rows?: {
    gutterHeight: number
    drawHorizontalLines: boolean
    rowHeightMultiplication: number
  }
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const invalid: SketchFileObject[] = []

    // Type safe code to extract relevant options from config
    const layouts = utils.getOption('layouts')
    if (!Array.isArray(layouts) || layouts.length === 0) return
    const specs: LayoutSpec[] = []

    for (let i = 0; i < layouts.length; i++) {
      const layout = layouts[i]
      if (typeof layout !== 'object') continue
      const spec: LayoutSpec = {
        drawVertical: !!layout.drawVertical,
        drawHorizontal: !!layout.drawHorizontal,
      }
      const {
        gutterWidth,
        columnWidth,
        guttersOutside,
        horizontalOffset,
        numberOfColumns,
        totalWidth,
      } = layout
      if (
        spec.drawVertical &&
        typeof gutterWidth === 'number' &&
        typeof columnWidth === 'number' &&
        typeof guttersOutside === 'boolean' &&
        typeof horizontalOffset === 'number' &&
        typeof numberOfColumns === 'number' &&
        typeof totalWidth === 'number'
      ) {
        spec.columns = {
          gutterWidth,
          columnWidth,
          guttersOutside,
          horizontalOffset,
          numberOfColumns,
          totalWidth,
        }
      }
      const { gutterHeight, rowHeightMultiplication, drawHorizontalLines } = layout
      if (
        spec.drawHorizontal &&
        typeof gutterHeight === 'number' &&
        typeof rowHeightMultiplication === 'number' &&
        typeof drawHorizontalLines === 'boolean'
      ) {
        spec.rows = {
          gutterHeight,
          rowHeightMultiplication,
          drawHorizontalLines,
        }
      }
      specs.push(spec)
    }

    for (const artboard of utils.objects.artboard) {
      const { layout } = artboard
      if (!layout || !layout.isEnabled) {
        invalid.push(artboard) // Treat artboards without grid settings as invalid
        continue
      }
      // The artboard's layout much match one of the layouts defined in the options
      const columnsValid = specs
        .map((spec) => {
          if (spec.drawVertical === false) {
            // Treat artboard columns as valid and return early if
            // drawVertical set to false, i.e. columns checkbox in layout
            // UI unchecked.
            return true
          }
          return (
            typeof spec.columns === 'object' &&
            spec.columns.gutterWidth === layout.gutterWidth &&
            spec.columns.columnWidth === layout.columnWidth &&
            spec.columns.guttersOutside === layout.guttersOutside &&
            spec.columns.horizontalOffset === layout.horizontalOffset &&
            spec.columns.numberOfColumns === layout.numberOfColumns &&
            spec.columns.totalWidth === layout.totalWidth
          )
        })
        .includes(true)
      const rowsValid = specs
        .map((spec) => {
          if (spec.drawHorizontal === false) {
            // Treat artboard rows as valid and return early if
            // drawHorizontal set to false, i.e. rows checkbox in layout
            // UI unchecked.
            return true
          }
          return (
            typeof spec.rows === 'object' &&
            spec.rows.gutterHeight === layout.gutterHeight &&
            spec.rows.rowHeightMultiplication === layout.rowHeightMultiplication &&
            spec.rows.drawHorizontalLines === layout.drawHorizontalLines
          )
        })
        .includes(true)
      if (!rowsValid || !columnsValid) {
        invalid.push(artboard)
      }
    }
    utils.report(
      invalid.map(
        (object): ReportItem => ({
          message: i18n._(t`Unexpected artboard layout settings`),
          object,
        }),
      ),
    )
  }

  return {
    rule,
    name: 'artboards-layout',
    title: i18n._(t`Artboard layout settings should match the conventions`),
    description: i18n._(
      t`Enforce the consistent and precise usage of specific layout settings across a document, team or project`,
    ),
    getOptions(helpers) {
      return [
        helpers.objectArrayOption({
          name: 'layouts',
          title: i18n._(t`Layouts`),
          description: i18n._(
            t`List of valid layouts. Each layout object reproduces the options found on the Layout Settings UI in Sketch`,
          ),
          props: [
            helpers.booleanOption({
              name: 'drawVertical',
              title: i18n._(t`Draw Vertical`),
              description: i18n._(t`Enables drawing columns`),
            }),
            helpers.numberOption({
              name: 'totalWidth',
              title: i18n._(t`Total Width`),
              description: i18n._(t`Total width of layout`),
            }),
            helpers.numberOption({
              name: 'horizontalOffset',
              title: i18n._(t`Horizontal Offset`),
              description: i18n._(t`Horizontal offset of layout`),
            }),
            helpers.numberOption({
              name: 'numberOfColumns',
              title: i18n._(t`Number of Columns`),
              description: i18n._(t`Number of columns in the layout`),
            }),
            helpers.booleanOption({
              name: 'guttersOutside',
              title: i18n._(t`Gutters Outside`),
              description: i18n._(t`Draw gutters on the outside`),
            }),
            helpers.numberOption({
              name: 'gutterWidth',
              title: i18n._(t`Gutter Width`),
              description: i18n._(t`Gutter width in layout`),
            }),
            helpers.numberOption({
              name: 'columnWidth',
              title: i18n._(t`Column Width`),
              description: i18n._(t`Layout column widths`),
            }),
            helpers.booleanOption({
              name: 'drawHorizontal',
              title: i18n._(t`Draw Horizontal`),
              description: i18n._(t`Enables drawing rows`),
            }),
            helpers.numberOption({
              name: 'gutterHeight',
              title: i18n._(t`Gutter Height`),
              description: i18n._(t`Layout gutter height`),
            }),
            helpers.numberOption({
              name: 'rowHeightMultiplication',
              title: i18n._(t`Row Height Multiplication`),
              description: 'Row height multiplication',
            }),
            helpers.booleanOption({
              name: 'drawHorizontalLines',
              title: i18n._(t`Draw Horizontal Lines`),
              description: i18n._(t`Draw all horizontal lines`),
            }),
          ],
        }),
      ]
    },
  }
}

import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

const isBlended = (
  styles: (FileFormat.Fill | FileFormat.Border | FileFormat.Shadow | FileFormat.InnerShadow)[] = [],
): boolean => {
  return !!styles.find((item) => item.contextSettings.blendMode !== FileFormat.BlendMode.Normal)
}

const NON_BMP_FORMATS = [
  FileFormat.ExportFileFormat.EPS,
  FileFormat.ExportFileFormat.PDF,
  FileFormat.ExportFileFormat.SVG,
]

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    for (const layer of utils.objects.anyLayer) {
      if (layer._class === 'artboard' || layer._class === 'page') continue // Skip for artboards and page layers
      const { exportFormats } = layer.exportOptions
      if (exportFormats.length === 0) continue // Skip if layer not exported
      const fileFormats = exportFormats.reduce<FileFormat.ExportFileFormat[]>((acc, exportForm) => {
        return [...acc, exportForm.fileFormat]
      }, [])
      if (fileFormats.filter((fmt) => NON_BMP_FORMATS.includes(fmt)).length === 0) continue // If layer is only exported as bitmap formats then skip
      if (layer.style?.contextSettings?.blendMode !== FileFormat.BlendMode.Normal) {
        utils.report({
          object: layer,
          message: i18n._(
            t`This exportable layer has a blend mode. Try flattening it for more consistent results.`,
          ),
        })
        continue
      }
      if (
        isBlended(layer.style?.fills) ||
        isBlended(layer.style?.borders) ||
        isBlended(layer.style?.shadows) ||
        isBlended(layer.style?.innerShadows)
      ) {
        utils.report({
          object: layer,
          message: i18n._(
            t`This exportable layer has blend modes. Try flattening them for more consistent results.`,
          ),
        })
      }
    }
  }

  return {
    rule,
    name: 'exported-layers-normal-blend-mode',
    title: i18n._(t`Avoid blend modes on exportable layers`),
    description: i18n._(
      t`Blend mode effects depend on what's behind the layer, so exporting layers might not give you the results you want. Some teams might want to flag this to avoid mistakes.`,
    ),
  }
}

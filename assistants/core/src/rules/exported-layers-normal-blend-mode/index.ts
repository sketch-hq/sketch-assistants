import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

const isBlended = (
  styles: (FileFormat.Fill | FileFormat.Border | FileFormat.Shadow | FileFormat.InnerShadow)[] = [],
): boolean => {
  return !!styles.find((item) => item.contextSettings.blendMode !== FileFormat.BlendMode.Normal)
}

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    await utils.iterateCache({
      async $layers(node): Promise<void> {
        const layer = utils.nodeToObject<FileFormat.AnyLayer>(node)
        if (layer._class === 'artboard' || layer._class === 'page') return
        if (layer.exportOptions.exportFormats.length === 0) return
        if (layer.style?.contextSettings?.blendMode !== FileFormat.BlendMode.Normal) {
          utils.report({
            node,
            message: i18n._(
              t`Blend mode found on exported layer, consider flattening the blend mode for consistent export results.`,
            ),
          })
          return
        }
        if (
          isBlended(layer.style?.fills) ||
          isBlended(layer.style?.borders) ||
          isBlended(layer.style?.shadows) ||
          isBlended(layer.style?.innerShadows)
        ) {
          utils.report({
            node,
            message: i18n._(
              t`Blend mode found on exported layer, consider flattening the blend modes for consistent export results.`,
            ),
          })
        }
      },
    })
  }

  return {
    rule,
    name: 'exported-layers-normal-blend-mode',
    title: i18n._(t`Avoid blend modes on exported layers`),
    description: i18n._(
      t`The visual effect of a blend mode is dependant on what's behind the layer, therefore exporting these layers will often not reproduce the desired result in the exported asset. Some teams may wish to flag exported layers with blend modes in case they represent a mistake`,
    ),
  }
}

import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat, Unarray } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

const isLooseLayer = (layer: Unarray<FileFormat.Page['layers']>) =>
  layer._class !== 'artboard' && layer._class !== 'symbolMaster'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    for (const page of utils.objects.page) {
      for (const layer of page.layers) {
        if (isLooseLayer(layer)) {
          utils.report({
            object: layer,
            message: i18n._(t`This layer is not inside an Artboard`),
          })
        }
      }
    }
  }

  return {
    rule,
    name: 'layers-no-loose',
    title: i18n._(t`Layers should not be outside artboards`),
    description: i18n._(
      t`Layers outside of Artboards aren't visible on Cloud, so some teams may want to keep all layers inside Artboards.`,
    ),
  }
}

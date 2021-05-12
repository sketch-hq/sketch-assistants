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
        if (isLooseLayer(layer) && !utils.isObjectIgnored(layer)) {
          utils.report(t`This layer is not inside an Artboard`, layer)
        }
      }
    }
  }

  return {
    rule,
    name: 'layers-no-loose',
    title: t`Layers should not be outside artboards`,
    description: t`Layers outside of Artboards aren't visible on Cloud, so some teams may want to keep all layers inside Artboards.`,
  };
}

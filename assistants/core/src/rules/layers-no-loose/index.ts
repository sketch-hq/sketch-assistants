import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

const isLooseLayer = (layer: FileFormat.AnyLayer) =>
  layer._class !== 'artboard' && layer._class !== 'symbolMaster'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    await utils.iterateCache({
      async page(node): Promise<void> {
        const page = utils.nodeToObject<FileFormat.Page>(node)
        if (page.layers.some(isLooseLayer)) {
          utils.report({
            node,
            message: i18n._(t`This layer is not inside an Artboard`),
          })
        }
      },
    })
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

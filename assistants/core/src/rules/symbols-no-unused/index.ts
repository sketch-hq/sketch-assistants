import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, Node, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const masters: Node[] = []
    const instances: Node[] = []
    await utils.iterateCache({
      async symbolMaster(node): Promise<void> {
        masters.push(node)
      },
      async symbolInstance(node): Promise<void> {
        instances.push(node)
      },
    })
    const invalid: Node[] = masters.filter(
      (master) =>
        instances.findIndex(
          (instance) =>
            utils.nodeToObject<FileFormat.SymbolInstance>(instance).symbolID ===
            utils.nodeToObject<FileFormat.SymbolMaster>(master).symbolID,
        ) === -1,
    )
    utils.report(
      invalid.map((node) => ({
        message: i18n._(t`This symbol is unused`),
        node,
      })),
    )
  }

  return {
    rule,
    name: 'symbols-no-unused',
    title: i18n._(t`All symbols should be in-use`),
    description: i18n._(t`Some teams may consider unused symbols a document organization issue.`),
  }
}

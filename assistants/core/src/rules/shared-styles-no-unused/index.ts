import { t } from '@lingui/macro'
import { RuleContext, RuleFunction, Node, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context

    const sharedStyles: Node<FileFormat.SharedStyle>[] = []
    const usages: Set<string> = new Set()

    await utils.iterateCache({
      async sharedStyle(node) {
        sharedStyles.push(node as Node<FileFormat.SharedStyle>)
      },
      async symbolInstance(node) {
        const obj = utils.nodeToObject<FileFormat.SymbolInstance>(node)
        obj.overrideValues.forEach((override) => {
          if (typeof override.value === 'string') usages.add(override.value)
        })
      },
      async $layers(node) {
        const obj = utils.nodeToObject(node)
        if ('sharedStyleID' in obj && typeof obj.sharedStyleID === 'string') {
          usages.add(obj.sharedStyleID)
        }
      },
    })

    const invalid: Node[] = sharedStyles.filter((node) => !usages.has(node.do_objectID))

    utils.report(
      invalid.map((node) => ({
        message: i18n._(t`This shared style is unused`),
        node,
      })),
    )
  }

  return {
    rule,
    name: 'shared-styles-no-unused',
    title: i18n._(t`All shared styles should be used`),
    description: i18n._(
      t`Some teams may consider unused shared styles a document organization issue.`,
    ),
  }
}

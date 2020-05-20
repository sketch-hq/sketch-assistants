import { t, plural } from '@lingui/macro'
import { RuleContext, RuleFunction, FileFormat } from '@sketch-hq/sketch-assistant-types'

import { CreateRuleFunction } from '../..'

function assertMaxIdentical(val: unknown): asserts val is number {
  if (typeof val !== 'number') {
    throw new Error()
  }
}

type GroupFingerprint = string

export const createRule: CreateRuleFunction = (i18n) => {
  const rule: RuleFunction = async (context: RuleContext): Promise<void> => {
    const { utils } = context
    const maxIdentical = utils.getOption('maxIdentical')
    assertMaxIdentical(maxIdentical)
    const fingerprints = new Map<GroupFingerprint, FileFormat.Group[]>()
    for (const group of utils.objects.group) {
      const numberOfLayers = group.layers.length
      const layerTypes = group.layers.map((layer) => layer?._class)
      const layerNames = group.layers.map((layer) => layer?.name)
      const fingerprint = JSON.stringify({ numberOfLayers, layerTypes, layerNames })
      const similarGroups: FileFormat.Group[] = fingerprints.get(fingerprint) || []
      similarGroups.push(group)
      fingerprints.set(fingerprint, similarGroups)
    }
    for (let similar of fingerprints.values()) {
      if (similar.length > maxIdentical) {
        similar.forEach((group) => {
          const identicalGroupNames = similar
            .filter((n) => n !== group) // new array without current node...
            .map((n) => n.name) // ...and lists only the node names...
            .join() // ...converted to a single string
          utils.report({
            object: group,
            message: i18n._(t`Group is similar to other groups: ${identicalGroupNames}`),
          })
        })
      }
    }
  }

  return {
    rule,
    name: 'groups-no-similar',
    title: (ruleConfig) => {
      const { maxIdentical } = ruleConfig
      if (typeof maxIdentical !== 'number') return ''
      return i18n._(
        plural({
          value: maxIdentical,
          one: 'Similar groups should be a symbol',
          other: 'More than # similar groups should be a symbol',
        }),
      )
    },
    description: i18n._(
      t`Don't allow groups that are too similar. Consider using a Symbol instead.`,
    ),
    getOptions: (helpers) => [
      helpers.integerOption({
        name: 'maxIdentical',
        title: i18n._(t`Max Identical`),
        description: i18n._(t`The maximum number of identical groups allowed in the document`),
        minimum: 1,
        defaultValue: 1,
      }),
    ],
  }
}

import { AssistantPackage } from '@sketch-hq/sketch-assistant-types'
import CoreAssistant from '@sketch-hq/sketch-core-assistant'

const assistant: AssistantPackage = [
  CoreAssistant,
  async () => {
    return {
      name: '@sketch-hq/sketch-naming-conventions-assistant',
      rules: [],
      config: {
        rules: {
          '@sketch-hq/sketch-core-assistant/name-pattern-pages': {
            active: true,
            forbidden: [],
            allowed: ['^(?![ a-zA-Z0-9,.-_;!"#$%&/()@Û£><|\\¼»`«]).'],
            ruleTitle: 'Page names should start with an emoji',
          },
          '@sketch-hq/sketch-core-assistant/name-pattern-artboards': {
            active: true,
            forbidden: [],
            allowed: ['^(\\d+\\.?)+ .*'],
            ruleTitle: 'Artboard names should start with numbers',
          },
          '@sketch-hq/sketch-core-assistant/name-pattern-groups': {
            active: true,
            allowed: [],
            forbidden: ['^Group$', 'Group Copy'],
            ruleTitle: 'Group names should not be default',
          },
          '@sketch-hq/sketch-core-assistant/name-pattern-symbols': {
            active: true,
            allowed: ['(^.+)(([/].*)+)\\w$'],
            forbidden: [],
            ruleTitle: 'Symbol names should use forward slash grouping',
          },
        },
      },
    }
  },
]

export default assistant

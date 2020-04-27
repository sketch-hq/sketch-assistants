import { Assistant } from '@sketch-hq/sketch-assistant-types'
import core from '@sketch-hq/sketch-assistant-core-rules'

const assistant: Assistant = async (env) => {
  const coreAssistant = await core(env)
  return {
    name: '@sketch-hq/sketch-naming-conventions-assistant',
    rules: coreAssistant.rules,
    config: {
      rules: {
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-pages': {
          active: true,
          forbidden: [],
          allowed: ['^(?![a-zA-Z0-9,.-_;!"#$%&/()@Û£><|\\¼»`«]).'],
          ruleTitle: 'Page names should start with an emoji',
        },
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-artboards': {
          active: true,
          forbidden: [],
          allowed: ['^(?![a-zA-Z;!"#$%&/()@Û£><|\\¼»`«]).'],
          ruleTitle: 'Artboard names should start with numbers',
        },
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-groups': {
          active: true,
          allowed: [],
          forbidden: ['^Group$', 'Group Copy'],
          ruleTitle: 'Group names should not be default',
        },
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-symbols': {
          active: true,
          allowed: ['(^.+)(([/].*)+)\\w$'],
          forbidden: [],
          ruleTitle: 'Symbol names should use forward slash grouping',
        },
      },
    },
  }
}

export default assistant

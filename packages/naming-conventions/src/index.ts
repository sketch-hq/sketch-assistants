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
        },
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-artboards': {
          active: true,
          forbidden: [],
          allowed: ['^(?![a-zA-Z;!"#$%&/()@Û£><|\\¼»`«]).'],
        },
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-groups': {
          active: true,
          allowed: [],
          forbidden: ['^Group$', 'Group Copy'],
        },
        '@sketch-hq/sketch-assistant-core-rules/name-pattern-symbols': {
          active: true,
          allowed: ['(^.+)(([/].*)+)\\w$'],
          forbidden: [],
        },
      },
    },
  }
}

export default assistant

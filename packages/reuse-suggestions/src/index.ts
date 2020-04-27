import { Assistant } from '@sketch-hq/sketch-assistant-types'
import core from '@sketch-hq/sketch-assistant-core-rules'

const assistant: Assistant = async (env) => {
  const coreAssistant = await core(env)
  return {
    name: '@sketch-hq/sketch-reuse-suggestions-assistant',
    rules: coreAssistant.rules,
    config: {
      rules: {
        '@sketch-hq/sketch-assistant-core-rules/text-styles-prefer-shared': {
          active: true,
          maxIdentical: 2,
        },
        '@sketch-hq/sketch-assistant-core-rules/layer-styles-prefer-shared': {
          active: true,
          maxIdentical: 2,
        },
        '@sketch-hq/sketch-assistant-core-rules/groups-no-similar': {
          active: true,
          maxIdentical: 2,
        },
      },
    },
  }
}

export default assistant

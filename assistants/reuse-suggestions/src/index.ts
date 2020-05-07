import { AssistantPackageExport } from '@sketch-hq/sketch-assistant-types'
import CoreAssistant from '@sketch-hq/sketch-core-assistant'

const assistant: AssistantPackageExport = [
  CoreAssistant,
  async () => {
    return {
      name: '@sketch-hq/sketch-reuse-suggestions-assistant',
      rules: [],
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
  },
]

export default assistant

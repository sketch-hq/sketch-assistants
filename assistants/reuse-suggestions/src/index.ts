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
          '@sketch-hq/sketch-core-assistant/text-styles-prefer-shared': {
            active: true,
            maxIdentical: 2,
          },
          '@sketch-hq/sketch-core-assistant/layer-styles-prefer-shared': {
            active: true,
            maxIdentical: 2,
          },
          '@sketch-hq/sketch-core-assistant/groups-no-similar': {
            active: true,
            maxIdentical: 2,
          },
        },
      },
    }
  },
]

export default assistant

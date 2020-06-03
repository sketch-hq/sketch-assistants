import type { AssistantConfig, AssistantPackage } from '@sketch-hq/sketch-assistant-types'
import CoreAssistant from '@sketch-hq/sketch-core-assistant'

export const config: AssistantConfig = {
  rules: {
    '@sketch-hq/sketch-core-assistant/artboards-max-ungrouped-layers': {
      active: true,
      maxUngroupedLayers: 5,
    },
    '@sketch-hq/sketch-core-assistant/borders-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/fills-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/inner-shadows-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/shadows-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/layer-styles-no-dirty': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/text-styles-no-dirty': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/groups-no-empty': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/groups-no-redundant': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/layers-no-hidden': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/layers-subpixel-positioning': {
      active: true,
      scaleFactors: ['@1x', '@2x'],
    },
    '@sketch-hq/sketch-core-assistant/shared-styles-no-unused': {
      active: true,
    },
    '@sketch-hq/sketch-core-assistant/layers-no-loose': {
      active: true,
    },
  },
}

const assistant: AssistantPackage = [
  CoreAssistant,
  async () => {
    return {
      name: '@sketch-hq/sketch-tidy-assistant',
      rules: [],
      config,
    }
  },
]

export default assistant

import type { AssistantConfig, AssistantPackageExport } from '@sketch-hq/sketch-assistant-types'
import CoreRulesAssistant from '@sketch-hq/sketch-assistant-core-rules'

export const config: AssistantConfig = {
  rules: {
    '@sketch-hq/sketch-assistant-core-rules/artboards-max-ungrouped-layers': {
      active: true,
      maxUngroupedLayers: 5,
    },
    '@sketch-hq/sketch-assistant-core-rules/borders-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/fills-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/inner-shadows-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/shadows-no-disabled': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/layer-styles-no-dirty': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/text-styles-no-dirty': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/groups-no-empty': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/groups-no-redundant': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/layers-no-hidden': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/layers-subpixel-positioning': {
      active: true,
      scaleFactors: ['@1x', '@2x'],
    },
    '@sketch-hq/sketch-assistant-core-rules/shared-styles-no-unused': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/symbols-no-unused': {
      active: true,
    },
    '@sketch-hq/sketch-assistant-core-rules/layers-no-loose': {
      active: true,
    },
  },
}

const assistant: AssistantPackageExport = [
  CoreRulesAssistant,
  async () => {
    return {
      name: '@sketch-hq/sketch-tidy-assistant',
      rules: [],
      config,
    }
  },
]

export default assistant

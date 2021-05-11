import {
  AssistantPackage,
  RuleDefinition,
  AssistantDefinition,
  AssistantEnv,
} from '@sketch-hq/sketch-assistant-types'
import { I18n, AllMessages, i18n } from '@lingui/core'

import * as artboardsGrid from './rules/artboards-grid'
import * as artboardsLayout from './rules/artboards-layout'
import * as artboardsMaxUngroupedLayers from './rules/artboards-max-ungrouped-layers'
import * as bordersNoDisabled from './rules/borders-no-disabled'
import * as colorsPreferVariable from './rules/colors-prefer-variable'
import * as debugAllOptions from './rules/debug-all-options'
import * as debugI18n from './rules/debug-i18n'
import * as debugThrowsError from './rules/debug-throws-error'
import * as debugTimeout from './rules/debug-timeout'
import * as exportedLayersNormalBlendMode from './rules/exported-layers-normal-blend-mode'
import * as fillsNoDisabled from './rules/fills-no-disabled'
import * as groupsMaxLayers from './rules/groups-max-layers'
import * as groupsNoEmpty from './rules/groups-no-empty'
import * as groupsNoRedundant from './rules/groups-no-redundant'
import * as groupsNoSimilar from './rules/groups-no-similar'
import * as imagesNoOutsized from './rules/images-no-outsized'
import * as imagesNoUndersized from './rules/images-no-undersized'
import * as innerShadowsNoDisabled from './rules/inner-shadows-no-disabled'
import * as layersNoHidden from './rules/layers-no-hidden'
import * as layersNoLoose from './rules/layers-no-loose'
import * as layersSubpixelPositioning from './rules/layers-subpixel-positioning'
import * as layerStylesNoDirty from './rules/layer-styles-no-dirty'
import * as layerStylesPreferShared from './rules/layer-styles-prefer-shared'
import * as libraryLayerStylesAllowedLibraries from './rules/library-layer-styles-allowed-libraries'
import * as librarySymbolsAllowedLibraries from './rules/library-symbols-allowed-libraries'
import * as libraryTextStylesAllowedLibraries from './rules/library-text-styles-allowed-libraries'
import * as namePatternArtboards from './rules/name-pattern-artboards'
import * as namePatternGroups from './rules/name-pattern-groups'
import * as namePatternImages from './rules/name-pattern-images'
import * as namePatternPages from './rules/name-pattern-pages'
import * as namePatternShapes from './rules/name-pattern-shapes'
import * as namePatternSymbols from './rules/name-pattern-symbols'
import * as namePatternText from './rules/name-pattern-text'
import * as resultMessagesInclude from './rules/result-messages-include'
import * as shadowsNoDisabled from './rules/shadows-no-disabled'
import * as sharedStylesNoUnused from './rules/shared-styles-no-unused'
import * as symbolsNoDetached from './rules/symbols-no-detached'
import * as symbolsNoUnused from './rules/symbols-no-unused'
import * as textStylesNoDirty from './rules/text-styles-no-dirty'
import * as textStylesPreferShared from './rules/text-styles-prefer-shared'

import { messages as enMessages } from './locale/en/messages'
import { messages as zhHansMessages } from './locale/zh-Hans/messages'
import { en, zh } from 'make-plural/plurals'

export type CreateRuleFunction = (i18n: I18n) => RuleDefinition

export const createI18NObject = (env: AssistantEnv): I18n => {
  const DEFAULT_LOCALE = 'en'
  const messages: AllMessages = { en: enMessages, 'zh-Hans': zhHansMessages }

  i18n.loadLocaleData({
    en: { plurals: en },
    'zh-Hans': { plurals: zh },
  })
  i18n.load({ en: messages.en, 'zh-Hans': messages['zh-Hans'] })

  const locale: string = Object.keys(messages).find((l) => l == env.locale) || DEFAULT_LOCALE
  i18n.activate(locale)

  return i18n
}

const assistant: AssistantPackage = async (env) => {
  const i18n: I18n = createI18NObject(env)
  const pkgName = '@sketch-hq/sketch-core-assistant'
  const definition: AssistantDefinition = {
    name: pkgName,
    rules: [
      artboardsGrid,
      artboardsLayout,
      artboardsMaxUngroupedLayers,
      bordersNoDisabled,
      colorsPreferVariable,
      debugAllOptions,
      debugI18n,
      debugThrowsError,
      debugTimeout,
      exportedLayersNormalBlendMode,
      fillsNoDisabled,
      groupsMaxLayers,
      groupsNoEmpty,
      groupsNoRedundant,
      groupsNoSimilar,
      imagesNoOutsized,
      imagesNoUndersized,
      innerShadowsNoDisabled,
      layersNoHidden,
      layersNoLoose,
      layersSubpixelPositioning,
      layerStylesNoDirty,
      layerStylesPreferShared,
      libraryLayerStylesAllowedLibraries,
      librarySymbolsAllowedLibraries,
      libraryTextStylesAllowedLibraries,
      namePatternArtboards,
      namePatternGroups,
      namePatternImages,
      namePatternPages,
      namePatternShapes,
      namePatternSymbols,
      namePatternText,
      resultMessagesInclude,
      shadowsNoDisabled,
      sharedStylesNoUnused,
      symbolsNoDetached,
      symbolsNoUnused,
      textStylesNoDirty,
      textStylesPreferShared,
    ].map((mod) => {
      const rule = mod.createRule(i18n)
      return { ...rule, name: `${pkgName}/${rule.name}` }
    }),
    config: { rules: {} },
  }
  return definition
}

export default assistant

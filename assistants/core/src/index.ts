import {
  AssistantPackage,
  RuleDefinition,
  AssistantDefinition,
} from '@sketch-hq/sketch-assistant-types'
import { I18n, setupI18n } from '@lingui/core'

import * as artboardsGrid from './rules/artboards-grid'
import * as artboardsLayout from './rules/artboards-layout'
import * as artboardsMaxUngroupedLayers from './rules/artboards-max-ungrouped-layers'
import * as bordersNoDisabled from './rules/borders-no-disabled'
import * as debugAllOptions from './rules/debug-all-options'
import * as debugI18n from './rules/debug-i18n'
import * as debugThrowsError from './rules/debug-throws-error'
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
import * as layerStylesPreferLibrary from './rules/layer-styles-prefer-library'
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
import * as symbolsNoUnused from './rules/symbols-no-unused'
import * as symbolsPreferLibrary from './rules/symbols-prefer-library'
import * as textStylesNoDirty from './rules/text-styles-no-dirty'
import * as textStylesPreferLibrary from './rules/text-styles-prefer-library'
import * as textStylesPreferShared from './rules/text-styles-prefer-shared'

import enMessages from './locale/en/messages'
import zhHansMessages from './locale/zh-Hans/messages'

export type CreateRuleFunction = (i18n: I18n) => RuleDefinition

const SUPPORTED_LOCALES = ['en', 'zh-Hans']
const FALLBACK_LOCALE = 'en'
const pkgName = '@sketch-hq/sketch-core-assistant'

const assistant: AssistantPackage = async (env) => {
  const i18n: I18n = setupI18n({
    language: SUPPORTED_LOCALES.includes(env.locale!) ? env.locale : FALLBACK_LOCALE,
    catalogs: {
      en: enMessages,
      'zh-Hans': zhHansMessages,
    },
  })
  const definition: AssistantDefinition = {
    name: pkgName,
    rules: [
      artboardsGrid,
      artboardsLayout,
      artboardsMaxUngroupedLayers,
      bordersNoDisabled,
      debugAllOptions,
      debugI18n,
      debugThrowsError,
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
      layerStylesPreferLibrary,
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
      symbolsNoUnused,
      symbolsPreferLibrary,
      textStylesNoDirty,
      textStylesPreferLibrary,
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

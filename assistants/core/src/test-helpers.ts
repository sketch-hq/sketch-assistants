import { resolve } from 'path'
import { testRuleInAssistant } from '@sketch-hq/sketch-assistant-utils'
import { AssistantEnv, RuleConfig } from '@sketch-hq/sketch-assistant-types'

import CoreAssistant from './index'

export const testCoreRule = async (
  dirname: string,
  fixture: string,
  ruleName: string,
  config: RuleConfig = { active: true },
  env?: AssistantEnv,
): Promise<ReturnType<typeof testRuleInAssistant>> =>
  await testRuleInAssistant(
    resolve(dirname, fixture),
    CoreAssistant,
    `@sketch-hq/sketch-core-assistant/${ruleName}`,
    config,
    env,
  )

import { resolve } from 'path'
import * as utils from '@sketch-hq/sketch-assistant-utils'
import { AssistantEnv, AssistantResult, RuleConfig } from '@sketch-hq/sketch-assistant-types'

import assistant from './index'

export const testRule = async (
  dirname: string,
  fixture: string,
  ruleId: string,
  config?: RuleConfig,
  env?: AssistantEnv,
): Promise<AssistantResult> =>
  await utils.testRule(
    resolve(dirname, fixture),
    assistant,
    `@sketch-hq/sketch-core-assistant/${ruleId}`,
    config,
    env,
  )

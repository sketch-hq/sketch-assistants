import {
  FileFormat,
  Assistant,
  RuleOptionsCreator,
  RuleFunction,
  RuleDefinition,
  AssistantDefinition,
  AssistantConfig,
  ViolationSeverity,
  RuleConfigGroup,
  AssistantEnv,
  AssistantSuccessResult,
  RuleConfig,
  AssistantPackage,
  AssistantRuntime,
} from '@sketch-hq/sketch-assistant-types'
import { fromFile } from '../files'
import { process } from '../process'
import { prepare, getRuleDefinition } from '../assistant'
import { runAssistant } from '../run/run-assistant'
import { getImageMetadata } from '../get-image-metadata'

/**
 * Create a dummy rule definition.
 */
const createRule = ({
  title,
  description,
  rule,
  getOptions,
  name,
  debug,
  runtime,
}: {
  title?: RuleDefinition['title']
  description?: RuleDefinition['description']
  rule?: RuleFunction
  name?: string
  getOptions?: RuleOptionsCreator
  debug?: boolean
  runtime?: AssistantRuntime
} = {}): RuleDefinition => ({
  name: name ?? 'dummy-assistant/dummy-rule',
  title: title ?? 'Dummy Rule',
  description: description ?? 'Dummy rule created in a test helper',
  rule: rule || (async (): Promise<void> => {}),
  getOptions,
  debug,
  runtime,
})

/**
 * Create a dummy assistant configuration.
 */
const createAssistantConfig = ({
  rules,
  defaultSeverity,
}: {
  rules?: RuleConfigGroup
  defaultSeverity?: ViolationSeverity
} = {}): AssistantConfig => ({
  ...(typeof defaultSeverity === 'undefined' ? {} : { defaultSeverity }),
  rules: rules || {},
})

/**
 * Create a dummy assistant definition.
 */
const createAssistantDefinition = ({
  name,
  config,
  rules,
}: {
  title?: string
  description?: string
  name?: string
  config?: AssistantConfig
  rules?: RuleDefinition[]
} = {}): AssistantDefinition => ({
  name: name ?? 'dummy-assistant',
  config: config || createAssistantConfig(),
  rules: rules || [],
})

/**
 * Create a dummy assistant function.
 */
const createAssistant = ({
  title,
  description,
  name,
  config,
  rules,
}: {
  title?: string
  description?: string
  name?: string
  config?: AssistantConfig
  rules?: RuleDefinition[]
} = {}): Assistant => async (): Promise<AssistantDefinition> =>
  createAssistantDefinition({ title, description, name, config, rules })

const createDummyRect = (): FileFormat.Rect => ({
  _class: 'rect',
  constrainProportions: false,
  height: 10,
  width: 10,
  x: 0,
  y: 0,
})

const createDummySwatch = (id = '1'): FileFormat.Swatch => ({
  _class: 'swatch',
  do_objectID: id,
  name: 'dummy-swatch',
  value: {
    _class: 'color',
    alpha: 1,
    red: 1,
    blue: 1,
    green: 1,
  },
})

type TestResult = Omit<AssistantSuccessResult, 'metadata' | 'profile'>

/**
 * Test an Assistant.
 */
const testAssistant = async (
  filepath: string,
  assistant: AssistantPackage,
  env: AssistantEnv = { locale: 'en', runtime: AssistantRuntime.Node },
): Promise<TestResult> => {
  const file = await fromFile(filepath)
  const op = { cancelled: false }
  const processedFile = await process(file, op)
  const def = await prepare(assistant, env)

  const { violations, ruleErrors, passed } = await runAssistant(
    processedFile,
    def,
    env,
    op,
    getImageMetadata,
    { pages: [], assistants: {} },
  )

  return { violations, ruleErrors, passed }
}

/**
 * Test a rule by running it against a custom config within the context of a
 * temporary Assistant.
 */
const testRule = async (
  filepath: string,
  rule: RuleDefinition,
  ruleConfig: RuleConfig = { active: true },
  env: AssistantEnv = { locale: 'en', runtime: AssistantRuntime.Node },
): Promise<TestResult> => {
  const file = await fromFile(filepath)
  const op = { cancelled: false }
  const processedFile = await process(file, op)
  const assistant: Assistant = async () => ({
    name: 'test-assistant',
    rules: [rule],
    config: {
      rules: {
        [rule.name]: ruleConfig,
      },
    },
  })
  const def = await prepare(assistant, env)

  const { violations, ruleErrors, passed } = await runAssistant(
    processedFile,
    def,
    env,
    op,
    getImageMetadata,
    { pages: [], assistants: {} },
  )

  return { violations, ruleErrors, passed }
}

/**
 * Test a rule in isolation within the context of an Assistant. Only the rule under test is
 * activated, so violations or rule errors from other rules are ignored. A custom rule config can
 * be supplied, but if omitted the config currently configured in the Assistant is used.
 */
const testRuleInAssistant = async (
  filepath: string,
  assistant: AssistantPackage,
  ruleName: string,
  ruleConfig?: RuleConfig,
  env: AssistantEnv = { locale: 'en', runtime: AssistantRuntime.Node },
): Promise<TestResult> => {
  const file = await fromFile(filepath)
  const op = { cancelled: false }
  const processedFile = await process(file, op)
  const def = await prepare(assistant, env)

  def.rules = def.rules.filter((rule) => rule.name === ruleName)

  if (!getRuleDefinition(def, ruleName)) {
    throw new Error(`Rule "${ruleName}" not found on Assistant "${def.name}"`)
  }

  def.config.rules = {
    [ruleName]: ruleConfig ? ruleConfig : def.config.rules[ruleName],
  }

  const { violations, ruleErrors, passed } = await runAssistant(
    processedFile,
    def,
    env,
    op,
    getImageMetadata,
    { pages: [], assistants: {} },
  )

  return { violations, ruleErrors, passed }
}

export {
  createRule,
  createDummyRect,
  createDummySwatch,
  createAssistantConfig,
  createAssistant,
  createAssistantDefinition,
  testRule,
  testRuleInAssistant,
  testAssistant,
}

import { AssistantRuntime } from '@sketch-hq/sketch-assistant-types'
import { testCoreRule } from '../../../test-helpers'

describe('debug-i18n', () => {
  test('en locale', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'debug-i18n',
      {
        active: true,
      },
      { locale: 'en', runtime: AssistantRuntime.Node },
    )

    expect(ruleErrors).toHaveLength(0)
    expect(violations[0].message).toMatchInlineSnapshot(`"Hello world"`)
  })

  test('zh-Hans locale', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'debug-i18n',
      {
        active: true,
      },
      { locale: 'zh-Hans', runtime: AssistantRuntime.Node },
    )

    expect(ruleErrors).toHaveLength(0)
    expect(violations[0].message).toMatchInlineSnapshot(`"你好世界"`)
  })

  test('unsupported locale fallsback to en', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'debug-i18n',
      {
        active: true,
      },
      { locale: 'abc', runtime: AssistantRuntime.Node },
    )

    expect(ruleErrors).toHaveLength(0)
    expect(violations[0].message).toMatchInlineSnapshot(`"Hello world"`)
  })
})

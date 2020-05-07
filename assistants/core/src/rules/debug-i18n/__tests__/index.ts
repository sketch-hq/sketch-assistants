import { testRule } from '../../../test-helpers'

describe('debug-i18n', () => {
  test('en locale', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './empty.sketch',
      'debug-i18n',
      {
        active: true,
      },
      { locale: 'en', platform: 'node' },
    )

    expect(errors).toHaveLength(0)
    expect(violations[0].message).toMatchInlineSnapshot(`"Hello world"`)
  })

  test('zh-Hans locale', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './empty.sketch',
      'debug-i18n',
      {
        active: true,
      },
      { locale: 'zh-Hans', platform: 'node' },
    )

    expect(errors).toHaveLength(0)
    expect(violations[0].message).toMatchInlineSnapshot(`"世界你好"`)
  })

  test('unsupported locale fallsback to en', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './empty.sketch',
      'debug-i18n',
      {
        active: true,
      },
      { locale: 'abc', platform: 'node' },
    )

    expect(errors).toHaveLength(0)
    expect(violations[0].message).toMatchInlineSnapshot(`"Hello world"`)
  })
})

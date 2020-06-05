import { testCoreRule } from '../../../test-helpers'

describe('name-pattern-pages', () => {
  test('no violations when all layer names are whitelisted', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './named-pages.sketch',
      'name-pattern-pages',
      {
        active: true,
        allowed: [],
        forbidden: [],
        conventions: '',
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when layer names are whitelisted', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './named-pages.sketch',
      'name-pattern-pages',
      {
        active: true,
        allowed: ['Foo', 'Bar'],
        forbidden: [],
        conventions: '',
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations when some layer names are not allowed', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './named-pages.sketch',
      'name-pattern-pages',
      {
        active: true,
        allowed: ['Foo'],
        forbidden: [],
        conventions: '',
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations when some layer names are forbidden', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './named-pages.sketch',
      'name-pattern-pages',
      {
        active: true,
        allowed: [],
        forbidden: ['Foo'],
        conventions: '',
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('forbidden names trump allowed names', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './named-pages.sketch',
      'name-pattern-pages',
      {
        active: true,
        allowed: ['Foo', 'Bar'],
        forbidden: ['Foo'],
        conventions: '',
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

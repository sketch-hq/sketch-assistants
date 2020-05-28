import { testRule } from '../../../test-helpers'

describe('name-pattern-shapes', () => {
  test('no violations when all layer names are whitelisted', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './named-shapes.sketch',
      'name-pattern-shapes',
      {
        active: true,
        allowed: [],
        forbidden: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('no violations when layer names are whitelisted', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './named-shapes.sketch',
      'name-pattern-shapes',
      {
        active: true,
        allowed: ['Foo', 'Bar'],
        forbidden: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations when some layer names are not allowed', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './named-shapes.sketch',
      'name-pattern-shapes',
      {
        active: true,
        allowed: ['Foo'],
        forbidden: [],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('violations when some layer names are forbidden', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './named-shapes.sketch',
      'name-pattern-shapes',
      {
        active: true,
        allowed: [],
        forbidden: ['Foo'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })

  test('forbidden names trump allowed names', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testRule(
      __dirname,
      './named-shapes.sketch',
      'name-pattern-shapes',
      {
        active: true,
        allowed: ['Foo', 'Bar'],
        forbidden: ['Foo'],
      },
    )
    expect(violations).toHaveLength(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

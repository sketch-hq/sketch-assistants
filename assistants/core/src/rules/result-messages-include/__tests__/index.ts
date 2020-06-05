import { testCoreRule } from '../../../test-helpers'

describe('result-messages-include', () => {
  test('no violations when whitelisted', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'result-messages-include',
      {
        active: true,
        messages: [],
      },
    )
    expect(violations).toHaveLength(0)
    expect(ruleErrors).toHaveLength(0)
  })

  test('has violations when messages are present', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, ruleErrors } = await testCoreRule(
      __dirname,
      './empty.sketch',
      'result-messages-include',
      {
        active: true,
        messages: ['Ensure all copy is run past the marketing team'],
      },
    )
    expect(violations.length).toBe(1)
    expect(ruleErrors).toHaveLength(0)
  })
})

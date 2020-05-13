import { testRule } from '../../../test-helpers'

describe('debug-all-options', () => {
  test('does not errors or violations', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(__dirname, './empty.sketch', 'debug-all-options')

    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })
})

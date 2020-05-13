import { testRule } from '../../../test-helpers'

describe('groups-no-redundant', () => {
  test('no violations for non-redundant groups', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './non-redundant-group.sketch',
      'groups-no-redundant',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('no violations for styled redundant groups', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './styled-redundant-group.sketch',
      'groups-no-redundant',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('no violations for shared styled redundant groups', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './shared-style-redundant-group.sketch',
      'groups-no-redundant',
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('finds violations for redundant groups', async (): Promise<void> => {
    expect.assertions(2)
    const { violations, errors } = await testRule(
      __dirname,
      './redundant-group.sketch',
      'groups-no-redundant',
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })
})

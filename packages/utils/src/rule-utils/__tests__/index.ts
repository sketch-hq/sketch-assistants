import { resolve } from 'path'

import { createRuleUtilsCreator, styleEq, textStyleEq } from '..'
import { process } from '../../process'
import { fromFile } from '../../from-file'
import {
  FileFormat,
  Violation,
  AssistantDefinition,
  RuleUtils,
  ViolationSeverity,
} from '@sketch-hq/sketch-assistant-types'
import { getImageMetadata } from '../../get-image-metadata'
import { createAssistantDefinition, createAssistantConfig, createRule } from '../../test-helpers'
import { assertNode } from '../../assert'

const buildUtils = async (
  filepath: string,
  assistant: AssistantDefinition,
  ruleName: string,
  violations: Violation[] = [],
): Promise<{ violations: Violation[]; utils: RuleUtils }> => {
  const op = { cancelled: false }
  const file = await fromFile(resolve(__dirname, filepath))
  const processedFile = await process(file, op)
  return {
    violations,
    utils: createRuleUtilsCreator(
      processedFile,
      violations,
      assistant,
      op,
      getImageMetadata,
    )(ruleName),
  }
}

describe('createRuleUtilsCreator', () => {
  test('throws when named rule not present in the assistant', async (): Promise<void> => {
    expect.assertions(1)
    try {
      await buildUtils(
        './empty.sketch',
        createAssistantDefinition({
          config: createAssistantConfig({ rules: { foo: { active: true } } }),
          rules: [],
        }),
        'foo',
      )
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[RuleNotFoundError: Rule "foo" not found on assistant "dummy-assistant"]`,
      )
    }
  })
})

describe('getOption', () => {
  test('can get an option', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    expect(utils.getOption('active')).toBeTruthy()
  })

  test('throws when option missing in config', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    try {
      utils.getOption('fluxCapacitance')
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[InvalidRuleConfigError: Invalid configuration found for rule "foo" on assistant "dummy-assistant": Option "fluxCapacitance" not found in assistant configuration]`,
      )
    }
  })

  test("throws when option in config doesn't match rule's schema", async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true, custom: '1' } } }),
        rules: [
          createRule({
            name: 'foo',
            getOptions: (helpers) => [
              helpers.numberOption({ name: 'custom', title: '', description: '' }),
            ],
          }),
        ],
      }),
      'foo',
    )
    try {
      utils.getOption('custom')
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[InvalidRuleConfigError: Invalid configuration found for rule "foo" on assistant "dummy-assistant": ".custom" should be number]`,
      )
    }
  })
})

describe('get', () => {
  test('can resolve file objects by json pointer', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true, custom: '1' } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const page = utils.get('/document/pages/0')
    expect(page).toBeDefined()
  })
})

describe('parent', () => {
  test('can resolve file object parents by json pointer', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const pagesArray = utils.parent('/document/pages/0')
    expect(pagesArray).toBeInstanceOf(Array)
  })
})

describe('iterateCache', () => {
  test('can iterate objects in cache', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const pointers: string[] = []
    await utils.iterateCache({
      page: async (node) => {
        pointers.push(node.$pointer)
      },
    })
    expect(pointers).toMatchInlineSnapshot(`
      Array [
        "/document/pages/0",
      ]
    `)
  })
})

describe('report', () => {
  test('can report violations', async (): Promise<void> => {
    expect.assertions(1)
    const { utils, violations } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    await utils.iterateCache({
      page: async (node) => {
        utils.report({ message: "Something isn't right here", node })
      },
    })
    expect(violations).toHaveLength(1)
  })

  test('violations default to config level severity', async (): Promise<void> => {
    expect.assertions(1)
    const { utils, violations } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({
          defaultSeverity: ViolationSeverity.info,
          rules: { foo: { active: true } },
        }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    await utils.iterateCache({
      page: async (node) => {
        utils.report({ message: "Something isn't right here", node })
      },
    })
    expect(violations[0].severity).toBe(ViolationSeverity.info)
  })

  test('violation severity can be set in rule config', async (): Promise<void> => {
    expect.assertions(1)
    const { utils, violations } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({
          rules: { foo: { active: true, severity: ViolationSeverity.info } },
        }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    await utils.iterateCache({
      page: async (node) => {
        utils.report({ message: "Something isn't right here", node })
      },
    })
    expect(violations[0].severity).toBe(ViolationSeverity.info)
  })
})

describe('iterateParents', () => {
  test('can iterate parents', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const page = utils.get('/document/pages/0')
    const pointers: string[] = []
    utils.iterateParents(page, (parent) => {
      pointers.push(parent.$pointer)
    })
    expect(pointers).toMatchInlineSnapshot(`
      Array [
        "/document/pages",
        "/document",
        "",
      ]
    `)
  })
})

describe('nodeToObject', () => {
  test('converts nodes to sketch file objects', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const page = utils.get('/document/pages/0')
    assertNode(page)
    expect(utils.nodeToObject(page)).not.toHaveProperty('$pointer')
  })
})

describe('objectHash', () => {
  test('objects with the same contents produce the same hash', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    expect(utils.objectHash({ foo: 'bar' })).toBe(utils.objectHash({ foo: 'bar' }))
  })

  test('property order does not matter', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    expect(utils.objectHash({ foo: 'bar', baz: 'qux' })).toBe(
      utils.objectHash({ baz: 'qux', foo: 'bar' }),
    )
  })

  test('$pointer and do_objectID values are ignored by default', async (): Promise<void> => {
    expect.assertions(1)
    const { utils } = await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    expect(utils.objectHash({ foo: 'bar', $pointer: '1', do_objectID: '1' })).toBe(
      utils.objectHash({ foo: 'bar', $pointer: '2', do_objectID: '2' }),
    )
  })
})

describe('styleEq', () => {
  test('can test style objects for equality', async (): Promise<void> => {
    expect.assertions(2)
    await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )

    const file1 = await fromFile(resolve(__dirname, './simple-style.sketch'))
    const file2 = await fromFile(resolve(__dirname, './simple-style.sketch'))
    const style1 = file1.contents.document.pages[0].layers[0].style
    const style2 = file2.contents.document.pages[0].layers[0].style

    if (style2 && style2.blur) style2.blur.center = '{0.6, 0.5}'

    expect(styleEq(style1, style1)).toBe(true)
    expect(styleEq(style1, style2)).toBe(false)
  })

  test('can test text style objects for equality', async (): Promise<void> => {
    expect.assertions(2)
    await buildUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )

    const file1 = await fromFile(resolve(__dirname, './simple-textstyle.sketch'))
    const file2 = await fromFile(resolve(__dirname, './simple-textstyle.sketch'))
    const style1 = file1.contents.document.pages[0].layers[0].style
    const style2 = file2.contents.document.pages[0].layers[0].style

    expect(textStyleEq(style1, style1)).toBe(true)

    if (style2 && style2.textStyle) {
      style2.textStyle.encodedAttributes.underlineStyle = 1
    }

    expect(textStyleEq(style1, style2 as FileFormat.Style)).toBe(false)
  })
})

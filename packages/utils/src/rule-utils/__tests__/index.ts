import { resolve } from 'path'
import {
  Violation,
  AssistantDefinition,
  RuleUtils,
  ProcessedSketchFile,
  FileFormat,
  IgnoreConfig,
} from '@sketch-hq/sketch-assistant-types'

import { createRuleUtilsCreator, createIterable, createIterableObjectCache } from '..'
import { process, createEmptyObjectCache } from '../../process'
import { fromFile } from '../../files'
import { getImageMetadata } from '../../get-image-metadata'
import {
  createDummyRect,
  createAssistantDefinition,
  createAssistantConfig,
  createRule,
  createDummySwatch,
} from '../../test-helpers'

/**
 * Test helper function for creating a utils object.
 */
const createUtils = async (
  filepath: string = './empty.sketch',
  assistant: AssistantDefinition = createAssistantDefinition({
    config: createAssistantConfig({ rules: { foo: { active: true } } }),
    rules: [createRule({ name: 'foo' })],
  }),
  ruleName: string = 'foo',
  violations: Violation[] = [],
  ignoreConfig: IgnoreConfig = { pages: [], assistants: {} },
): Promise<{ violations: Violation[]; utils: RuleUtils; processedFile: ProcessedSketchFile }> => {
  const op = { cancelled: false }
  const file = await fromFile(resolve(__dirname, filepath))
  const processedFile = await process(file, op)
  return {
    processedFile,
    violations,
    utils: createRuleUtilsCreator(
      processedFile,
      violations,
      assistant,
      op,
      getImageMetadata,
      ignoreConfig,
    )(ruleName),
  }
}

describe('createIterable', () => {
  test('can yield file format objects', () => {
    const iterable = createIterable<FileFormat.Rect>(
      [createDummyRect(), createDummyRect()],
      {
        cancelled: false,
      },
      [],
    )
    expect([...iterable].map((item) => item._class)).toMatchInlineSnapshot(`
      Array [
        "rect",
        "rect",
      ]
    `)
  })

  test('can short-circuit when operation is cancelled', () => {
    const iterable = createIterable<FileFormat.Rect>(
      [createDummyRect(), createDummyRect()],
      {
        cancelled: true,
      },
      [],
    )
    expect([...iterable]).toHaveLength(0)
  })
})

describe('createIterableObjectCache', () => {
  test('works with an empty cache', () => {
    const cache = createEmptyObjectCache()
    const iterableCache = createIterableObjectCache(cache, { cancelled: false }, [])
    expect([...iterableCache.text]).toHaveLength(0)
  })

  test('for..of loops work with type safety', () => {
    const cache = createEmptyObjectCache()
    cache[FileFormat.ClassValue.Rect] = [createDummyRect(), createDummyRect()]
    const iterableCache = createIterableObjectCache(cache, { cancelled: false }, [])
    for (const rect of iterableCache.rect) {
      expect(rect._class).toBe('rect')
    }
  })

  test('objects can be ignored by id', () => {
    const cache = createEmptyObjectCache()
    cache[FileFormat.ClassValue.Swatch] = [createDummySwatch('1'), createDummySwatch('2')]
    const iterableCache = createIterableObjectCache(cache, { cancelled: false }, ['2'])
    const result = [...iterableCache.swatch]
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('do_objectID', '1')
  })
})

describe('createRuleUtilsCreator', () => {
  test('throws when named rule not present in the assistant', async (): Promise<void> => {
    try {
      await createUtils(
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
    const { utils } = await createUtils(
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
    const { utils } = await createUtils(
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
    const { utils } = await createUtils(
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

describe('getObjectParents', () => {
  test('returns parent objects to the root', async (): Promise<void> => {
    const { utils, processedFile } = await createUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const style = processedFile.file.contents.document.pages[0].style
    const parents = utils.getObjectParents(style!)
    expect(parents[0]).toBe(processedFile.file.contents)
    expect(parents[1]).toBe(processedFile.file.contents.document)
    expect(parents[2]).toBe(processedFile.file.contents.document.pages)
    expect(parents[3]).toBe(processedFile.file.contents.document.pages[0])
  })
})

describe('evalPointer', () => {
  test('can resolve file objects by json pointer', async (): Promise<void> => {
    const { utils, processedFile } = await createUtils(
      './empty.sketch',
      createAssistantDefinition({
        config: createAssistantConfig({ rules: { foo: { active: true, custom: '1' } } }),
        rules: [createRule({ name: 'foo' })],
      }),
      'foo',
    )
    const page = utils.evalPointer('/document/pages/0')
    expect(page).toBe(processedFile.file.contents.document.pages[0])
  })
})

describe('getObjectParent', () => {
  test('can resolve file object parents by json pointer', async (): Promise<void> => {
    const { utils, processedFile } = await createUtils()
    const parent = utils.getObjectParent(processedFile.file.contents.document)
    expect(parent).toBe(processedFile.file.contents)
  })
})

describe('objects', () => {
  test('exposes iterators for file objects', async (): Promise<void> => {
    const { utils } = await createUtils()
    const pages: FileFormat.Page[] = [...utils.objects.page]
    expect(pages).toHaveLength(1)
    expect(pages[0]._class).toBe('page')
  })
})

describe('isObjectIgnored', () => {
  test('returns ignore status of object and rule combinations', async (): Promise<void> => {
    const swatch1 = createDummySwatch('1')
    const swatch2 = createDummySwatch('2')
    const { utils } = await createUtils(
      './empty.sketch',
      createAssistantDefinition({
        name: 'foo',
        rules: [createRule({ name: 'bar' })],
      }),
      'bar',
      [],
      { pages: [], assistants: { foo: { rules: { bar: { objects: ['1'] } } } } },
    )
    expect(utils.isObjectIgnoredForRule(swatch1)).toBe(true)
    expect(utils.isObjectIgnoredForRule(swatch2)).toBe(false)
  })
})

describe('foreignObjects', () => {
  test('exposes iterators for foreign file objects', async (): Promise<void> => {
    const { utils } = await createUtils('./foreign-symbol.sketch')
    const symbols: FileFormat.SymbolMaster[] = [...utils.foreignObjects.symbolMaster]
    expect(symbols).toHaveLength(2)
    expect(symbols[0]._class).toBe(FileFormat.ClassValue.SymbolMaster)
  })
})

describe('report', () => {
  test('can report violations', async (): Promise<void> => {
    const { utils, violations } = await createUtils()
    utils.report(
      [...utils.objects.page].map((page) => ({ message: "Something isn't right", object: page })),
    )
    expect(violations).toHaveLength(1)
    expect(violations[0]).toMatchInlineSnapshot(`
      Object {
        "assistantName": "dummy-assistant",
        "message": "Something isn't right",
        "objectId": "9AD22B94-A05B-4F49-8EDD-A38D62BD6181",
        "objectName": "Page 1",
        "pointer": "/document/pages/0",
        "ruleName": "foo",
        "severity": 3,
      }
    `)
  })
})

describe('objectHash', () => {
  test('objects with the same contents produce the same hash', async (): Promise<void> => {
    const { utils } = await createUtils()
    expect(utils.objectHash({ foo: 'bar' })).toBe(utils.objectHash({ foo: 'bar' }))
  })

  test('property order does not matter', async (): Promise<void> => {
    const { utils } = await createUtils()
    expect(utils.objectHash({ foo: 'bar', baz: 'qux' })).toBe(
      utils.objectHash({ baz: 'qux', foo: 'bar' }),
    )
  })

  test('do_objectID values are ignored by default', async (): Promise<void> => {
    const { utils } = await createUtils()
    expect(utils.objectHash({ foo: 'bar', do_objectID: '1' })).toBe(
      utils.objectHash({ foo: 'bar', do_objectID: '2' }),
    )
  })
})

describe('styleEq', () => {
  test('can test style objects for equality', async (): Promise<void> => {
    const { utils } = await createUtils(
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

    expect(utils.styleEq(style1, style1)).toBe(true)
    expect(utils.styleEq(style1, style2)).toBe(false)
  })

  test('can test text style objects for equality', async (): Promise<void> => {
    const { utils } = await createUtils()

    const file1 = await fromFile(resolve(__dirname, './simple-textstyle.sketch'))
    const file2 = await fromFile(resolve(__dirname, './simple-textstyle.sketch'))
    const style1 = file1.contents.document.pages[0].layers[0].style
    const style2 = file2.contents.document.pages[0].layers[0].style

    expect(utils.textStyleEq(style1, style1)).toBe(true)

    if (style2 && style2.textStyle) {
      style2.textStyle.encodedAttributes.underlineStyle = 1
    }

    expect(utils.textStyleEq(style1, style2)).toBe(false)
  })
})

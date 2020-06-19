import { IgnoreConfig, AssistantPackageMap } from '@sketch-hq/sketch-assistant-types'

import { prunePages, pruneAssistants, pruneRules, pruneObjects } from '../'
import { resolve } from 'path'
import { fromFile } from '../../../files'
import { createAssistantDefinition, createRule } from '../../../test-helpers'
import { process } from '../../../process'

describe('prunePages', () => {
  test('should prune pages not present in the file ', async () => {
    const ignore: IgnoreConfig = {
      pages: ['7CDC2A8F-35F7-4B82-A481-60E59A89381D', 'missing-page-uuid'],
      assistants: {},
    }
    const file = await fromFile(resolve(__dirname, './pages.sketch'))
    expect(prunePages(ignore, file).pages).not.toContain('missing-page-uuid')
    expect(prunePages(ignore, file).pages).toContain('7CDC2A8F-35F7-4B82-A481-60E59A89381D')
  })
})

describe('pruneAssistants', () => {
  test('should prune assistants not present in the package map', async () => {
    const ignore: IgnoreConfig = {
      pages: [],
      assistants: {
        assistant1: { rules: {} },
        assistant2: { rules: {} },
      },
    }
    const packageMap: AssistantPackageMap = {
      assistant1: [],
    }
    expect(pruneAssistants(ignore, packageMap).assistants).not.toHaveProperty('assistant2')
  })
})

describe('pruneRules', () => {
  test('should prune ignored rules not present in the assistant', async () => {
    const ignore: IgnoreConfig = {
      pages: [],
      assistants: {
        assistant1: { rules: { foo: { allObjects: true }, bar: { allObjects: true } } },
      },
    }
    const assistant = createAssistantDefinition({
      name: 'assistant1',
      rules: [createRule({ name: 'foo' })],
    })
    expect(pruneRules(ignore, assistant).assistants.assistant1.rules).not.toHaveProperty('bar')
  })

  test('rule pruning is scoped to the assistant', async () => {
    const ignore: IgnoreConfig = {
      pages: [],
      assistants: {
        assistant1: { rules: { foo: { allObjects: true } } },
        assistant2: { rules: { foo: { allObjects: true } } },
      },
    }
    const assistant = createAssistantDefinition({
      name: 'assistant1',
      rules: [createRule({ name: 'bar' })],
    })
    expect(pruneRules(ignore, assistant).assistants.assistant1.rules).not.toHaveProperty('foo')
    expect(pruneRules(ignore, assistant).assistants.assistant2.rules).toHaveProperty('foo')
  })
})

describe('pruneObjects', () => {
  test('should prune ignored objects not present in the file', async () => {
    const ignore: IgnoreConfig = {
      pages: [],
      assistants: {
        assistant1: {
          rules: {
            rule1: {
              objects: ['58CB1F63-87F1-4C5D-894F-A2BE2E55759C', 'missing-object-uuid'],
            },
          },
        },
      },
    }
    const file = await fromFile(resolve(__dirname, './objects.sketch'))
    const processedFile = await process(file, { cancelled: false })
    expect.assertions(2)
    const pruned = pruneObjects(ignore, processedFile)
    if ('objects' in pruned.assistants.assistant1.rules.rule1) {
      expect(pruned.assistants.assistant1.rules.rule1.objects).not.toContain('missing-object-uuid')
      expect(pruned.assistants.assistant1.rules.rule1.objects).toContain(
        '58CB1F63-87F1-4C5D-894F-A2BE2E55759C',
      )
    }
  })
})

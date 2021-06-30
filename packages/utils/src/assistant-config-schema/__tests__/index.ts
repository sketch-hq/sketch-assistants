import { buildAssistantConfigSchema } from '..'
import { createAssistantConfig, createAssistantDefinition, createRule } from '../../test-helpers'

describe('buildAssistantConfigSchema', () => {
  test('builds configuration schema', (): void => {
    const assistant = createAssistantDefinition({
      rules: [createRule({ name: 'foo' })],
      config: createAssistantConfig({
        rules: {
          foo: { active: true },
        },
      }),
    })

    expect(buildAssistantConfigSchema(assistant)).toMatchInlineSnapshot(`
    Object {
      "properties": Object {
        "rules": Object {
          "properties": Object {
            "foo": Object {
              "properties": Object {
                "active": Object {
                  "default": true,
                  "type": "boolean",
                },
              },
              "required": Array [
                "active",
              ],
              "type": "object",
            },
          },
          "type": "object",
        },
      },
      "type": "object",
    }
    `)
  })

  test('builds configuration schema exclusing inactive rules', (): void => {
    const assistant = createAssistantDefinition({
      rules: [createRule({ name: 'foo' })],
      config: createAssistantConfig({
        rules: {},
      }),
    })

    expect(buildAssistantConfigSchema(assistant)).toMatchInlineSnapshot(`
    Object {
      "properties": Object {
        "rules": Object {
          "properties": Object {},
          "type": "object",
        },
      },
      "type": "object",
    }
    `)
  })

  test('use integer option config value as default', (): void => {
    const assistant = createAssistantDefinition({
      rules: [
        createRule({
          name: 'foo',
          getOptions: (helpers) => [
            helpers.integerOption({
              name: 'option',
              title: 'integer option',
              description: 'some detail',
            }),
          ],
        }),
      ],
      config: createAssistantConfig({
        rules: {
          foo: { active: true, option: 1 },
        },
      }),
    })

    expect(buildAssistantConfigSchema(assistant)).toMatchInlineSnapshot(`
    Object {
      "properties": Object {
        "rules": Object {
          "properties": Object {
            "foo": Object {
              "properties": Object {
                "active": Object {
                  "default": true,
                  "type": "boolean",
                },
                "option": Object {
                  "default": 1,
                  "description": "some detail",
                  "title": "integer option",
                  "type": "integer",
                },
              },
              "required": Array [
                "active",
                "option",
              ],
              "type": "object",
            },
          },
          "type": "object",
        },
      },
      "type": "object",
    }
    `)
  })

  test('use number option config value as default', (): void => {
    const assistant = createAssistantDefinition({
      rules: [
        createRule({
          name: 'foo',
          getOptions: (helpers) => [
            helpers.numberOption({
              name: 'option',
              title: 'number option',
              description: 'some detail',
            }),
          ],
        }),
      ],
      config: createAssistantConfig({
        rules: {
          foo: { active: true, option: 1.5 },
        },
      }),
    })

    expect(buildAssistantConfigSchema(assistant)).toMatchInlineSnapshot(`
      Object {
        "properties": Object {
          "rules": Object {
            "properties": Object {
              "foo": Object {
                "properties": Object {
                  "active": Object {
                    "default": true,
                    "type": "boolean",
                  },
                  "option": Object {
                    "default": 1.5,
                    "description": "some detail",
                    "title": "number option",
                    "type": "number",
                  },
                },
                "required": Array [
                  "active",
                  "option",
                ],
                "type": "object",
              },
            },
            "type": "object",
          },
        },
        "type": "object",
      }
      `)
  })

  test('use string option config value as default', (): void => {
    const assistant = createAssistantDefinition({
      rules: [
        createRule({
          name: 'foo',
          getOptions: (helpers) => [
            helpers.stringOption({
              name: 'option',
              title: 'string option',
              description: 'some detail',
            }),
          ],
        }),
      ],
      config: createAssistantConfig({
        rules: {
          foo: { active: true, option: 'hello world' },
        },
      }),
    })

    expect(buildAssistantConfigSchema(assistant)).toMatchInlineSnapshot(`
      Object {
        "properties": Object {
          "rules": Object {
            "properties": Object {
              "foo": Object {
                "properties": Object {
                  "active": Object {
                    "default": true,
                    "type": "boolean",
                  },
                  "option": Object {
                    "default": "hello world",
                    "description": "some detail",
                    "title": "string option",
                    "type": "string",
                  },
                },
                "required": Array [
                  "active",
                  "option",
                ],
                "type": "object",
              },
            },
            "type": "object",
          },
        },
        "type": "object",
      }
      `)
  })
})

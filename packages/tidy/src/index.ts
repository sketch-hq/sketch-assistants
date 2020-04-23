import type { Assistant } from '@sketch-hq/sketch-assistant-types'

const assistant: Assistant = async () => {
  return {
    name: '@sketch-hq/sketch-tidy-assistant',
    rules: [
      {
        rule: async (context) => {
          context.utils.report({
            message: 'Hello world',
          })
        },
        name: '@sketch-hq/sketch-tidy-assistant/hello-world',
        title: 'Hello World',
        description: 'Emits a violation with a hello world message',
      },
    ],
    config: {
      rules: {
        '@sketch-hq/sketch-tidy-assistant/hello-world': { active: true },
      },
    },
  }
}

export default assistant

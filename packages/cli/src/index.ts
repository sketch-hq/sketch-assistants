import meow from 'meow'
import { resolve, basename } from 'path'
import { promisify } from 'util'
import * as cp from 'child_process'
import chalk from 'chalk'
import globby from 'globby'
import * as fs from 'fs'
import os from 'os'
import ora from 'ora'
import Conf from 'conf'
import {
  fromFile,
  runMultipleAssistants,
  getImageMetadata,
  process as processFile,
} from '@sketch-hq/sketch-assistant-utils'
import {
  FileFormat,
  AssistantRuntime,
  RunOutput,
  AssistantPackageMap,
  ViolationSeverity,
  SketchFile,
  AssistantConfig,
} from '@sketch-hq/sketch-assistant-types'
import crypto from 'crypto'
import osLocale from 'os-locale'

const helpText = `
  Usage

    Run a Sketch file's Assistants.

      sketch-assistants "./path/to/file.sketch"
    
    Or run multiple files:
    
      sketch-assistants "./path/to/file-1.sketch" "./path/to/file-2.sketch"
    
    Or use globs to run all Sketch files that match a pattern:
    
      sketch-assistants "./**/*.sketch"

  Flags

    --json
      
      Switch from human-readable output to JSON. Example:

        sketch-assistants --json "./path/to/file.sketch"
    
    --clear-cache

      When Assistants are installed before a run, they are cached in a temporary
      folder to make future runs faster. Pass this flag to delete the cache
      folder.

    --workspace

      Optionally supply and overwrite the Assistant workspace configuration
      within the Sketch file(s) with your own. This can be useful for running
      Assistants against a file that haven't yet been setup with Assistants in
      the Sketch app.
      
      Example:

        sketch-assistants --workspace=./workspace.json "./path/to/file.sketch"
      
      The data shape of the workspace itself is essentially a package.json,
      with the dependencies section indicating the active Assistants. The
      workspace JSON example below activates two Assistants:

        {
          "dependencies": {
            "@sketch-hq/sketch-tidy-assistant": "latest",
            "@sketch-hq/sketch-naming-conventions-assistant": "latest"
          }
        }
    
    --assistant

      Optionally supply a custom Assistant to use on the files. This is an
      Assistant defined entirely in JSON. Assistants to extend, as well as a
      custom configuration of object can be supplied.

        sketch-assistants --assistant=./assistant.json "./path/to/file.sketch"
      
      Example Assistant definition in JSON:

        {
          "name": "max-3",
          "dependencies": {
            "@sketch-hq/sketch-core-assistant": "latest"
          },
          "assistant": {
            "extends": ["@sketch-hq/sketch-core-assistant"],
            "config": {
              "rules": {
                "@sketch-hq/sketch-core-assistant/groups-max-layers": {
                  "active": true,
                  "maxLayers": 3,
                  "skipClasses": []
                }
              }
            }
          }
        }
`

/**
 * Results from the CLI combine a target Sketch file, a result code and a RunOutput object.
 * Codes have the following meanings:
 *
 *   "error":   Something went wrong running the file, and there are no results to display.
 *   "success": One or more of the Assistants in the file ran successfully and have results to display.
 */
type CliResults = Array<
  | { filepath: string; code: 'error'; message: string }
  | { filepath: string; code: 'success'; output: RunOutput }
>

/**
 * Type alias to the Assistant workspace shape. This defines the shape of the
 * JSON optionally passed in via the `--workspace` option.
 */
type Workspace = FileFormat.AssistantsWorkspace

/**
 * Describe a custom Assistant using JSON. This defines the shape of the JSON
 * optionally passed in via the `--assistant` option.
 */
type WorkspaceWithAssistant = Workspace & {
  name: string
  assistant: {
    extends: string[]
    config?: AssistantConfig
  }
}

const cli = meow(helpText, {
  flags: {
    json: {
      type: 'boolean',
      default: false,
    },
    clearCache: {
      type: 'boolean',
      default: false,
    },
    config: {
      type: 'string',
      default: '',
    },
    workspace: {
      type: 'string',
      default: '',
    },
    assistant: {
      type: 'string',
      default: '',
    },
  },
})

const settings = new Conf()
const exec = promisify(cp.exec)
const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * Return the path to a usable temporary directory that remains consistent between cli runs.
 */
const getTmpDirPath = () => {
  const dir = settings.has('dir') ? settings.get('dir') : fs.realpathSync(os.tmpdir())
  settings.set('dir', dir)
  return `${dir}/sketch-assistants`
}

/**
 * Exit the process with a reason and a non-zero exit code.
 */
const failWithReason = (reason: string) => {
  console.error(chalk.red(`Failed: ${reason}`))
  process.exit(1)
}

/**
 * Format a spinner progress message.
 */
const spinnerMessage = (filename: string, message: string) =>
  `${chalk.gray(`${filename}:`)} ${message}`

/**
 * Require Assistants for a given workspace. That is, resolve their names to
 * their actual package export values.
 */
const requireAssistants = (dir: string, workspace: Workspace): AssistantPackageMap =>
  Object.keys(workspace.dependencies).reduce<AssistantPackageMap>(
    (assistantGroup, pkgName) => ({
      [pkgName]: require(`${dir}/node_modules/${pkgName}`),
      ...assistantGroup,
    }),
    {},
  )

/**
 * Install a set of Assistants to a temporary working directory.
 */
const installWorkspace = async (dir: string, workspace: Workspace): Promise<void> => {
  await exec(`rm -rf ${dir}`)
  await exec(`mkdir -p ${dir}`)
  await exec('npm init --yes', { cwd: dir })

  const pkg = {
    ...JSON.parse(await readFile(`${dir}/package.json`, { encoding: 'utf8' })),
    ...workspace,
  }

  await writeFile(`${dir}/package.json`, JSON.stringify(pkg, null, 2), {
    encoding: 'utf8',
  })

  await exec(`npm install --no-scripts --prefix=${dir}`)
}

/**
 * Create a custom Assistant based on a WorkspaceWithAssistant value.
 */
const makeAssistant = async (
  dir: string,
  workspace: WorkspaceWithAssistant,
): Promise<AssistantPackageMap> => {
  const assistants = await requireAssistants(dir, workspace)
  const assistantName = `custom/${workspace.name}`
  // @ts-ignore TODO: This code is working, but there's a type error, presumably caused by
  // the complexity of the AssistantPackageExport type.
  return {
    [assistantName]: [
      ...workspace.assistant.extends.map((assistantName) => assistants[assistantName]),
      async () => ({
        name: assistantName,
        rules: [],
        config: workspace.assistant.config ? workspace.assistant.config : { rules: {} },
      }),
    ],
  }
}

/**
 * Format results as a human readable string.
 */
const formatResults = (cliResults: CliResults): string => {
  let formatted = ''

  const append = (indent: number = 0, s: string = ''): string => {
    formatted += `${Array(indent).fill(' ').join('')}${s}\n`
    return formatted
  }

  const severityColors = {
    [ViolationSeverity.info]: chalk.blue,
    [ViolationSeverity.warn]: chalk.yellow,
    [ViolationSeverity.error]: chalk.red,
  }

  append()

  for (const cliResult of cliResults) {
    append(0, `File: ${chalk.grey(cliResult.filepath)}\n`)
    if (cliResult.code === 'error') {
      append(2, chalk.red(cliResult.message))
      continue
    }
    for (const [name, res] of Object.entries(cliResult.output)) {
      if (res.code === 'error') {
        append(2, `${name}: ${chalk.red(res.result.message)}`)
        continue
      }
      append(2, `${chalk.inverse(` ${name} `)}\n`)
      append(4, `Grade: ${res.result.passed ? chalk.green('pass') : chalk.red('fail')}`)
      append(4, `Violations: ${res.result.violations.length}`)
      append(4, `Rule errors: ${res.result.ruleErrors.length}\n`)

      for (const violation of res.result.violations) {
        const rule = res.result.metadata.rules[violation.ruleName]
        append(4, `${severityColors[violation.severity](rule.title)}`)
        append(6, `Detail: ${chalk.grey(violation.message)}`)
        append(6, `Severity: ${chalk.grey(ViolationSeverity[violation.severity])}`)
        append(6, `Rule: ${chalk.grey(violation.ruleName)}`)
        if (violation.objectName) append(6, `Layer: ${chalk.grey(violation.objectName)}`)
        if (violation.pointer) append(6, `Location: ${chalk.grey(violation.pointer)}`)
        if (violation.objectId) append(6, `Object: ${chalk.grey(violation.objectId)}`)
        append()
      }

      for (const error of res.result.ruleErrors) {
        const rule = res.result.metadata.rules[error.ruleName]
        append(4, `${chalk.red(rule.title)}`)
        append(6, `Error: ${chalk.red(error.message)}`)
        append()
      }
    }
  }

  return formatted
}

/**
 * Return the Assistant workspace to use for the current file run.
 */
const getWorkspace = async (file: SketchFile): Promise<Workspace> => {
  if (cli.flags.workspace) {
    return JSON.parse(await readFile(resolve(cli.flags.workspace), { encoding: 'utf8' }))
  }

  if (cli.flags.assistant) {
    return JSON.parse(await readFile(resolve(cli.flags.assistant), { encoding: 'utf8' }))
  }

  if (!file.contents.workspace?.assistants) {
    throw Error('No Assistant workspace found for run')
  }
  return file.contents.workspace.assistants
}

/**
 * Run Assistants on a Sketch file.
 */
const runFile = async (filepath: string, tmpDir: string): Promise<RunOutput> => {
  const filename = basename(filepath)

  const spinner = ora({
    stream: cli.flags.json ? fs.createWriteStream('/dev/null') : process.stdout,
  })

  spinner.start(spinnerMessage(filename, ''))
  spinner.start(spinnerMessage(filename, 'Processing file…'))

  try {
    const file = await fromFile(filepath)
    const operation = { cancelled: false }
    const processedFile = await processFile(file, operation)
    const env = {
      runtime: AssistantRuntime.Node,
      locale: await osLocale(),
    }

    const workspace = await getWorkspace(file)
    const workspaceHash = crypto.createHash('md5').update(JSON.stringify(workspace)).digest('hex')
    const dir = resolve(`${tmpDir}`, workspaceHash)

    spinner.start(spinnerMessage(filename, 'Installing workspace…'))

    if (!(await exists(dir))) {
      await installWorkspace(dir, workspace)
    }

    const assistants = cli.flags.assistant
      ? await makeAssistant(dir, workspace as WorkspaceWithAssistant)
      : await requireAssistants(dir, workspace)

    spinner.start(spinnerMessage(filename, 'Running Assistants…'))

    const output = await runMultipleAssistants({
      assistants,
      processedFile,
      getImageMetadata,
      operation,
      env,
    })

    spinner.succeed(spinnerMessage(filename, 'Ready'))
    return output
  } catch (err) {
    spinner.fail(spinnerMessage(filename, err.message))
    throw err
  }
}

/**
 * Main entrypoint function for the CLI.
 */
const main = async () => {
  const tmpDir = getTmpDirPath()

  if (cli.flags.clearCache) {
    await exec(`rm -rf ${tmpDir}`)
    console.log(`Cache directory deleted: ${tmpDir}`)
    return
  }

  if (cli.input.length === 0) {
    failWithReason('No input supplied to cli')
  }

  const paths: string[] = cli.input
    .map((value) => globby.sync(value))
    .flat()
    .map((value) => resolve(value))
    .filter((value) => fs.existsSync(value))

  if (paths.length === 0) {
    failWithReason("Couldn't find the input Sketch file(s) on disk")
  }

  const results: CliResults = []

  for (const filepath of paths) {
    try {
      results.push({
        filepath,
        code: 'success',
        output: await runFile(filepath, tmpDir),
      })
    } catch (err) {
      results.push({
        filepath,
        code: 'error',
        message: `${err.message}`,
      })
    }
  }

  if (cli.flags.json) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    console.log(formatResults(results))
  }

  // TODO: Need think about what failure means? Does it mean no Assistants ran,
  // or some Assistants ran but didn't pass? Or something else? Maybe needs to
  // be customisable ...
  const success = results.findIndex((result) => result.code === 'error') === -1
  process.exit(success ? 0 : 1)
}

main()

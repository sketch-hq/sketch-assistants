# sketch-assistant-cli

Sketch Assistants Node command-line utility.

You can use this utility to run Assistants against Sketch files outside of Sketch.

It can run whichever Assistants have been added to the file by Sketch, or run a custom set of
Assistants passed in on the command line.

## Installation

Until this package is published to npm the only way to invoke it is by building it from source and
invoking it directly.

In this folder:

```
yarn build
./bin/cli.js <args>
```

TODO: Update this section once this package is published to npm.

## Usage

Run a Sketch file's configured Assistants.

```sh
sketch-assistants "./path/to/file.sketch"
```

Run multiple files:

```sh
sketch-assistants "./path/to/file-1.sketch" "./path/to/file-2.sketch"
```

Or use globs to run all Sketch files that match a pattern:

```sh
sketch-assistants "./**/*.sketch"
```

### Flags

#### `--json`

Switch from human-readable output to JSON. Example:

```sh
sketch-assistants --json "./path/to/file.sketch"
```

#### `--clear-cache`

When Assistants are installed before a run, they are cached in a temporary folder to make future
runs faster. Pass this flag to delete the cache folder.

#### `--workspace`

Optionally supply and overwrite the Assistant workspace configuration within the Sketch file(s) with
your own. This can be useful for running Assistants against a file that haven't yet been setup with
Assistants in the Sketch app.

```sh
sketch-assistants --workspace=./workspace.json "./path/to/file.sketch"
```

The data shape of the workspace itself is essentially a package.json, with the dependencies section
indicating the active Assistants. The workspace JSON example below activates two Assistants:

```json
{
  "dependencies": {
    "@sketch-hq/sketch-tidy-assistant": "latest",
    "@sketch-hq/sketch-naming-conventions-assistant": "latest"
  }
}
```

#### `--assistant`

Optionally supply a custom Assistant to use on the files. This is an Assistant defined entirely in
JSON. Assistants to extend, as well as a custom configuration of object can be supplied.

```sh
sketch-assistants --assistant=./assistant.json "./path/to/file.sketch"
```

Example Assistant definition in JSON:

```json
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
```

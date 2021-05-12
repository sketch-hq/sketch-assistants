# @sketch-hq/sketch-assistant-cli

## 6.4.0-rc.0

### Minor Changes

- dd91ad8: Updated dependencies
- c857d5c: Updated dependencies

### Patch Changes

- 80e6f01: Updated dependencies, including migration to `@sketch-hq/sketch-file`
- Updated dependencies [dd91ad8]
- Updated dependencies [80e6f01]
- Updated dependencies [c857d5c]
  - @sketch-hq/sketch-assistant-types@6.4.0-rc.0
  - @sketch-hq/sketch-assistant-utils@6.4.0-rc.0

## 6.3.1

### Patch Changes

- d58e849: Updated various package dependencies.
- Updated dependencies [d58e849]
  - @sketch-hq/sketch-assistant-types@6.3.1
  - @sketch-hq/sketch-assistant-utils@6.3.1

## 6.3.0

### Minor Changes

- 77b71de: Fix the Sketch file JSON being mirrored into CLI results potentially causing
  out-of-memory errors.
- 77b71de: Removed the `--profile` flag, profiling data is now always included in the output when
  the `--json` flag is used.

## 6.0.0

### Major Changes

- f8a0829: Support for reporting violations that reference multiple Sketch file objects.
- 81a6e61: Add timeouts to rules.
- 0b479bc: Refactored violation `locations` to `objects` and added a `class` value.

### Patch Changes

- 0aff579: Fix build error.
- Updated dependencies [f8a0829]
- Updated dependencies [81a6e61]
- Updated dependencies [f155f44]
- Updated dependencies [0b479bc]
  - @sketch-hq/sketch-assistant-types@6.0.0
  - @sketch-hq/sketch-assistant-utils@6.0.0

## 6.0.0-rc.2

### Patch Changes

- 0aff579: Fix build error.

## 6.0.0-rc.1

### Major Changes

- 0b479bc: Refactored violation `locations` to `objects` and added a `class` value.

### Patch Changes

- Updated dependencies [0b479bc]
  - @sketch-hq/sketch-assistant-types@6.0.0-rc.1
  - @sketch-hq/sketch-assistant-utils@6.0.0-rc.1

## 6.0.0-rc.0

### Major Changes

- f8a0829: Support for reporting violations that reference multiple Sketch file objects.
- 81a6e61: Add timeouts to rules.

### Patch Changes

- Updated dependencies [f8a0829]
- Updated dependencies [81a6e61]
- Updated dependencies [f155f44]
  - @sketch-hq/sketch-assistant-types@6.0.0-rc.0
  - @sketch-hq/sketch-assistant-utils@6.0.0-rc.0

## 5.0.0

### Major Changes

- e76fabd: Introduction of the Assistants CLI.
- 2f6f82b: Changed the `RunOutput` type so its shape is more consistent when an Assistant outputs an
  error or a result. This is so that it plays nicely with Swift Codable, which has trouble decoding
  JSON derived from TypeScript discriminated unions.

### Minor Changes

- 974a5e4: Add a `--profile` flag for outputting basic statistics about the run instead of results.
- 8351103: Add rule timings to profile data.
- c802b6b: Support an ignore config in the Assistants workspace.

### Patch Changes

- 67f62f2: Changes to profile data format.
- 06c0612: Export ignore pruning functions properly.
- a004097: Update to latest file format and remove some @ts-ignore directives.
- Updated dependencies [8351103]
- Updated dependencies [67f62f2]
- Updated dependencies [1bcbce7]
- Updated dependencies [a2a4585]
- Updated dependencies [c802b6b]
- Updated dependencies [373503d]
- Updated dependencies [21de31c]
- Updated dependencies [06c0612]
- Updated dependencies [a004097]
- Updated dependencies [e76fabd]
- Updated dependencies [a3b25f5]
- Updated dependencies [2f6f82b]
- Updated dependencies [6733a97]
- Updated dependencies [bc13811]
  - @sketch-hq/sketch-assistant-types@5.0.0
  - @sketch-hq/sketch-assistant-utils@5.0.0

## 5.0.0-next.22

### Patch Changes

- Updated dependencies [1bcbce7]
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.22

## 5.0.0-next.21

### Patch Changes

- Updated dependencies [373503d]
- Updated dependencies [21de31c]
- Updated dependencies [a3b25f5]
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.21
  - @sketch-hq/sketch-assistant-types@5.0.0-next.21

## 5.0.0-next.20

### Patch Changes

- 06c0612: Export ignore pruning functions properly.
- Updated dependencies [06c0612]
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.20

## 5.0.0-next.19

### Minor Changes

- c802b6b: Support an ignore config in the Assistants workspace.

### Patch Changes

- a004097: Update to latest file format and remove some @ts-ignore directives.
- Updated dependencies [c802b6b]
- Updated dependencies [a004097]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.19
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.19

## 5.0.0-next.18

### Major Changes

- 2f6f82b: Changed the `RunOutput` type so its shape is more consistent when an Assistant outputs an
  error or a result. This is so that it plays nicely with Swift Codable, which has trouble decoding
  JSON derived from TypeScript discriminated unions.

### Patch Changes

- Updated dependencies [2f6f82b]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.18
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.18

## 5.0.0-next.17

### Patch Changes

- 67f62f2: Changes to profile data format.
- Updated dependencies [67f62f2]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.17
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.17

## 5.0.0-next.16

### Minor Changes

- 974a5e4: Add a `--profile` flag for outputting basic statistics about the run instead of results.
- 8351103: Add rule timings to profile data.

### Patch Changes

- Updated dependencies [8351103]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.16
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.16

## 5.0.0-next.15

### Major Changes

- e76fabd: Introduction of the Assistants CLI.

### Patch Changes

- Updated dependencies [e76fabd]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.15
  - @sketch-hq/sketch-assistant-utils@5.0.0-next.15

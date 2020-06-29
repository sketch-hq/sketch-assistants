# @sketch-hq/sketch-assistant-utils

## 5.0.0

### Major Changes

- e76fabd: Introduction of the Assistants CLI.
- 2f6f82b: Changed the `RunOutput` type so its shape is more consistent when an Assistant outputs an
  error or a result. This is so that it plays nicely with Swift Codable, which has trouble decoding
  JSON derived from TypeScript discriminated unions.
- 6733a97: Numerous refactors around Sketch file object iteration.

### Minor Changes

- 8351103: Add rule timings to profile data.
- c802b6b: Support an ignore config in the Assistants workspace.

### Patch Changes

- 67f62f2: Changes to profile data format.
- 1bcbce7: Do not include unconfigured rules in result metadata.
- a2a4585: Do not throw an error when processing a Sketch file and encountering an unknown object
  `_class` value.
- 373503d: Raise a rule error if a rule attempts to report an ignored object.
- 21de31c: Allow `allObjects` and `objects` to be set at the same time in an ignore config.
- 06c0612: Export ignore pruning functions properly.
- a004097: Update to latest file format and remove some @ts-ignore directives.
- a3b25f5: Include metadata for all rules in Assistant run result, even if they weren't active in
  the run.
- bc13811: Initial release in monorepo.
- Updated dependencies [8351103]
- Updated dependencies [67f62f2]
- Updated dependencies [c802b6b]
- Updated dependencies [21de31c]
- Updated dependencies [a004097]
- Updated dependencies [e76fabd]
- Updated dependencies [2f6f82b]
- Updated dependencies [6733a97]
- Updated dependencies [bc13811]
  - @sketch-hq/sketch-assistant-types@5.0.0

## 5.0.0-next.22

### Patch Changes

- 1bcbce7: Do not include unconfigured rules in result metadata.

## 5.0.0-next.21

### Patch Changes

- 373503d: Raise a rule error if a rule attempts to report an ignored object.
- 21de31c: Allow `allObjects` and `objects` to be set at the same time in an ignore config.
- a3b25f5: Include metadata for all rules in Assistant run result, even if they weren't active in
  the run.
- Updated dependencies [21de31c]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.21

## 5.0.0-next.20

### Patch Changes

- 06c0612: Export ignore pruning functions properly.

## 5.0.0-next.19

### Minor Changes

- c802b6b: Support an ignore config in the Assistants workspace.

### Patch Changes

- a004097: Update to latest file format and remove some @ts-ignore directives.
- Updated dependencies [c802b6b]
- Updated dependencies [a004097]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.19

## 5.0.0-next.18

### Major Changes

- 2f6f82b: Changed the `RunOutput` type so its shape is more consistent when an Assistant outputs an
  error or a result. This is so that it plays nicely with Swift Codable, which has trouble decoding
  JSON derived from TypeScript discriminated unions.

### Patch Changes

- Updated dependencies [2f6f82b]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.18

## 5.0.0-next.17

### Patch Changes

- 67f62f2: Changes to profile data format.
- Updated dependencies [67f62f2]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.17

## 5.0.0-next.16

### Minor Changes

- 8351103: Add rule timings to profile data.

### Patch Changes

- Updated dependencies [8351103]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.16

## 5.0.0-next.15

### Major Changes

- e76fabd: Introduction of the Assistants CLI.

### Patch Changes

- Updated dependencies [e76fabd]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.15

## 5.0.0-next.14

### Patch Changes

- a2a4585: Do not throw an error when processing a Sketch file and encountering an unknown object
  `_class` value.

## 5.0.0-next.11

### Major Changes

- 6733a97: Numerous refactors around Sketch file object iteration.

### Patch Changes

- Updated dependencies [6733a97]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.11

## 4.0.1-next.8

### Patch Changes

- bc13811: Initial release in monorepo.
- Updated dependencies [bc13811]
  - @sketch-hq/sketch-assistant-types@4.0.1-next.8

# @sketch-hq/sketch-assistant-types

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
- 21de31c: Allow `allObjects` and `objects` to be set at the same time in an ignore config.
- a004097: Update to latest file format and remove some @ts-ignore directives.
- bc13811: Initial release in monorepo.

## 5.0.0-next.21

### Patch Changes

- 21de31c: Allow `allObjects` and `objects` to be set at the same time in an ignore config.

## 5.0.0-next.19

### Minor Changes

- c802b6b: Support an ignore config in the Assistants workspace.

### Patch Changes

- a004097: Update to latest file format and remove some @ts-ignore directives.

## 5.0.0-next.18

### Major Changes

- 2f6f82b: Changed the `RunOutput` type so its shape is more consistent when an Assistant outputs an
  error or a result. This is so that it plays nicely with Swift Codable, which has trouble decoding
  JSON derived from TypeScript discriminated unions.

## 5.0.0-next.17

### Patch Changes

- 67f62f2: Changes to profile data format.

## 5.0.0-next.16

### Minor Changes

- 8351103: Add rule timings to profile data.

## 5.0.0-next.15

### Major Changes

- e76fabd: Introduction of the Assistants CLI.

## 5.0.0-next.11

### Major Changes

- 6733a97: Numerous refactors around Sketch file object iteration.

## 4.0.1-next.8

### Patch Changes

- bc13811: Initial release in monorepo.

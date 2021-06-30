# @sketch-hq/sketch-core-assistant

## 6.5.0

### Patch Changes

- 9ee7d59: Updated dependencies
- Updated dependencies [54a3ab9]
  - @sketch-hq/sketch-assistant-types@6.5.0

## 6.4.0

### Minor Changes

- dd91ad8: Updated dependencies
- c857d5c: Updated dependencies

### Patch Changes

- 99636c6: Update Chinese localisation
- Updated dependencies [dd91ad8]
- Updated dependencies [80e6f01]
- Updated dependencies [c857d5c]
  - @sketch-hq/sketch-assistant-types@6.4.0

## 6.4.0-rc.0

### Minor Changes

- dd91ad8: Updated dependencies
- c857d5c: Updated dependencies

### Patch Changes

- Updated dependencies [dd91ad8]
- Updated dependencies [80e6f01]
- Updated dependencies [c857d5c]
  - @sketch-hq/sketch-assistant-types@6.4.0-rc.0

## 6.3.2

### Patch Changes

- 217953f: No longer report violation of `layer-styles-prefer-shared` rule for images with default
  layer style

## 6.3.1

### Patch Changes

- d58e849: Updated various package dependencies.
- Updated dependencies [d58e849]
  - @sketch-hq/sketch-assistant-types@6.3.1

## 6.2.0

### Minor Changes

- 9b55837: Added rule `colors-prefer-variable` to the Core Assistant.

### Patch Changes

- 01c1fd8: Do not count disabled background colors and styles in `colors-prefer-variable` rule.
- 01c1fd8: Improve display of alpha values in `color-prefer-variable` rule.

## 6.1.0

### Minor Changes

- e9e06af: Reworked all three `*-prefer-library` rules to `*-allowed-libraries` rules.

### Patch Changes

- 0ea0381: Improve wording of groups-max-layers rule title.
- e2264d2: Add Chinese localisation for recently added rule strings.

## 6.0.0

### Major Changes

- f8a0829: Support for reporting violations that reference multiple Sketch file objects.
- 81a6e61: Add timeouts to rules.
- 0b479bc: Refactored violation `locations` to `objects` and added a `class` value.

### Patch Changes

- 532eef0: Add manual ignore check in `layers-no-loose` rule.
- 1c36951: Finalised translations.
- Updated dependencies [f8a0829]
- Updated dependencies [81a6e61]
- Updated dependencies [f155f44]
- Updated dependencies [0b479bc]
  - @sketch-hq/sketch-assistant-types@6.0.0

## 6.0.0-rc.1

### Major Changes

- 0b479bc: Refactored violation `locations` to `objects` and added a `class` value.

### Patch Changes

- Updated dependencies [0b479bc]
  - @sketch-hq/sketch-assistant-types@6.0.0-rc.1

## 6.0.0-rc.0

### Major Changes

- f8a0829: Support for reporting violations that reference multiple Sketch file objects.
- 81a6e61: Add timeouts to rules.

### Patch Changes

- 532eef0: Add manual ignore check in `layers-no-loose` rule.
- 1c36951: Finalised translations.
- Updated dependencies [f8a0829]
- Updated dependencies [81a6e61]
- Updated dependencies [f155f44]
  - @sketch-hq/sketch-assistant-types@6.0.0-rc.0

## 5.0.0

### Major Changes

- 6733a97: Numerous refactors around Sketch file object iteration.
- e76fabd: Introduction of the Assistants CLI.

### Minor Changes

- 76c8ded: Add the `symbols-no-detached` rule.

### Patch Changes

- c4615bc: Update rule copy
- 1698a52: Fix rule title copy in `text-styles-prefer-shared`.
- 1c388d9: Add core rules to monorepo.
- 7a54cbb: Count symbols set as override values as used in `symbols-no-unused`.
- 04b71a6: Fix `groups-no-empty` flagging an empty document.
- caba0e1: Do not raise violations from the `exported-layers-normal-blend-mode` rule when the layer
  is only to be exported as some kind of bitmap-based export format.
- 0688585: Report loose layers, not the parent page in the the `layers-no-loose` rule.
- 581554d: Fix a bug where violation objects weren't passed correctly.
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

## 5.0.0-next.21

### Patch Changes

- Updated dependencies [21de31c]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.21

## 5.0.0-next.20

## 5.0.0-next.19

### Patch Changes

- 04b71a6: Fix `groups-no-empty` flagging an empty document.
- Updated dependencies [c802b6b]
- Updated dependencies [a004097]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.19

## 5.0.0-next.18

### Patch Changes

- Updated dependencies [2f6f82b]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.18

## 5.0.0-next.17

### Patch Changes

- c4615bc: Update rule copy
- Updated dependencies [67f62f2]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.17

## 5.0.0-next.16

### Minor Changes

- 76c8ded: Add the `symbols-no-detached` rule.

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

## 5.0.0-next.13

### Patch Changes

- 1698a52: Fix rule title copy in `text-styles-prefer-shared`.
- 7a54cbb: Count symbols set as override values as used in `symbols-no-unused`.
- caba0e1: Do not raise violations from the `exported-layers-normal-blend-mode` rule when the layer
  is only to be exported as some kind of bitmap-based export format.
- 0688585: Report loose layers, not the parent page in the the `layers-no-loose` rule.

## 5.0.0-next.12

### Patch Changes

- 581554d: Fix a bug where violation objects weren't passed correctly.

## 5.0.0-next.11

### Major Changes

- 6733a97: Numerous refactors around Sketch file object iteration.

### Patch Changes

- Updated dependencies [6733a97]
  - @sketch-hq/sketch-assistant-types@5.0.0-next.11

## 5.0.0-next.10

### Patch Changes

- 1c388d9: Add core rules to monorepo.

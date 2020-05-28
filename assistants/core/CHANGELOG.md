# @sketch-hq/sketch-core-assistant

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

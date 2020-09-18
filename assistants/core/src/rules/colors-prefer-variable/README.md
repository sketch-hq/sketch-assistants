# colors-prefer-variable

Identical colors are considered violations.

## Rationale

Teams may wish to enforce the usage of color variables within a document, and the usage of identical
colors represent an opportunity to refactor them to use a single color variable instead.

## Options

### `maxIdentical: number`

Maximum number of identical colors allowable in the document.

## Example configuration

```js
{
  "active": true,
  "maxIdentical": 2 // Only trigger a violation when the same color is
}                   // seen 3 or more times in the same document
```

```js
{
  "active": true,
  "maxIdentical": 0 // No colors may be identical, effectively enforces
                    // color variable usage everywhere
```

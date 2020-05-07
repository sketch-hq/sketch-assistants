# layer-styles-prefer-shared

Identical layer styles are considered violations.

## Rationale

Teams may wish to enforce the usage of shared styles within a document, and the presence of
identical layer styles represent an opportunity to refactor them to use a single shared style.

## Options

### `maxIdentical: number`

Maximum number of identical layer styles allowable in the document.

## Example configuration

```js
{
  "active": true,
  "maxIdentical": 2 // Only trigger a violation when the same layer style is
}                   // seen 3 or more times in the same document
```

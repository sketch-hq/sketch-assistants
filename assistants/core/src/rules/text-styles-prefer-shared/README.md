# text-styles-prefer-shared

Identical text styles are considered violations.

## Rationale

Teams may wish to enforce the usage of shared text styles within a document, and the presence of
identical text styles represent an opportunity to refactor them to use a single text shared style.

## Options

### `maxIdentical: number`

Maximum number of identical text styles allowable in the document.

## Example configuration

```js
{
  "active": true,
  "maxIdentical": 2 // Only trigger a violation when the same text style is
}                   // seen 3 or more times in the same document
```

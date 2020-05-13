# groups-no-similar

Similar groups are considered a violations.

## Rationale

Similar groups can represent an opportunity to refactor them into a symbol.

## Options

### `maxIdentical: number`

Maximum number of identical groups allowable in the document.

## Example configuration

```js
{
  "active": true,
  "maxIdentical": 2 // Only trigger a violation when there are at least 3 identical groups
}
```

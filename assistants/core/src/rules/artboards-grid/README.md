# artboards-grid

Specify a list of valid artboard grid settings. Any artboard without a grid setting, or with a grid
setting not present in the list, results in a violation.

## Rationale

Enforce the consistent and precise usage of specific grid settings across a document, team or
project.

## Options

### `grids`

Array of valid grid settings objects, each with the following shape:

- `gridBlockSize: number`
- `thickLinesEvery: number`

## Example configuration

```js
{
  "active": true,
  "grids": [
    { "gridBlockSize": 5, "thickLinesEvery": 10 },
    { "gridBlockSize": 10, "thickLinesEvery": 20 }
  ]
}
```

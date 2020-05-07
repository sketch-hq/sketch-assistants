# artboards-layout

Specify a list of valid artboard layout settings. Any artboard without a layout setting, or with a
layout setting not present in the list, results in a violation.

## Rationale

Enforce the consistent and precise usage of specific layout settings across a document, team or
project.

## Options

### `layouts: {}[]`

Array of valid layout settings objects, each with the following shape:

- `columnWidth: number`
- `drawHorizontal: boolean`
- `drawHorizontalLines: boolean`
- `drawVertical: boolean`
- `gutterHeight: number`
- `gutterWidth: number`
- `guttersOutside: number`
- `horizontalOffset: number`
- `numberOfColumns: number`
- `rowHeightMultiplication: number`
- `totalWidth: number`

## Example configuration

```js
{
  "active": true,
  "layouts": [
    {
      "columnWidth": 10,
      "drawHorizontal": true,
      "drawHorizontalLines": true,
      "drawVertical": true,
      "gutterHeight": 10,
      "gutterWidth": 10,
      "guttersOutside": true,
      "horizontalOffset": 0,
      "numberOfColumns": 10,
      "rowHeightMultiplication": 5,
      "totalWidth": 200
    }
  ]
}
```

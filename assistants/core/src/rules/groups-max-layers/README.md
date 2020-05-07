# groups-max-layers

Groups with a layer count that exceeds the configured value will generate violations.

## Rationale

Groups with large layer counts could be considered a document hygiene or usability concern by some
teams who may wish to limit the count.

## Options

### `maxLayers: number`

Maximum number of child layers within a group.

### `skipClasses: string[]`

An array of Sketch file object classes that shouldn't be considered when counting a group's layers.

## Example configuration

```js
{
  "active": true,
  "maxLayers": 50,
  "skipClasses": ["artboards"] // Skips counting artboads on page objects
}
```

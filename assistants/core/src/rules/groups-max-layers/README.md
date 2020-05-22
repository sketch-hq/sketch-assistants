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
The values used should be the value of the `_class` properties found in the Sketch File Format, e.g
`artboard` for
[Artboards](https://github.com/sketch-hq/sketch-file-format/blob/661d4d917c9dcfa1beb685cb29c48284b7ddb82d/schema/layers/artboard.schema.yaml#L13).

## Example configuration

```js
{
  "active": true,
  "maxLayers": 50,
  "skipClasses": ["artboard"] // Skips counting artboads on page objects
}
```

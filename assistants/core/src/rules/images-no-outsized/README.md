# images-no-outsized

Image layers containing bitmaps with resolutions larger than the layer's frame by a configurable
ratio will generate violations.

## Rationale

Image bitmaps much larger than their layer needlessly swell the document size and potentially cause
performance problems navigating the document. Some teams may wish to put limits in place to prevent
this.

> The same image bitmap can be re-used across a document however, so as long as it's sized
> appropriately _somewhere_ in the document then it won't trigger any other violations.

## Options

### `maxRatio: number`

How much larger a bitmap can be compared to its parent frame before it begins to trigger violations.

## Example configuration

```js
{
  "active": true,
  "maxRatio": 2 // E.g. for 2x retina design work
}
```

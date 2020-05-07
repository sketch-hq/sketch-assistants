# images-no-undersized

Image layers containing bitmaps with resolutions smaller than the layer's frame by a configurable
ratio will generate violations.

## Rationale

Image bitmaps smaller than their layer might produce poor results in exported graphics. Some teams
may wish to put limits in place to prevent this.

> The same image bitmap can be re-used across a document however, so as long as it's sized
> appropriately _somewhere_ in the document then it won't trigger any other violations.

## Options

### `minRatio: number`

How much smaller a bitmap can be compared to its parent frame before it begins to trigger
violations.

## Example configuration

```js
{
  "active": true,
  "minRatio": 0.5 // E.g. images can have at least half the size of the layer frame
}
```

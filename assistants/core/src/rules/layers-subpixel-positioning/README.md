# layer-subpixel-positioning

Layers placed on x/y coordinates with fractional subpixel values that don't match the rules options
are considered violations.

## Rationale

Layers placed on fractional subpixel values could be considered a document hygiene issue by some
teams. The exception to this is when designing for @2x and @3x pixel density devices, in which case
`0.5` and `0.33/0.67` subpixel increments are commonly used.

## Options

### `scaleFactors: ('@1x' | '@2x' | '@3x')[]`

Array of allowable subpixel fraction types.

- `["@1x"]` Only whole numbers allowed
- `["@2x"]` Whole numbers and halves allowed
- `["@3x"]` Whole numbers and thirds allowed
- `["@2x", "@3x"]` Whole numbers, halves and thirds allowed

## Example configuration

```js
{
  "active": true,
  "scaleFactors": [
    "@2x", // Enforces 0.0 and 0.5 subpixel increments
  ]
}
```

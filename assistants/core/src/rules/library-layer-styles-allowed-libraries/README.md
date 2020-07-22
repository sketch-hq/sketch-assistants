# library-layer-styles-allowed-libraries

Restricts foreign shared layer style usage to a list of authorized libraries.

## Rationale

Teams may wish to standardize on a list of specific libraries to use for shared layer styles.

## Options

### `libraries: string[]`

An array of authorized library names.

## Example configuration

```js
{
  "active": true,
  "libraries": ["my-library"]
}
```

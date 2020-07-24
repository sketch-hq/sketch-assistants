# library-symbols-allowed-libraries

Restricts Library Symbols usage to a list of authorized Libraries.

## Rationale

Teams may wish to standardize on a list of specific Libraries to use for Library Symbols.

## Options

### `libraries: string[]`

An array of authorized Library names.

## Example configuration

```js
{
  "active": true,
  "libraries": ["my-library"]
}
```

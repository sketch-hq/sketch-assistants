# library-text-styles-allowed-libraries

Restricts Library Text Style usage to a list of authorized Libraries.

## Rationale

Teams may wish to standardize on a list of specific Libraries to use for Library Text Styles.

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

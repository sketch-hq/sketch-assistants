# text-styles-prefer-library

Disallows the usage of any document-local text styles preferring instead for these to come from
libraries.

## Rationale

Teams may wish to enforce the usage of libraries within a document, and the presence of local shared
text styles represent an opportunity to refactor them into the library.

## Options

### `libraries: string[]`

An array of whitelisted libraries to act as sources. If the libraries array is empty then any
library can be used as source. Libraries are listed by name.

## Example configuration

```js
{
  "active": true,
  "libraries": ["basic"] // Permitted source libraries, if empty any library can be used as source
}
```

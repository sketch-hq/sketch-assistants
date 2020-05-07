# symbols-prefer-library

Disallows the usage of any document-local symbols preferring instead for these to come from
libraries.

## Rationale

Teams may wish to enforce the usage of libraries within a document, and the presence of local
symbols can represent an opportunity to refactor them into a library.

## Options

### `libraries: string[]`

An array of whitelisted libraries to act as sources. If the libraries array is empty then any
library can be used as source. Libraries are listed by name.

## Example configuration

```js
{
  "active": true,
  "libraries": ["basic"] // Allowed source libraries, if empty any library can be used as source
}
```

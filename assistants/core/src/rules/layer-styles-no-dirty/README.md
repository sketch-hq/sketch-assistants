# layer-styles-no-dirty

Layers that are out of sync with their shared style are considered violations.

## Rationale

Teams may wish to enforce the strict usage of shared styles within a document, and the presence of
deviations in layer styles might represent an opportunity to either create a new shared style or set
the layers style accordingly.

## Example configuration

```js
{
  "active": true,
}
```

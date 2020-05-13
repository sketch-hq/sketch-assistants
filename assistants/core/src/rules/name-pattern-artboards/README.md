# name-pattern-artboards

Artboards with names that do not match the supplied regex patterns defined in the rule's options
will raise violations.

## Rationale

When highly precise layer naming is required, for example when a Sketch document's contents are
automatically exported to production assets, then a team may want to enforce a specific name
patterns.

Alternatively a team may wish to control names purely for document hygiene purposes, for example
forbidding default names.

## Options

### `forbidden: string[]`

Array of forbidden name patterns expressed as JavaScript compatible regex. If a name matches any
pattern in this set it is considered invalid.

### `allowed: string[]`

Array of allowable name patterns expressed as JavaScript compatible regex. Patterns added here act
as a "whitelist" - as long as a name matches at least one `allowed` pattern it is considered valid.

An empty `allowed` array is equivalent to allowing all name patterns.

## Example configuration

Forbid the default artboard name "Artboard":

```js
{
  "active": true,
  "allowed": [],
  "forbidden": ['^Artboard$'],
}
```

Only allow artboard names that start with a number, dot and space, e.g. "1. Splash Screen":

```js
{
  "active": true,
  "allowed": ["^\d.* .*$"],
  "forbidden": [],
}
```

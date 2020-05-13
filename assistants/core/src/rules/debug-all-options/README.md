# debug-all-options

> ℹ️ Debug rules are useful during the Assistant development process, and aren't designed to be
> generally useful during the typical design workflow.

This rule is a no-op and will not generate any violations, however it makes use of every rule option
schema type in its module definition.

## Rationale

Since this rule emits all possible rule option types its useful for debugging code that works with
rule options - for example, lint runners and lint configuration user interfaces.

## Options

### `numberOption: number`

Example number option.

### `stringOption: string`

Example string option.

### `integerOption: number`

Example integer option.

### `booleanOption: boolean`

Example boolean option.

### `stringEnumOption`

Example string enum options - these are strings with a limited set of allowable enumerated values.

### `stringArrayOption: string[]`

Example string array option - these are arrays that must contain only string elements.

### `objectArrayOption: {}[]`

Example object array option - these are arrays that must contain objects elements, themselves
containing only primitive values with no further nesting.

## Example configuration

```js
{
  "active": true,
  "stringOption": "foo",
  "numberOption": 1.5,
  "integerOption": 1,
  "booleanOption": true,
  "stringEnumOption": "foo",
  "stringArrayOption": ["foo", "bar"],
  "objectArrayOption": [
    { "objectArrayNumberOption": 1 },
    { "objectArrayNumberOption": 2 }
  ]
}
```

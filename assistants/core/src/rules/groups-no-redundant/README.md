# groups-no-redundant

Redundant groups are defined as groups that aren't styled and contain only one child which is also a
group, as in the following tree structure:

```
├── Layer
├── Group <<< Redundant
│   └── Group
│       ├── Layer
│       └── Layer
├── Layer
└── Layer
```

## Rationale

Redundant groups could be considered a document hygiene or usability concern by some teams who may
wish to forbid them.

## Options

None.

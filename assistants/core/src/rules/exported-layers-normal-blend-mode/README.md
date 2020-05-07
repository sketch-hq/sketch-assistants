# exported-layers-normal-blend-mode

Layers that have been marked for export but also have blend modes applied to their styles are
considered violations.

## Rationale

The visual effect of a blend mode is dependant on what's behind the layer, therefore exporting these
layers will often not reproduce the desired result in the exported asset. Some teams may wish to
flag exported layers with blend modes in case they represent a mistake.

## Options

None.

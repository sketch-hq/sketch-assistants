<img src="https://user-images.githubusercontent.com/1078571/81808057-0e01b200-9517-11ea-95ae-8759f54dba13.png" width="100">

# Tidy

The rules in this Assistant are all focused on keeping your Sketch documents as clean and tidy as
possible.

👉 Click
[here](https://add-sketch-assistant.now.sh/api/main?pkg=@sketch-hq/sketch-tidy-assistant&version=5.0.0-next.10)
to add to Sketch.

> Or, add to a Sketch release variant:
> [Beta](https://add-sketch-assistant.now.sh/api/main?variant=beta&pkg=@sketch-hq/sketch-tidy-assistant&version=5.0.0-next.10)
> |
> [Private](https://add-sketch-assistant.now.sh/api/main?variant=private&pkg=@sketch-hq/sketch-tidy-assistant&version=5.0.0-next.10)
> |
> [Internal](https://add-sketch-assistant.now.sh/api/main?variant=internal&pkg=@sketch-hq/sketch-tidy-assistant&version=5.0.0-next.10)
> |
> [Experimental](https://add-sketch-assistant.now.sh/api/main?variant=experimental&pkg=@sketch-hq/sketch-tidy-assistant)
> |
> [XCode](https://add-sketch-assistant.now.sh/api/main?variant=xcode&pkg=@sketch-hq/sketch-tidy-assistant)

## Rules

- [Maximum ungrouped layers in an artboard](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/artboards-max-ungrouped-layers)
  - Max `5`
- [Borders should not be disabled](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/borders-no-disabled)
- [Fills should not be disabled](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/fills-no-disabled)
- [Inner shadows should not be disabled](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/inner-shadows-no-disabled)
- [Shadows should not be disabled](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/shadows-no-disabled)
- [Layer styles should not be dirty](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/layer-styles-no-dirty)
- [Text styles should not be dirty](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/text-styles-no-dirty)
- [Groups should not be empty](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/groups-no-empty)
- [Groups should not be redundant](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/groups-no-redundant)
- [Layers should not be hidden](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/layers-no-hidden)
- [Layers should not be positioned on sub-pixels](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/layers-subpixel-positioning)
  - `0.5` increments are allowed
- [Shared styles should not be unused](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/shared-styles-no-unused)
- [Layers should not be loose outside artboards](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/layers-no-loose)

## Development

This section of the readme deals with development only. If you're just here to install Assistants in
Sketch you can safely ignore this section.

Ensure you've followed the _Getting Started_ section in the root [README](../../). Having done so
the following scripts should work in this folder.

| Script                 | Description                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `yarn test`            | Test the Assistant                                                                                              |
| `yarn build`           | Builds the Assistant                                                                                            |
| `yarn package-tarball` | Builds the Assistant as a local `*.tgz` tarball suitable for installing via Sketch's _Install from Disk_ option |

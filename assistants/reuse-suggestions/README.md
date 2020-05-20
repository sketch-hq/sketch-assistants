<img src="https://user-images.githubusercontent.com/1078571/81808051-0c37ee80-9517-11ea-9bf2-86fc3cf7edcb.png" width="100">

# Reuse Suggestions

Notices when similar styles and groups could be abstracted into shared styles and symbols
respectively.

👉 Click
[here](https://add-sketch-assistant.now.sh/api/main?pkg=@sketch-hq/sketch-reuse-suggestions-assistant&version=5.0.0-next.10)
to add to Sketch.

> Or, add to a Sketch release variant:
> [Beta](https://add-sketch-assistant.now.sh/api/main?variant=beta&pkg=@sketch-hq/sketch-reuse-suggestions-assistant&version=5.0.0-next.10)
> |
> [Private](https://add-sketch-assistant.now.sh/api/main?variant=private&pkg=@sketch-hq/sketch-reuse-suggestions-assistant&version=5.0.0-next.10)
> |
> [Internal](https://add-sketch-assistant.now.sh/api/main?variant=internal&pkg=@sketch-hq/sketch-reuse-suggestions-assistant&version=5.0.0-next.10)
> |
> [Experimental](https://add-sketch-assistant.now.sh/api/main?variant=experimental&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)
> |
> [XCode](https://add-sketch-assistant.now.sh/api/main?variant=xcode&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)

## Rules

- [Prefer shared styles](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/layer-styles-prefer-shared)
  - Maximum number of identical layer styles `2`
- [Prefer shared text styles](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/text-styles-prefer-shared)
  - Maximum number of identical text styles `2`
- [Prefer symbols](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/groups-no-similar)
  - Maximum number of identical groups `2`

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

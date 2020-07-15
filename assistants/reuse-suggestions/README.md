## Rules

- [Prefer shared styles](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/main/src/rules/layer-styles-prefer-shared)
  - Maximum number of identical layer styles `2`
- [Prefer shared text styles](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/main/src/rules/text-styles-prefer-shared)
  - Maximum number of identical text styles `2`
- [Prefer symbols](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/main/src/rules/groups-no-similar)
  - Maximum number of identical groups `2`

👉 Click
[here](https://add-sketch-assistant.now.sh/api/main?pkg=@sketch-hq/sketch-reuse-suggestions-assistant)
to add to your Sketch document.

> Or, add using a Sketch release variant:
> [Beta](https://add-sketch-assistant.now.sh/api/main?variant=beta&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)
> |
> [Private](https://add-sketch-assistant.now.sh/api/main?variant=private&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)
> |
> [Internal](https://add-sketch-assistant.now.sh/api/main?variant=internal&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)
> |
> [Experimental](https://add-sketch-assistant.now.sh/api/main?variant=experimental&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)
> |
> [Xcode](https://add-sketch-assistant.now.sh/api/main?variant=xcode&pkg=@sketch-hq/sketch-reuse-suggestions-assistant)

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

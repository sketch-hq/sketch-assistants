<img src="https://user-images.githubusercontent.com/1078571/81808046-0a6e2b00-9517-11ea-9b6c-1c6fa9a377ba.png" width="100">

# Naming Conventions

Naming conventions used by the Sketch design team.

👉 Click
[here](https://add-sketch-assistant.now.sh/api/main?pkg=@sketch-hq/sketch-naming-conventions-assistant&version=5.0.0-next.10)
to add to Sketch.

> Or, add to a Sketch release variant:
> [Beta](https://add-sketch-assistant.now.sh/api/main?variant=beta&pkg=@sketch-hq/sketch-naming-conventions-assistant&version=5.0.0-next.10)
> |
> [Private](https://add-sketch-assistant.now.sh/api/main?variant=private&pkg=@sketch-hq/sketch-naming-conventions-assistant&version=5.0.0-next.10)
> |
> [Internal](https://add-sketch-assistant.now.sh/api/main?variant=internal&pkg=@sketch-hq/sketch-naming-conventions-assistant)
> |
> [Experimental](https://add-sketch-assistant.now.sh/api/main?variant=experimental&pkg=@sketch-hq/sketch-naming-conventions-assistant)
> |
> [XCode](https://add-sketch-assistant.now.sh/api/main?variant=xcode&pkg=@sketch-hq/sketch-naming-conventions-assistant)

## Rules

- [Page names](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/name-pattern-pages)
  - Must start with an emoji, e.g. `🚧 Work in Progress`
- [Artboard names](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/name-pattern-artboards)
  - Must start with an emojii or be numbered. e.g. `1.1 Splash Screen`
- [Group names](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/name-pattern-groups)
  - Default layer names are forbidden, e.g. `Group`
- [Symbol names](https://github.com/sketch-hq/sketch-assistant-core-rules/tree/master/src/rules/name-pattern-symbols)
  - Names must take advantage of forward-slash grouping, e.g. `Icon/Frog`

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

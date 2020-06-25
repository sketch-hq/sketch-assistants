# Sketch Assistants

A TypeScript monorepo for Sketch Assistants and related packages.

## Contents

### Assistants

- [Tidy](./assistants/tidy)
- [Naming Conventions](./assistants/naming-conventions)
- [Reuse Suggestions](./assistants/reuse-suggestions)

### Packages

- [Types](./packages/types)
- [Utils](./packages/utils)

## Development

This section of the readme deals with development only. If you're just here to install Assistants in
Sketch you can safely ignore this section.

### Tools

- [Node](https://nodejs.org/en/download/) (12.X.X or later)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (1.X.X)
- [Visual Studio Code](https://code.visualstudio.com/) (Recommended editor, not required to build
  the source)

### Getting started

1. Clone the repository.
1. Run `yarn` in the root folder.
1. Head to the package folder you wish to work with for additional documentation (linked above).

### Monorepo scripts

These scripts operate globally across every package in the monorepo.

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `yarn build`          | Builds all packages                           |
| `yarn test`           | Test all packages                             |
| `yarn prettier-check` | Check the format for all code in the monorepo |
| `yarn release`        | Build and release all packages to npm         |

### Release process

This repository uses [Atlassian Changesets](https://github.com/atlassian/changesets) to manage the
npm release process. Read the docs for more information, but the top-level summary is:

1. If you want the work you're doing on a package, or set of packages, to be released then run
   `yarn changeset`. An interactive CLI will ask you which packages should be released, and what
   sort of semver bump type they should receive.
1. The CLI will generate a changeset for you in the repository, which you should include in your
   Pull Request.
1. To release the packages to npm, based on the changesets that accumulate in the repository, merge
   the automatically generated Pull Request called _Version Packages_.

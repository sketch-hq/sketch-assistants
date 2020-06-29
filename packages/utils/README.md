# sketch-assistant-utils

Utility functions and types for Sketch Assistants.

> 🙋‍♀️ These utility functions are mainly of use when creating Sketch Assistant Runners, i.e. tools
> that invoke Assistants against Sketch files and present the results to a user.

## Usage

```sh
yarn add @sketch-hq/sketch-assistant-utils
```

## Development

This section of the readme is related to developing the package. If you just want to consume the
package you can safely ignore this.

### Scripts

| Script               | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| yarn build           | Builds package to `dist`                                        |
| yarn test            | Runs the Jest tests                                             |
| yarn lint            | Lints with eslint                                               |
| yarn format-check    | Checks the formatting with prettier                             |
| yarn package-tarball | Creates an installable tarball from the current module contents |

### Workflows

#### Conventional commits

Try and use the [conventional commits](https://www.conventionalcommits.org/) convention when writing
commit messages.

#### Releases

This repo uses [Atlassian Changesets](https://github.com/atlassian/changesets) to automate the npm
release process. Read the docs for more information, but the top-level summary is:

- A GitHub Action maintains a permanently open PR that when merged will publish the package to npm
  with the latest changes and an automatically determined semver
- If the work you do in a PR should affect the next release, then you need to commit a "changeset"
  to the repo together with the rest of your code changes - do this by running `yarn changeset`.
  You'll be asked to provide a change type (major, minor or patch) and a message

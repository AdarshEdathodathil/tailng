# tailng

Command-line utility for listing and copying TailNG ownable components into Angular apps.

<div align="center">
  <img
    src="https://raw.githubusercontent.com/tailng/tailng-ui/main/apps/tailng-ui/docs/src/assets/logo.svg"
    width="120"
    alt="TailNG logo"
  />

  <h1>tailng</h1>

  <p>
    <strong>Accessible Angular UI, built to be owned.</strong>
  </p>

  <p>
    Ownable source installs for TailNG UI components, primitives, and generated local wrappers.
  </p>

  <p>
    <a href="https://github.com/tailng/tailng-ui">GitHub</a>
    ·
    <a href="https://tailng.dev">Documentation</a>
  </p>
</div>

[![CLI - Release & Publish (tailng)](https://github.com/tailng/tailng-ui/actions/workflows/tailng-release.yml/badge.svg)](https://github.com/tailng/tailng-ui/actions/workflows/tailng-release.yml)
[![NPM Version](https://img.shields.io/npm/v/tailng.svg)](https://www.npmjs.com/package/tailng)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`tailng` copies source files from the TailNG registry into your Angular app so you can own and modify the generated implementation locally.

## Installation

### One-off usage with pnpm dlx

```bash
pnpm dlx tailng list
pnpm dlx tailng add button
```

### Install as a dev dependency

#### pnpm

```bash
pnpm add -D tailng
```

#### yarn

```bash
yarn add -D tailng
```

#### npm

```bash
npm install -D tailng
```

## Commands

```bash
tailng list
tailng --help
tailng add button --cwd apps/tailng-ui/playground-plain-css
tailng add dialog --cwd apps/tailng-ui/playground-plain-css
tailng add popover --cwd apps/tailng-ui/playground-plain-css
tailng add slide-toggle --cwd apps/tailng-ui/playground-plain-css
```

`tailng list` is the authoritative source for the supported ownable surface in the current package version.

## Options

- `--cwd <path>` target project root (defaults to current working directory)
- `--dry-run` print file operations without writing files
- `--force` overwrite existing files

## Error handling

- unknown commands print help and exit non-zero
- unknown components print the current supported component list and exit non-zero
- add targets must point at an existing directory
- existing files are rejected unless `--force` is provided

## Canonical names and aliases

TailNG keeps one canonical component per pattern and resolves common aliases:

- `slide-toggle` -> `switch`
- `sidenav` -> `drawer`
- `sidebar` -> `drawer`
- `side-nav` -> `drawer`
- `sheet` -> `drawer`
- `expansion-panel` -> `accordion`
- `spinner` -> `progress-spinner`
- `snackbar` -> `toast`
- `sonner` -> `toast`

## How generated installs work

`tailng add <component>` writes local source under:

```text
<cwd>/src/app/tailng-ui/<component>/
```

The generated files and import hints come from `@tailng-ui/registry`, so the CLI, registry, and docs stay aligned.

## Documentation

- Package docs: [https://tailng.dev](https://tailng.dev)
- Repository: [https://github.com/tailng/tailng-ui](https://github.com/tailng/tailng-ui)

## License

See the repository license at the root of the monorepo.

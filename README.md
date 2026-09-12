# github-iac

Infrastructure as Code for GitHub account management via [pulumi](https://www.pulumi.com/), driven by [mise](https://mise.jdx.dev) and [fnox](https://github.com/jdx/fnox).

## Docs

[DeepWiki](https://deepwiki.com/aguimbao/github-iac)

## Prerequisites

- [mise](https://mise.jdx.dev) / [devcontainers](https://containers.dev/)
- [podman](https://github.com/containers/podman) (+ podman socket active)

## Usage

### Setup

Use your own `.fnox.local.toml` if needed

> If using Proton Pass pass-cli, you need an authenticated pass-cli session with access to the project vault items. Run `mise run setup-pass-cli` to authenticate.

```bash
# devcontainer
devcontainer up

# no devcontainer
mise trust
mise install
bun install

# both
mise run setup-pass-cli  # optional, for Proton Pass authentication
```

### Commands

```bash
# All accept --help

# lint
mise run lint
# format
mise run fmt
# test ci locally
mise run ci
# bump versions
mise run renovate

# pulumi
mise run pulumi
```

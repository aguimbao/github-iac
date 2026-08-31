# github-iac

Infrastructure as Code for GitHub account management via [Pulumi](https://www.pulumi.com/), driven by [mise](https://mise.jdx.dev) and [fnox](https://github.com/jdx/fnox).

## Prerequisites

- [mise](https://mise.jdx.dev) / [devcontainers](https://containers.dev/)
- [podman](https://github.com/containers/podman) (+ podman socket active)

## Usage

### Setup

Use your own `.fnox.local.toml` if needed

```bash
# devcontainer
devcontainer up

# local
mise trust
mise run setup
```

### Commands

```bash
# lint
mise run lint
# format
mise run fmt
# test ci locally
mise run ci
# bump versions
mise run renovate

# preview infrastructure changes
mise run preview
# apply infrastructure changes
mise run up
```

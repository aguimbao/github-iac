---
name: create-repository
description: Interactively create and configure a new GitHub repository in this IaC repository.
---

# Create Repository Skill

This skill guides an AI agent through adding a new GitHub repository to this Infrastructure-as-Code repository (`github-iac`).

## Core Principles

1. **Dynamic discovery at runtime**: Never rely on stale or hardcoded schema lists. Introspect live codebase types and current configurations on every run.
2. **Upfront interactive gathering**: Ask all configuration questions together at the beginning before any modifications.
3. **Single source of truth**: Repositories and associated resources are declared in:
   - `src/data.ts` for public repositories (checked into git).
   - `data.private.json` for private repositories (encrypted via `mise run encrypt` to `data.private.json.enc`).
   Both follow the TypeScript interfaces defined in `src/modules/*.ts`.

---

## Workflow

### Step 1: Discovery

#### Schema: All Available Options

Run (path must match exactly):

```bash
bun .agents/skills/create-repository/scripts/inspect-repository-options.ts
```

Use its JSON output as the schema source of truth:

- `repositoryFields`: every field of `RepositoryConfig` with `type`, `optional`, `templateDefault` (value on `repository-template`), `providerDefault` (fallback in `createRepositories()` `??` chain). Build prompts from this list — never from a hardcoded list in this skill.
- `associatedResources`: field schemas for every per-repository resource type, discovered dynamically from `GithubIacConfig` keys in `src/config.ts` (whatever keys exist besides `repositories`). Never assume a fixed list — use whatever keys the script output contains.
- `descriptionNote`: `description` is IGNORED at apply time (`createRepositories()` re-extracts it from each repo README). Do not prompt for it as a stored setting.
- `existingRepositories`: reject colliding `name`s.

#### Conventions: How Existing Repos Are Set Up

From the same script output, plus direct reads when clarification is needed (`src/data.ts`, `src/modules/*.ts`):

- `repositoryVariants`: distinct `RepositoryConfig` shapes grouped with `usedBy` repos. Offer the majority variant as "Recommended preset", minority variants as alternatives.
- `rulesetVariants`: distinct ruleset shapes with `usedBy` (e.g. full variant with `requiredStatusChecks` ci-gate + `requiredCodeScanning` CodeQL vs. basic variant). Let the user pick a variant or none.
- `associatedResourceExamples`: live examples per resource type (e.g. `environments` on `github-iac`/`aguimbao.me`).

B informs recommendations only. Every field from A must still be offered, even if no existing repo uses a non-default value for it.

---

### Step 2: Gather Configuration Upfront & Interactively

**Rule:** Ask everything in a single interactive batch (via interactive user input tools if available, else chat questionnaire) before writing code. Construct the questions dynamically from Step 1 output:

1. `name` (required, unique vs `existingRepositories`).
2. `visibility`: options from the field's union type; route `public` → `src/data.ts`, `private` → `data.private.json` (+ `mise run encrypt`). Surface `templateDefault` as recommended.
3. Every remaining entry of `repositoryFields` (except ignored `description`): present its `type` union as choices, `templateDefault` as recommended, and flag where `providerDefault` diverges so the user knows what omission would apply.
4. Ruleset: choice of variant from `rulesetVariants` (show `usedBy`), or none.
5. Associated resources: per `associatedResources` schema + `associatedResourceExamples`; ask only whether any are needed, then drill into the chosen resource's fields.

---

### Step 3: Implement Configuration

1. Build the typed `RepositoryConfig` object matching `src/modules/repositories.ts`.
2. Apply to target file:
   - **Public**: append repo object to `repositories` in `src/data.ts`; append ruleset to `rulesets` (with `repository` set to the new name), environments/resources to their arrays.
   - **Private**: same against `data.private.json`, then `mise run encrypt`.

import * as github from "@pulumi/github";

export interface RulesetConfig {
  name: string;
  repository: string;
  target: "branch" | "tag" | "push";
  enforcement: "disabled" | "active" | "evaluate";
  bypassActors?: github.types.input.RepositoryRulesetBypassActor[];
  conditions?: github.types.input.RepositoryRulesetConditions;
  rules: github.types.input.RepositoryRulesetRules;
}

export function createRulesets(
  configs: RulesetConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryRuleset[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.RepositoryRuleset(`${cfg.repository}-${cfg.name}`, {
      name: cfg.name,
      repository,
      target: cfg.target,
      enforcement: cfg.enforcement,
      bypassActors: cfg.bypassActors,
      conditions: cfg.conditions,
      rules: cfg.rules,
    });
  });
}

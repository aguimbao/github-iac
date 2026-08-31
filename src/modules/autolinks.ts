import * as github from "@pulumi/github";

export interface AutolinkConfig {
  repository: string;
  keyPrefix: string;
  targetUrlTemplate: string;
  isAlphanumeric?: boolean;
}

export function createAutolinks(
  configs: AutolinkConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryAutolinkReference[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.RepositoryAutolinkReference(`${cfg.repository}-${cfg.keyPrefix}`, {
      repository,
      keyPrefix: cfg.keyPrefix,
      targetUrlTemplate: cfg.targetUrlTemplate,
      isAlphanumeric: cfg.isAlphanumeric ?? true,
    });
  });
}

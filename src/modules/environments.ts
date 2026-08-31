import * as github from "@pulumi/github";

export interface EnvironmentConfig {
  repository: string;
  environment: string;
  waitTimer?: number | null;
  canAdminsBypass?: boolean | null;
  preventSelfReview?: boolean | null;
}

export function createEnvironments(
  configs: EnvironmentConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryEnvironment[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.RepositoryEnvironment(`${cfg.repository}-${cfg.environment}`, {
      repository,
      environment: cfg.environment,
      waitTimer: cfg.waitTimer ?? undefined,
      canAdminsBypass: cfg.canAdminsBypass ?? undefined,
      preventSelfReview: cfg.preventSelfReview ?? undefined,
    });
  });
}

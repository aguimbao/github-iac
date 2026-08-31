import * as github from "@pulumi/github";

export interface CollaboratorConfig {
  repository: string;
  username: string;
  permission?: "pull" | "triage" | "push" | "maintain" | "admin";
}

export function createCollaborators(
  configs: CollaboratorConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryCollaborator[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.RepositoryCollaborator(`${cfg.repository}-${cfg.username}`, {
      repository,
      username: cfg.username,
      permission: cfg.permission ?? "push",
    });
  });
}

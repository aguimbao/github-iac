import * as github from "@pulumi/github";

export interface PagesConfig {
  repository: string;
  branch: string;
  path?: string;
  cname?: string;
}

export function createPages(
  configs: PagesConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryPages[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.RepositoryPages(`${cfg.repository}-pages`, {
      repository,
      source: {
        branch: cfg.branch,
        path: cfg.path ?? "/",
      },
      cname: cfg.cname,
    });
  });
}

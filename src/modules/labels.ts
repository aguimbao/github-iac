import * as github from "@pulumi/github";

export interface LabelConfig {
  name: string;
  color: string;
  description?: string;
}

export interface IssueLabelsConfig {
  repository: string;
  labels: LabelConfig[];
}

export function createIssueLabels(
  configs: IssueLabelsConfig[],
  repos: Map<string, github.Repository>,
): github.IssueLabels[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.IssueLabels(`${cfg.repository}-labels`, {
      repository,
      labels: cfg.labels,
    });
  });
}

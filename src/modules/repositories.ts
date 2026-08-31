import * as github from "@pulumi/github";

export interface RepositoryConfig {
  name: string;
  description?: string;
  visibility?: "public" | "private" | "internal";
  hasIssues?: boolean;
  hasDiscussions?: boolean;
  hasProjects?: boolean;
  hasWiki?: boolean;
  isTemplate?: boolean;
  allowMergeCommit?: boolean;
  allowSquashMerge?: boolean;
  allowRebaseMerge?: boolean;
  allowAutoMerge?: boolean;
  deleteBranchOnMerge?: boolean;
  autoInit?: boolean;
  archived?: boolean;
  topics?: string[];
  homepageUrl?: string;
}

export function createRepositories(
  configs: RepositoryConfig[],
): Map<string, github.Repository> {
  const repos = new Map<string, github.Repository>();

  for (const cfg of configs) {
    const repo = new github.Repository(cfg.name, {
      name: cfg.name,
      description: cfg.description,
      visibility: cfg.visibility ?? "public",
      hasIssues: cfg.hasIssues ?? true,
      hasDiscussions: cfg.hasDiscussions ?? false,
      hasProjects: cfg.hasProjects ?? false,
      hasWiki: cfg.hasWiki ?? false,
      isTemplate: cfg.isTemplate ?? false,
      allowMergeCommit: cfg.allowMergeCommit ?? true,
      allowSquashMerge: cfg.allowSquashMerge ?? true,
      allowRebaseMerge: cfg.allowRebaseMerge ?? true,
      allowAutoMerge: cfg.allowAutoMerge ?? false,
      deleteBranchOnMerge: cfg.deleteBranchOnMerge ?? true,
      autoInit: cfg.autoInit ?? false,
      archived: cfg.archived ?? false,
      topics: cfg.topics ?? [],
      homepageUrl: cfg.homepageUrl,
    });

    repos.set(cfg.name, repo);
  }

  return repos;
}

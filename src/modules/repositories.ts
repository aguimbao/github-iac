import * as github from "@pulumi/github";

export interface RepositoryConfig {
  name: string;
  description?: string | null;
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
  allowUpdateBranch?: boolean | null;
  deleteBranchOnMerge?: boolean;
  autoInit?: boolean;
  archived?: boolean;
  topics?: string[];
  homepageUrl?: string | null;
  squashMergeCommitTitle?: "PR_TITLE" | "COMMIT_OR_PR_TITLE" | null;
  squashMergeCommitMessage?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK" | null;
  webCommitSignoffRequired?: boolean | null;
  defaultBranch?: string | null;
  vulnerabilityAlerts?: boolean | null;
  secretScanning?: boolean | null;
  secretScanningPushProtection?: boolean | null;
  dependabotSecurityUpdates?: boolean | null;
}

export function createRepositories(
  configs: RepositoryConfig[],
): Map<string, github.Repository> {
  const repos = new Map<string, github.Repository>();

  for (const cfg of configs) {
    let securityAndAnalysis: github.types.input.RepositorySecurityAndAnalysis | undefined;
    if (
      cfg.secretScanning !== undefined ||
      cfg.secretScanningPushProtection !== undefined
    ) {
      securityAndAnalysis = {
        secretScanning:
          cfg.secretScanning !== undefined && cfg.secretScanning !== null
            ? { status: cfg.secretScanning ? "enabled" : "disabled" }
            : undefined,
        secretScanningPushProtection:
          cfg.secretScanningPushProtection !== undefined &&
          cfg.secretScanningPushProtection !== null
            ? { status: cfg.secretScanningPushProtection ? "enabled" : "disabled" }
            : undefined,
      };
    }

    const repo = new github.Repository(cfg.name, {
      name: cfg.name,
      description: cfg.description ?? undefined,
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
      allowUpdateBranch: cfg.allowUpdateBranch ?? undefined,
      deleteBranchOnMerge: cfg.deleteBranchOnMerge ?? true,
      autoInit: cfg.autoInit ?? false,
      archived: cfg.archived ?? false,
      topics: cfg.topics ?? [],
      homepageUrl: cfg.homepageUrl ?? undefined,
      squashMergeCommitTitle: cfg.squashMergeCommitTitle ?? undefined,
      squashMergeCommitMessage: cfg.squashMergeCommitMessage ?? undefined,
      webCommitSignoffRequired: cfg.webCommitSignoffRequired ?? undefined,
      securityAndAnalysis,
    });

    repos.set(cfg.name, repo);
  }

  return repos;
}

export function createVulnerabilityAlerts(
  configs: RepositoryConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryVulnerabilityAlerts[] {
  const alerts: github.RepositoryVulnerabilityAlerts[] = [];

  for (const cfg of configs) {
    if (cfg.vulnerabilityAlerts !== undefined && cfg.vulnerabilityAlerts !== null) {
      const repo = repos.get(cfg.name);
      const repository = repo ? repo.name : cfg.name;

      alerts.push(
        new github.RepositoryVulnerabilityAlerts(`${cfg.name}-vuln-alerts`, {
          repository,
          enabled: cfg.vulnerabilityAlerts,
        }),
      );
    }
  }

  return alerts;
}

export function createBranchDefaults(
  configs: RepositoryConfig[],
  repos: Map<string, github.Repository>,
): github.BranchDefault[] {
  const branchDefaults: github.BranchDefault[] = [];

  for (const cfg of configs) {
    if (cfg.defaultBranch) {
      const repo = repos.get(cfg.name);
      const repository = repo ? repo.name : cfg.name;

      branchDefaults.push(
        new github.BranchDefault(`${cfg.name}-default-branch`, {
          repository,
          branch: cfg.defaultBranch,
        }),
      );
    }
  }

  return branchDefaults;
}

import * as github from "@pulumi/github";
import * as pulumi from "@pulumi/pulumi";

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

export function extractAboutFromReadme(content: string): string {
  const lines = content.split(/\r?\n/);
  let foundH1 = false;
  const descriptionLines: string[] = [];

  for (const line of lines) {
    if (!foundH1) {
      if (/^#\s+/.test(line)) {
        foundH1 = true;
      }
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      break;
    }

    descriptionLines.push(line);
  }

  if (!foundH1) {
    return "";
  }

  return descriptionLines
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchRepoReadme(
  owner: string,
  repo: string,
  token?: string,
): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "github-iac",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers,
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

export async function createRepositories(
  configs: RepositoryConfig[],
): Promise<Map<string, github.Repository>> {
  const repos = new Map<string, github.Repository>();
  const ghConfig = new pulumi.Config("github");
  const owner = ghConfig.get("owner") || process.env.GITHUB_OWNER || "aguimbao";
  const token = ghConfig.get("token") || process.env.GITHUB_TOKEN;

  const descriptions = await Promise.all(
    configs.map(async (cfg) => {
      const readme = await fetchRepoReadme(owner, cfg.name, token);
      const about = extractAboutFromReadme(readme);
      return { name: cfg.name, description: about || undefined };
    }),
  );

  const descriptionMap = new Map(descriptions.map((d) => [d.name, d.description]));

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
      description: descriptionMap.get(cfg.name),
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

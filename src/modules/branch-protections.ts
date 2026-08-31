import * as github from "@pulumi/github";

export interface BranchProtectionConfig {
  repository: string;
  pattern?: string;
  enforceAdmins?: boolean;
  allowsDeletions?: boolean;
  allowsForcePushes?: boolean;
  requireSignedCommits?: boolean;
  requiredLinearHistory?: boolean;
  requireConversationResolution?: boolean;
  requiredStatusChecks?: string[];
  strictStatusChecks?: boolean;
  requiredApprovingReviewCount?: number;
  dismissStaleReviews?: boolean;
  requireCodeOwnerReviews?: boolean;
}

export function createBranchProtections(
  configs: BranchProtectionConfig[],
  repos: Map<string, github.Repository>,
): github.BranchProtection[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repositoryId = repo ? repo.name : cfg.repository;
    const pattern = cfg.pattern ?? "main";

    return new github.BranchProtection(`${cfg.repository}-${pattern}-protection`, {
      repositoryId,
      pattern,
      enforceAdmins: cfg.enforceAdmins ?? false,
      allowsDeletions: cfg.allowsDeletions ?? false,
      allowsForcePushes: cfg.allowsForcePushes ?? false,
      requireSignedCommits: cfg.requireSignedCommits ?? false,
      requiredLinearHistory: cfg.requiredLinearHistory ?? true,
      requireConversationResolution: cfg.requireConversationResolution ?? true,
      requiredStatusChecks: cfg.requiredStatusChecks
        ? [
            {
              strict: cfg.strictStatusChecks ?? true,
              contexts: cfg.requiredStatusChecks,
            },
          ]
        : undefined,
      requiredPullRequestReviews:
        cfg.requiredApprovingReviewCount !== undefined
          ? [
              {
                requiredApprovingReviewCount: cfg.requiredApprovingReviewCount,
                dismissStaleReviews: cfg.dismissStaleReviews ?? true,
                requireCodeOwnerReviews: cfg.requireCodeOwnerReviews ?? false,
              },
            ]
          : undefined,
    });
  });
}

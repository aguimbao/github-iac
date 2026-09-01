import type { ActionVariableConfig } from "./modules/actions";
import type { AutolinkConfig } from "./modules/autolinks";
import type { BranchProtectionConfig } from "./modules/branch-protections";
import type { CollaboratorConfig } from "./modules/collaborators";
import type { EnvironmentConfig } from "./modules/environments";
import type { DeployKeyConfig, UserGpgKeyConfig, UserSshKeyConfig } from "./modules/keys";
import type { PagesConfig } from "./modules/pages";
import type { RepositoryConfig } from "./modules/repositories";
import type { RulesetConfig } from "./modules/rulesets";
import type { WebhookConfig } from "./modules/webhooks";

export const repositories: RepositoryConfig[] = [
  {
    name: "github-iac",
    visibility: "public",
    hasIssues: true,
    hasProjects: true,
    hasWiki: false,
    hasDiscussions: false,
    allowSquashMerge: true,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    allowAutoMerge: true,
    allowUpdateBranch: true,
    deleteBranchOnMerge: true,
    isTemplate: false,
    archived: false,
    topics: [],
    homepageUrl: null,
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_BODY",
    webCommitSignoffRequired: true,
    defaultBranch: "main",
    vulnerabilityAlerts: false,
    secretScanning: true,
    secretScanningPushProtection: true,
    dependabotSecurityUpdates: false,
  },
  {
    name: "omniroute",
    visibility: "public",
    hasIssues: true,
    hasProjects: true,
    hasWiki: false,
    hasDiscussions: false,
    allowSquashMerge: true,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    allowAutoMerge: true,
    allowUpdateBranch: true,
    deleteBranchOnMerge: true,
    isTemplate: false,
    archived: false,
    topics: [],
    homepageUrl: null,
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_BODY",
    webCommitSignoffRequired: true,
    defaultBranch: "main",
    vulnerabilityAlerts: false,
    secretScanning: true,
    secretScanningPushProtection: true,
    dependabotSecurityUpdates: false,
  },
  {
    name: "repository-template",
    visibility: "public",
    hasIssues: true,
    hasProjects: true,
    hasWiki: false,
    hasDiscussions: false,
    allowSquashMerge: true,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    allowAutoMerge: true,
    allowUpdateBranch: true,
    deleteBranchOnMerge: true,
    isTemplate: false,
    archived: false,
    topics: [],
    homepageUrl: null,
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_BODY",
    webCommitSignoffRequired: true,
    defaultBranch: "main",
    vulnerabilityAlerts: false,
    secretScanning: true,
    secretScanningPushProtection: true,
    dependabotSecurityUpdates: false,
  },
  {
    name: "aguimbao.me",
    visibility: "public",
    hasIssues: true,
    hasProjects: true,
    hasWiki: true,
    hasDiscussions: false,
    allowSquashMerge: true,
    allowMergeCommit: true,
    allowRebaseMerge: true,
    allowAutoMerge: false,
    allowUpdateBranch: false,
    deleteBranchOnMerge: false,
    isTemplate: false,
    archived: false,
    topics: [],
    homepageUrl: "https://aguimbao.me",
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_BODY",
    webCommitSignoffRequired: false,
    defaultBranch: "main",
    vulnerabilityAlerts: false,
    secretScanning: true,
    secretScanningPushProtection: true,
    dependabotSecurityUpdates: false,
  },
  {
    name: "42",
    visibility: "public",
    hasIssues: true,
    hasProjects: true,
    hasWiki: false,
    hasDiscussions: false,
    allowSquashMerge: true,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    allowAutoMerge: true,
    allowUpdateBranch: true,
    deleteBranchOnMerge: true,
    isTemplate: false,
    archived: false,
    topics: [],
    homepageUrl: null,
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_BODY",
    webCommitSignoffRequired: true,
    defaultBranch: "main",
    vulnerabilityAlerts: false,
    secretScanning: true,
    secretScanningPushProtection: true,
    dependabotSecurityUpdates: false,
  },
  {
    name: "aguimbao",
    visibility: "public",
    hasIssues: true,
    hasProjects: true,
    hasWiki: false,
    hasDiscussions: false,
    allowSquashMerge: true,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    allowAutoMerge: true,
    allowUpdateBranch: true,
    deleteBranchOnMerge: true,
    isTemplate: false,
    archived: false,
    topics: [],
    homepageUrl: null,
    squashMergeCommitTitle: "PR_TITLE",
    squashMergeCommitMessage: "PR_BODY",
    webCommitSignoffRequired: true,
    defaultBranch: "main",
    vulnerabilityAlerts: false,
    secretScanning: true,
    secretScanningPushProtection: true,
    dependabotSecurityUpdates: false,
  },
];
export const sshKeys: UserSshKeyConfig[] = [
  {
    title: "Authentication",
    key: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGuc9u4BwLvDoU3VCCE0WqDyy2ZFbx0e9OZvjExtfT/P",
  },
];
export const gpgKeys: UserGpgKeyConfig[] = [];
export const rulesets: RulesetConfig[] = [
  {
    name: "default",
    repository: "github-iac",
    target: "branch",
    enforcement: "active",
    conditions: {
      refName: {
        includes: ["~DEFAULT_BRANCH"],
        excludes: [],
      },
    },
    bypassActors: [
      {
        actorId: 23490125,
        actorType: "User",
        bypassMode: "always",
      },
    ],
    rules: {
      deletion: true,
      nonFastForward: true,
      requiredSignatures: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
        dismissStaleReviewsOnPush: true,
        requireCodeOwnerReview: false,
        requireLastPushApproval: false,
        requiredReviewThreadResolution: false,
        allowedMergeMethods: ["merge", "squash", "rebase"],
      },
      creation: true,
      requiredStatusChecks: {
        strictRequiredStatusChecksPolicy: true,
        doNotEnforceOnCreate: false,
        requiredChecks: [
          {
            context: "ci-gate",
            integrationId: 15368,
          },
        ],
      },
      requiredCodeScanning: {
        requiredCodeScanningTools: [
          {
            tool: "CodeQL",
            securityAlertsThreshold: "all",
            alertsThreshold: "all",
          },
        ],
      },
    },
  },
  {
    name: "default",
    repository: "omniroute",
    target: "branch",
    enforcement: "active",
    conditions: {
      refName: {
        includes: ["~DEFAULT_BRANCH"],
        excludes: [],
      },
    },
    bypassActors: [
      {
        actorId: 23490125,
        actorType: "User",
        bypassMode: "always",
      },
    ],
    rules: {
      deletion: true,
      nonFastForward: true,
      requiredSignatures: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
        dismissStaleReviewsOnPush: true,
        requireCodeOwnerReview: false,
        requireLastPushApproval: false,
        requiredReviewThreadResolution: false,
        allowedMergeMethods: ["merge", "squash", "rebase"],
      },
      creation: true,
      requiredStatusChecks: {
        strictRequiredStatusChecksPolicy: true,
        doNotEnforceOnCreate: false,
        requiredChecks: [
          {
            context: "ci-gate",
            integrationId: 15368,
          },
        ],
      },
      requiredCodeScanning: {
        requiredCodeScanningTools: [
          {
            tool: "CodeQL",
            securityAlertsThreshold: "all",
            alertsThreshold: "all",
          },
        ],
      },
    },
  },
  {
    name: "default",
    repository: "repository-template",
    target: "branch",
    enforcement: "active",
    conditions: {
      refName: {
        includes: ["~DEFAULT_BRANCH"],
        excludes: [],
      },
    },
    bypassActors: [
      {
        actorId: 23490125,
        actorType: "User",
        bypassMode: "always",
      },
    ],
    rules: {
      deletion: true,
      nonFastForward: true,
      requiredSignatures: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
        dismissStaleReviewsOnPush: true,
        requireCodeOwnerReview: false,
        requireLastPushApproval: false,
        requiredReviewThreadResolution: false,
        allowedMergeMethods: ["merge", "squash", "rebase"],
      },
      creation: true,
    },
  },
  {
    name: "default",
    repository: "42",
    target: "branch",
    enforcement: "active",
    conditions: {
      refName: {
        includes: ["~DEFAULT_BRANCH"],
        excludes: [],
      },
    },
    bypassActors: [
      {
        actorId: 23490125,
        actorType: "User",
        bypassMode: "always",
      },
    ],
    rules: {
      deletion: true,
      nonFastForward: true,
      requiredSignatures: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
        dismissStaleReviewsOnPush: true,
        requireCodeOwnerReview: false,
        requireLastPushApproval: false,
        requiredReviewThreadResolution: false,
        allowedMergeMethods: ["merge", "squash", "rebase"],
      },
      creation: true,
    },
  },
  {
    name: "default",
    repository: "aguimbao",
    target: "branch",
    enforcement: "active",
    conditions: {
      refName: {
        includes: ["~DEFAULT_BRANCH"],
        excludes: [],
      },
    },
    bypassActors: [
      {
        actorId: 23490125,
        actorType: "User",
        bypassMode: "always",
      },
    ],
    rules: {
      deletion: true,
      nonFastForward: true,
      requiredSignatures: true,
      pullRequest: {
        requiredApprovingReviewCount: 0,
        dismissStaleReviewsOnPush: true,
        requireCodeOwnerReview: false,
        requireLastPushApproval: false,
        requiredReviewThreadResolution: false,
        allowedMergeMethods: ["merge", "squash", "rebase"],
      },
      creation: true,
    },
  },
];
export const branchProtections: BranchProtectionConfig[] = [];
export const pages: PagesConfig[] = [];
export const webhooks: WebhookConfig[] = [];
export const environments: EnvironmentConfig[] = [
  {
    repository: "github-iac",
    environment: "production",
    waitTimer: null,
  },
  {
    repository: "aguimbao.me",
    environment: "Preview",
    waitTimer: null,
  },
  {
    repository: "aguimbao.me",
    environment: "Production",
    waitTimer: null,
  },
];
export const collaborators: CollaboratorConfig[] = [];
export const autolinks: AutolinkConfig[] = [];
export const deployKeys: DeployKeyConfig[] = [];
export const actionVariables: ActionVariableConfig[] = [];

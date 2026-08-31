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
    description: "Github IAC",
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
    squashMergeCommitMessage: "COMMIT_MESSAGES",
    webCommitSignoffRequired: true,
  },
  {
    name: "omniroute",
    description:
      "OmniRoute service, uses mise for dependencies, fnox for secret handling and podman + pitchfork container / daemon management.",
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
    squashMergeCommitMessage: "COMMIT_MESSAGES",
    webCommitSignoffRequired: true,
  },
  {
    name: "repository-template",
    description: "Repository templates",
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
    homepageUrl: null,
    squashMergeCommitTitle: "COMMIT_OR_PR_TITLE",
    squashMergeCommitMessage: "COMMIT_MESSAGES",
    webCommitSignoffRequired: false,
  },
  {
    name: "aguimbao.me",
    description: "aguimbao.me",
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
    squashMergeCommitTitle: "COMMIT_OR_PR_TITLE",
    squashMergeCommitMessage: "COMMIT_MESSAGES",
    webCommitSignoffRequired: false,
  },
  {
    name: "42",
    description: "School 42 projects",
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
    homepageUrl: null,
    squashMergeCommitTitle: "COMMIT_OR_PR_TITLE",
    squashMergeCommitMessage: "COMMIT_MESSAGES",
    webCommitSignoffRequired: false,
  },
  {
    name: "aguimbao",
    description: "aguimbao",
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
    homepageUrl: null,
    squashMergeCommitTitle: "COMMIT_OR_PR_TITLE",
    squashMergeCommitMessage: "COMMIT_MESSAGES",
    webCommitSignoffRequired: false,
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
];
export const branchProtections: BranchProtectionConfig[] = [];
export const pages: PagesConfig[] = [];
export const webhooks: WebhookConfig[] = [];
export const environments: EnvironmentConfig[] = [
  {
    repository: "github-iac",
    environment: "ci",
    waitTimer: null,
  },
  {
    repository: "omniroute",
    environment: "ci",
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

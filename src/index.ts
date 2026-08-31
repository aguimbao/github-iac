import { createBranchProtections } from "./modules/branch-protections";
import { createRepositories } from "./modules/repositories";

// Repositories managed by this stack
const repos = createRepositories([
  {
    name: "github-iac",
    description: "Infrastructure as Code for aguimbao GitHub account",
    visibility: "public",
    hasIssues: true,
    hasProjects: false,
    hasWiki: false,
    deleteBranchOnMerge: true,
    allowSquashMerge: true,
    allowMergeCommit: false,
    allowRebaseMerge: false,
    topics: ["iac", "pulumi", "github", "automation"],
  },
]);

// Branch Protections
createBranchProtections(
  [
    {
      repository: "github-iac",
      pattern: "main",
      enforceAdmins: false,
      requiredLinearHistory: true,
      requireConversationResolution: true,
    },
  ],
  repos,
);

// Exports
export const managedRepositories = Array.from(repos.keys());

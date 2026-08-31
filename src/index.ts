import { loadConfig } from "./config";
import { createActionVariables } from "./modules/actions";
import { createAutolinks } from "./modules/autolinks";
import { createBranchProtections } from "./modules/branch-protections";
import { createCollaborators } from "./modules/collaborators";
import { createEnvironments } from "./modules/environments";
import { createDeployKeys, createUserGpgKeys, createUserSshKeys } from "./modules/keys";
import { createPages } from "./modules/pages";
import { createRepositories } from "./modules/repositories";
import { createRulesets } from "./modules/rulesets";
import { createWebhooks } from "./modules/webhooks";

const config = loadConfig();

// Repositories
export const repos = createRepositories(config.repositories);

// User Keys
export const userSshKeys = createUserSshKeys(config.sshKeys);
export const userGpgKeys = createUserGpgKeys(config.gpgKeys);

// Rulesets & Branch Protections
export const repoRulesets = createRulesets(config.rulesets, repos);
export const repoBranchProtections = createBranchProtections(
  config.branchProtections,
  repos,
);

// Pages & Integrations
export const repoPages = createPages(config.pages, repos);
export const repoWebhooks = createWebhooks(config.webhooks, repos);
export const repoEnvironments = createEnvironments(config.environments, repos);
export const repoCollaborators = createCollaborators(config.collaborators, repos);
export const repoAutolinks = createAutolinks(config.autolinks, repos);
export const repoDeployKeys = createDeployKeys(config.deployKeys, repos);
export const repoActionVariables = createActionVariables(config.actionVariables, repos);

// Exports
export const managedRepositories = Array.from(repos.keys());

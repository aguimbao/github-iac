import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as publicData from "./data";
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

export interface GithubIacConfig {
  repositories: RepositoryConfig[];
  sshKeys: UserSshKeyConfig[];
  gpgKeys: UserGpgKeyConfig[];
  rulesets: RulesetConfig[];
  branchProtections: BranchProtectionConfig[];
  pages: PagesConfig[];
  webhooks: WebhookConfig[];
  environments: EnvironmentConfig[];
  collaborators: CollaboratorConfig[];
  autolinks: AutolinkConfig[];
  deployKeys: DeployKeyConfig[];
  actionVariables: ActionVariableConfig[];
}

function loadPrivateConfig(): Partial<GithubIacConfig> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const possiblePaths = [
    path.resolve(process.cwd(), "data.private.json"),
    path.resolve(process.cwd(), "../data.private.json"),
    path.resolve(currentDir, "../data.private.json"),
    path.resolve(currentDir, "data.private.json"),
  ];

  for (const localPath of possiblePaths) {
    if (fs.existsSync(localPath)) {
      try {
        return JSON.parse(fs.readFileSync(localPath, "utf-8"));
      } catch {
        // Ignored if invalid JSON
      }
    }
  }

  return {};
}

export function loadConfig(): GithubIacConfig {
  const privateConfig = loadPrivateConfig();

  return {
    repositories: [...publicData.repositories, ...(privateConfig.repositories ?? [])],
    sshKeys: [...publicData.sshKeys, ...(privateConfig.sshKeys ?? [])],
    gpgKeys: [...publicData.gpgKeys, ...(privateConfig.gpgKeys ?? [])],
    rulesets: [...publicData.rulesets, ...(privateConfig.rulesets ?? [])],
    branchProtections: [
      ...publicData.branchProtections,
      ...(privateConfig.branchProtections ?? []),
    ],
    pages: [...publicData.pages, ...(privateConfig.pages ?? [])],
    webhooks: [...publicData.webhooks, ...(privateConfig.webhooks ?? [])],
    environments: [...publicData.environments, ...(privateConfig.environments ?? [])],
    collaborators: [...publicData.collaborators, ...(privateConfig.collaborators ?? [])],
    autolinks: [...publicData.autolinks, ...(privateConfig.autolinks ?? [])],
    deployKeys: [...publicData.deployKeys, ...(privateConfig.deployKeys ?? [])],
    actionVariables: [
      ...publicData.actionVariables,
      ...(privateConfig.actionVariables ?? []),
    ],
  };
}

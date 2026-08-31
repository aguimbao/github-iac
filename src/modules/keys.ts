import * as github from "@pulumi/github";

export interface UserSshKeyConfig {
  title: string;
  key: string;
}

export interface UserGpgKeyConfig {
  armoredPublicKey: string;
}

export interface DeployKeyConfig {
  repository: string;
  title: string;
  key: string;
  readOnly?: boolean;
}

export function createUserSshKeys(configs: UserSshKeyConfig[]): github.UserSshKey[] {
  return configs.map((cfg) => {
    return new github.UserSshKey(cfg.title, {
      title: cfg.title,
      key: cfg.key,
    });
  });
}

export function createUserGpgKeys(configs: UserGpgKeyConfig[]): github.UserGpgKey[] {
  return configs.map((cfg, index) => {
    return new github.UserGpgKey(`gpg-key-${index}`, {
      armoredPublicKey: cfg.armoredPublicKey,
    });
  });
}

export function createDeployKeys(
  configs: DeployKeyConfig[],
  repos: Map<string, github.Repository>,
): github.BranchProtection[] | github.RepositoryDeployKey[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.RepositoryDeployKey(`${cfg.repository}-${cfg.title}`, {
      repository,
      title: cfg.title,
      key: cfg.key,
      readOnly: cfg.readOnly ?? true,
    });
  });
}

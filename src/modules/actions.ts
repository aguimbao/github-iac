import * as github from "@pulumi/github";

export interface ActionVariableConfig {
  repository: string;
  variableName: string;
  value: string;
}

export interface ActionSecretConfig {
  repository: string;
  secretName: string;
  plaintextValue: string;
}

export function createActionVariables(
  configs: ActionVariableConfig[],
  repos: Map<string, github.Repository>,
): github.ActionsVariable[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.ActionsVariable(`${cfg.repository}-${cfg.variableName}`, {
      repository,
      variableName: cfg.variableName,
      value: cfg.value,
    });
  });
}

export function createActionSecrets(
  configs: ActionSecretConfig[],
  repos: Map<string, github.Repository>,
): github.ActionsSecret[] {
  return configs.map((cfg) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    return new github.ActionsSecret(`${cfg.repository}-${cfg.secretName}`, {
      repository,
      secretName: cfg.secretName,
      plaintextValue: cfg.plaintextValue,
    });
  });
}

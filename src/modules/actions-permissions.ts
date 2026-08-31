import * as github from "@pulumi/github";

export interface ActionsPermissionsConfig {
  repository: string;
  enabled?: boolean;
  allowedActions?: "all" | "local_only" | "selected";
}

export interface WorkflowPermissionsConfig {
  repository: string;
  canApprovePullRequestReviews?: boolean;
  defaultWorkflowPermissions?: "read" | "write";
}

export function createActionsPermissions(
  actionsConfigs: ActionsPermissionsConfig[],
  workflowConfigs: WorkflowPermissionsConfig[],
  repos: Map<string, github.Repository>,
): (github.ActionsRepositoryPermissions | github.WorkflowRepositoryPermissions)[] {
  const resources: (
    | github.ActionsRepositoryPermissions
    | github.WorkflowRepositoryPermissions
  )[] = [];

  for (const cfg of actionsConfigs) {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    resources.push(
      new github.ActionsRepositoryPermissions(`${cfg.repository}-actions-permissions`, {
        repository,
        enabled: cfg.enabled ?? true,
        allowedActions: cfg.allowedActions,
      }),
    );
  }

  for (const cfg of workflowConfigs) {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    resources.push(
      new github.WorkflowRepositoryPermissions(`${cfg.repository}-workflow-permissions`, {
        repository,
        canApprovePullRequestReviews: cfg.canApprovePullRequestReviews,
        defaultWorkflowPermissions: cfg.defaultWorkflowPermissions,
      }),
    );
  }

  return resources;
}

import * as github from "@pulumi/github";

export interface SecurityAlertsConfig {
  repository: string;
  vulnerabilityAlerts?: boolean;
  dependabotSecurityUpdates?: boolean;
}

export function createSecurityAlerts(
  configs: SecurityAlertsConfig[],
  repos: Map<string, github.Repository>,
): (github.RepositoryVulnerabilityAlerts | github.RepositoryDependabotSecurityUpdates)[] {
  const resources: (
    | github.RepositoryVulnerabilityAlerts
    | github.RepositoryDependabotSecurityUpdates
  )[] = [];

  for (const cfg of configs) {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;

    if (cfg.vulnerabilityAlerts !== undefined) {
      resources.push(
        new github.RepositoryVulnerabilityAlerts(`${cfg.repository}-vuln-alerts`, {
          repository,
          enabled: cfg.vulnerabilityAlerts,
        }),
      );
    }

    if (cfg.dependabotSecurityUpdates !== undefined) {
      resources.push(
        new github.RepositoryDependabotSecurityUpdates(
          `${cfg.repository}-dependabot-updates`,
          {
            repository,
            enabled: cfg.dependabotSecurityUpdates,
          },
        ),
      );
    }
  }

  return resources;
}

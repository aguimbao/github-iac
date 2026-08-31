import * as github from "@pulumi/github";

export interface WebhookConfig {
  repository: string;
  name?: string;
  url: string;
  contentType?: string;
  secret?: string;
  insecureSsl?: boolean;
  active?: boolean;
  events: string[];
}

export function createWebhooks(
  configs: WebhookConfig[],
  repos: Map<string, github.Repository>,
): github.RepositoryWebhook[] {
  return configs.map((cfg, index) => {
    const repo = repos.get(cfg.repository);
    const repository = repo ? repo.name : cfg.repository;
    const resourceName = cfg.name
      ? `${cfg.repository}-${cfg.name}`
      : `${cfg.repository}-webhook-${index}`;

    return new github.RepositoryWebhook(resourceName, {
      repository,
      active: cfg.active ?? true,
      events: cfg.events,
      configuration: {
        url: cfg.url,
        contentType: cfg.contentType ?? "json",
        secret: cfg.secret,
        insecureSsl: cfg.insecureSsl ?? false,
      },
    });
  });
}

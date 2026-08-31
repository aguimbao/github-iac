#!/usr/bin/env nu

def main [] {
  print "==> Inspecting GitHub account..."
  let user = (gh api user | from json | get login)
  print $"Authenticated as GitHub user: ($user)"

  # 1. User SSH & GPG keys
  print "==> Fetching User SSH and GPG keys..."
  let ssh_keys = (try { gh api user/keys | from json } catch { [] })
  let gpg_keys = (try { gh api user/gpg_keys | from json } catch { [] })
  print $"Found ($ssh_keys | length) SSH keys, ($gpg_keys | length) GPG keys."

  # 2. Repositories
  print "==> Fetching user repositories..."
  let repo_names = (gh repo list $user --limit 1000 --json name,isFork | from json | where not isFork | get name)
  print $"Found ($repo_names | length) repositories."

  mut public_repo_configs = []
  mut private_repo_configs = []

  mut public_ruleset_configs = []
  mut private_ruleset_configs = []

  mut public_bp_configs = []
  mut private_bp_configs = []

  mut public_pages_configs = []
  mut private_pages_configs = []

  mut public_webhook_configs = []
  mut private_webhook_configs = []

  mut public_env_configs = []
  mut private_env_configs = []

  mut public_collab_configs = []
  mut private_collab_configs = []

  mut public_autolink_configs = []
  mut private_autolink_configs = []

  mut public_action_var_configs = []
  mut private_action_var_configs = []

  mut public_deploy_key_configs = []
  mut private_deploy_key_configs = []

  mut all_discovered_resources = []

  # Add SSH Keys
  for key in $ssh_keys {
    $all_discovered_resources = ($all_discovered_resources | append {
      type: "github:index/userSshKey:UserSshKey",
      name: $key.title,
      id: ($key.id | into string)
    })
  }

  # Add GPG Keys
  for key in $gpg_keys {
    $all_discovered_resources = ($all_discovered_resources | append {
      type: "github:index/userGpgKey:UserGpgKey",
      name: $"gpg-key-($key.key_id)",
      id: ($key.id | into string)
    })
  }

  for repo_name in $repo_names {
    print $"Fetching details for ($repo_name)..."
    let r = (gh api $"repos/($user)/($repo_name)" | from json)
    let is_public = ($r.visibility == "public" or $r.name == "github-iac")

    let repo_item = {
      name: $r.name,
      description: (if ($r.description | is-empty) { null } else { $r.description }),
      visibility: $r.visibility,
      hasIssues: ($r.has_issues | default true),
      hasProjects: ($r.has_projects | default false),
      hasWiki: ($r.has_wiki | default false),
      hasDiscussions: ($r.has_discussions | default false),
      allowSquashMerge: ($r.allow_squash_merge | default true),
      allowMergeCommit: ($r.allow_merge_commit | default true),
      allowRebaseMerge: ($r.allow_rebase_merge | default true),
      allowAutoMerge: ($r.allow_auto_merge | default false),
      allowUpdateBranch: ($r.allow_update_branch | default null),
      deleteBranchOnMerge: ($r.delete_branch_on_merge | default false),
      isTemplate: ($r.is_template | default false),
      archived: ($r.archived | default false),
      topics: ($r.topics | default []),
      homepageUrl: (if ($r.homepage | is-empty) { null } else { $r.homepage }),
      squashMergeCommitTitle: ($r.squash_merge_commit_title | default null),
      squashMergeCommitMessage: ($r.squash_merge_commit_message | default null),
      webCommitSignoffRequired: ($r.web_commit_signoff_required | default null)
    }

    if $is_public {
      $public_repo_configs = ($public_repo_configs | append $repo_item)
    } else {
      $private_repo_configs = ($private_repo_configs | append $repo_item)
    }

    $all_discovered_resources = ($all_discovered_resources | append {
      type: "github:index/repository:Repository",
      name: $r.name,
      id: $r.name
    })

    # Fetch Rulesets
    let rulesets = (try { gh api $"repos/($user)/($repo_name)/rulesets" | from json } catch { [] })
    for rs_summary in $rulesets {
      let rs_detail = (gh api $"repos/($user)/($repo_name)/rulesets/($rs_summary.id)" | from json)
      let rs_name = $"($repo_name)-($rs_detail.name)"

      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/repositoryRuleset:RepositoryRuleset",
        name: $rs_name,
        id: $"($repo_name):($rs_summary.id)"
      })

      # Build ruleset config for TS
      mut rules_obj = {}
      for rule in ($rs_detail.rules | default []) {
        if $rule.type == "deletion" {
          $rules_obj = ($rules_obj | insert deletion true)
        } else if $rule.type == "creation" {
          $rules_obj = ($rules_obj | insert creation true)
        } else if $rule.type == "non_fast_forward" {
          $rules_obj = ($rules_obj | insert nonFastForward true)
        } else if $rule.type == "required_signatures" {
          $rules_obj = ($rules_obj | insert requiredSignatures true)
        } else if $rule.type == "required_linear_history" {
          $rules_obj = ($rules_obj | insert requiredLinearHistory true)
        } else if $rule.type == "pull_request" {
          $rules_obj = ($rules_obj | insert pullRequest {
            requiredApprovingReviewCount: ($rule.parameters?.required_approving_review_count | default 0),
            dismissStaleReviewsOnPush: ($rule.parameters?.dismiss_stale_reviews_on_push | default false),
            requireCodeOwnerReview: ($rule.parameters?.require_code_owner_review | default false),
            requireLastPushApproval: ($rule.parameters?.require_last_push_approval | default false),
            requiredReviewThreadResolution: ($rule.parameters?.required_review_thread_resolution | default false),
            allowedMergeMethods: ($rule.parameters?.allowed_merge_methods | default ["merge", "squash", "rebase"])
          })
        } else if $rule.type == "required_status_checks" {
          $rules_obj = ($rules_obj | insert requiredStatusChecks {
            strictRequiredStatusChecksPolicy: ($rule.parameters?.strict_required_status_checks_policy | default true),
            doNotEnforceOnCreate: ($rule.parameters?.do_not_enforce_on_create | default false),
            requiredChecks: ($rule.parameters?.required_status_checks | default [] | each {|chk|
              {
                context: $chk.context,
                integrationId: $chk.integration_id
              }
            })
          })
        } else if $rule.type == "code_scanning" {
          $rules_obj = ($rules_obj | insert requiredCodeScanning {
            requiredCodeScanningTools: ($rule.parameters?.code_scanning_tools | default [] | each {|tool|
              {
                tool: $tool.tool,
                securityAlertsThreshold: $tool.security_alerts_threshold,
                alertsThreshold: $tool.alerts_threshold
              }
            })
          })
        }
      }

      let bypass = ($rs_detail.bypass_actors | default [] | each {|b|
        {
          actorId: $b.actor_id,
          actorType: $b.actor_type,
          bypassMode: $b.bypass_mode
        }
      })

      let rs_item = {
        name: $rs_detail.name,
        repository: $repo_name,
        target: $rs_detail.target,
        enforcement: $rs_detail.enforcement,
        conditions: {
          refName: {
            includes: ($rs_detail.conditions?.ref_name?.include | default []),
            excludes: ($rs_detail.conditions?.ref_name?.exclude | default [])
          }
        },
        bypassActors: $bypass,
        rules: $rules_obj
      }

      if $is_public {
        $public_ruleset_configs = ($public_ruleset_configs | append $rs_item)
      } else {
        $private_ruleset_configs = ($private_ruleset_configs | append $rs_item)
      }
    }

    # Fetch Pages
    let pages_info = (try { gh api $"repos/($user)/($repo_name)/pages" | from json } catch { null })
    if ($pages_info != null) {
      let pg_item = {
        repository: $repo_name,
        branch: ($pages_info.source?.branch | default "main"),
        path: ($pages_info.source?.path | default "/"),
        cname: $pages_info.cname
      }
      if $is_public {
        $public_pages_configs = ($public_pages_configs | append $pg_item)
      } else {
        $private_pages_configs = ($private_pages_configs | append $pg_item)
      }
      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/repositoryPages:RepositoryPages",
        name: $"($repo_name)-pages",
        id: $repo_name
      })
    }

    # Fetch Webhooks
    let hooks = (try { gh api $"repos/($user)/($repo_name)/hooks" | from json } catch { [] })
    for h in $hooks {
      let wh_item = {
        repository: $repo_name,
        name: ($h.name | default $"hook-($h.id)"),
        url: $h.config?.url,
        contentType: ($h.config?.content_type | default "json"),
        insecureSsl: ($h.config?.insecure_ssl == "1"),
        active: $h.active,
        events: $h.events
      }
      if $is_public {
        $public_webhook_configs = ($public_webhook_configs | append $wh_item)
      } else {
        $private_webhook_configs = ($private_webhook_configs | append $wh_item)
      }
      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/repositoryWebhook:RepositoryWebhook",
        name: $"($repo_name)-webhook-($h.id)",
        id: $"($repo_name):($h.id)"
      })
    }

    # Fetch Environments
    let envs = (try { gh api $"repos/($user)/($repo_name)/environments" | from json | get environments } catch { [] })
    for e in $envs {
      mut wait_timer = null
      let wt_rules = ($e.protection_rules | default [] | where type == "wait_timer")
      if ($wt_rules | is-not-empty) {
        $wait_timer = ($wt_rules | first | get wait_timer)
      }
      let env_item = {
        repository: $repo_name,
        environment: $e.name,
        waitTimer: $wait_timer
      }
      if $is_public {
        $public_env_configs = ($public_env_configs | append $env_item)
      } else {
        $private_env_configs = ($private_env_configs | append $env_item)
      }
      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/repositoryEnvironment:RepositoryEnvironment",
        name: $"($repo_name)-($e.name)",
        id: $"($repo_name):($e.name)"
      })
    }

    # Fetch Collaborators (direct)
    let collabs = (try { gh api $"repos/($user)/($repo_name)/collaborators?affiliation=direct" | from json } catch { [] })
    for c in $collabs {
      if $c.login != $user {
        let col_item = {
          repository: $repo_name,
          username: $c.login,
          permission: (if $c.permissions?.admin { "admin" } else if $c.permissions?.maintain { "maintain" } else if $c.permissions?.push { "push" } else if $c.permissions?.triage { "triage" } else { "pull" })
        }
        if $is_public {
          $public_collab_configs = ($public_collab_configs | append $col_item)
        } else {
          $private_collab_configs = ($private_collab_configs | append $col_item)
        }
        $all_discovered_resources = ($all_discovered_resources | append {
          type: "github:index/repositoryCollaborator:RepositoryCollaborator",
          name: $"($repo_name)-($c.login)",
          id: $"($repo_name):($c.login)"
        })
      }
    }

    # Fetch Autolinks
    let autolinks = (try { gh api $"repos/($user)/($repo_name)/autolinks" | from json } catch { [] })
    for al in $autolinks {
      let al_item = {
        repository: $repo_name,
        keyPrefix: $al.key_prefix,
        targetUrlTemplate: $al.url_template,
        isAlphanumeric: $al.is_alphanumeric
      }
      if $is_public {
        $public_autolink_configs = ($public_autolink_configs | append $al_item)
      } else {
        $private_autolink_configs = ($private_autolink_configs | append $al_item)
      }
      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/repositoryAutolinkReference:RepositoryAutolinkReference",
        name: $"($repo_name)-($al.key_prefix)",
        id: $"($repo_name):($al.id)"
      })
    }

    # Fetch Deploy Keys
    let keys = (try { gh api $"repos/($user)/($repo_name)/keys" | from json } catch { [] })
    for k in $keys {
      let dk_item = {
        repository: $repo_name,
        title: $k.title,
        key: $k.key,
        readOnly: $k.read_only
      }
      if $is_public {
        $public_deploy_key_configs = ($public_deploy_key_configs | append $dk_item)
      } else {
        $private_deploy_key_configs = ($private_deploy_key_configs | append $dk_item)
      }
      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/repositoryDeployKey:RepositoryDeployKey",
        name: $"($repo_name)-($k.title)",
        id: $"($repo_name):($k.id)"
      })
    }

    # Fetch Actions Variables
    let vars = (try { gh api $"repos/($user)/($repo_name)/actions/variables" | from json | get variables } catch { [] })
    for v in $vars {
      let var_item = {
        repository: $repo_name,
        variableName: $v.name,
        value: $v.value
      }
      if $is_public {
        $public_action_var_configs = ($public_action_var_configs | append $var_item)
      } else {
        $private_action_var_configs = ($private_action_var_configs | append $var_item)
      }
      $all_discovered_resources = ($all_discovered_resources | append {
        type: "github:index/actionsVariable:ActionsVariable",
        name: $"($repo_name)-($v.name)",
        id: $"($repo_name):($v.name)"
      })
    }
  }

  # Generate public TypeScript data file src/data.ts
  let repo_json = ($public_repo_configs | to json)
  let ssh_json = ($ssh_keys | each {|k| { title: $k.title, key: $k.key } } | to json)
  let gpg_json = ($gpg_keys | each {|k| { armoredPublicKey: $k.raw_key } } | to json)
  let rs_json = ($public_ruleset_configs | to json)
  let bp_json = ($public_bp_configs | to json)
  let pages_json = ($public_pages_configs | to json)
  let hook_json = ($public_webhook_configs | to json)
  let env_json = ($public_env_configs | to json)
  let collab_json = ($public_collab_configs | to json)
  let autolink_json = ($public_autolink_configs | to json)
  let deploy_key_json = ($public_deploy_key_configs | to json)
  let action_var_json = ($public_action_var_configs | to json)

  let ts_content = $"import type { ActionVariableConfig } from \"./modules/actions\";
import type { AutolinkConfig } from \"./modules/autolinks\";
import type { BranchProtectionConfig } from \"./modules/branch-protections\";
import type { CollaboratorConfig } from \"./modules/collaborators\";
import type { EnvironmentConfig } from \"./modules/environments\";
import type { DeployKeyConfig, UserGpgKeyConfig, UserSshKeyConfig } from \"./modules/keys\";
import type { PagesConfig } from \"./modules/pages\";
import type { RepositoryConfig } from \"./modules/repositories\";
import type { RulesetConfig } from \"./modules/rulesets\";
import type { WebhookConfig } from \"./modules/webhooks\";

export const repositories: RepositoryConfig[] = ($repo_json);
export const sshKeys: UserSshKeyConfig[] = ($ssh_json);
export const gpgKeys: UserGpgKeyConfig[] = ($gpg_json);
export const rulesets: RulesetConfig[] = ($rs_json);
export const branchProtections: BranchProtectionConfig[] = ($bp_json);
export const pages: PagesConfig[] = ($pages_json);
export const webhooks: WebhookConfig[] = ($hook_json);
export const environments: EnvironmentConfig[] = ($env_json);
export const collaborators: CollaboratorConfig[] = ($collab_json);
export const autolinks: AutolinkConfig[] = ($autolink_json);
export const deployKeys: DeployKeyConfig[] = ($deploy_key_json);
export const actionVariables: ActionVariableConfig[] = ($action_var_json);
"

  $ts_content | save -f "src/data.ts"
  print "==> Generated public src/data.ts"

  # Generate private JSON file data.private.json
  let private_data = {
    repositories: $private_repo_configs,
    sshKeys: [],
    gpgKeys: [],
    rulesets: $private_ruleset_configs,
    branchProtections: $private_bp_configs,
    pages: $private_pages_configs,
    webhooks: $private_webhook_configs,
    environments: $private_env_configs,
    collaborators: $private_collab_configs,
    autolinks: $private_autolink_configs,
    deployKeys: $private_deploy_key_configs,
    actionVariables: $private_action_var_configs
  }

  $private_data | to json | save -f "data.private.json"
  print "==> Saved private configuration to data.private.json (gitignored)"

  # Determine resources to import (filtering out already imported in stack)
  let existing_urns = (try {
    ^pulumi stack export | from json | get deployment.resources | each {|r| $r.urn }
  } catch { [] })

  let pending_imports = ($all_discovered_resources | where {|res|
    let expected_suffix = $"::($res.type)::($res.name)"
    let already_imported = ($existing_urns | any {|u| ($u | str ends-with $expected_suffix) })
    (not $already_imported)
  })

  if ($pending_imports | is-empty) {
    print "==> All discovered resources already imported in Pulumi state."
  } else {
    print $"==> Importing ($pending_imports | length) new resources into Pulumi..."
    let import_manifest = { resources: $pending_imports }
    $import_manifest | to json | save -f "scripts/pulumi-import.json"
    ^pulumi import --file scripts/pulumi-import.json --protect=false -y
    print "==> Pulumi import complete."
  }
}

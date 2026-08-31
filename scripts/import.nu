#!/usr/bin/env nu

# One-time bootstrap script to inspect GitHub account and generate Pulumi resources & import statements

def main [] {
  print "Fetching repositories for current authenticated user..."
  let repos_raw = (gh repo list --limit 1000 --json name,description,isPrivate,hasIssuesEnabled,hasProjectsEnabled,hasWikiEnabled,deleteBranchOnMerge,squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,autoMergeAllowed,isArchived,isTemplate,repositoryTopics,homepageUrl | from json)

  print $"Found ($repos_raw | length) repositories."

  let formatted_repos = ($repos_raw | each {|r|
    {
      name: $r.name,
      description: ($r.description | default ""),
      visibility: (if $r.isPrivate { "private" } else { "public" }),
      hasIssues: $r.hasIssuesEnabled,
      hasProjects: $r.hasProjectsEnabled,
      hasWiki: $r.hasWikiEnabled,
      deleteBranchOnMerge: $r.deleteBranchOnMerge,
      allowSquashMerge: $r.squashMergeAllowed,
      allowMergeCommit: $r.mergeCommitAllowed,
      allowRebaseMerge: $r.rebaseMergeAllowed,
      allowAutoMerge: $r.autoMergeAllowed,
      isTemplate: $r.isTemplate,
      archived: $r.isArchived,
      topics: ($r.repositoryTopics | default [] | each {|t| $t.name }),
      homepageUrl: ($r.homepageUrl | default "")
    }
  })

  $formatted_repos | to json | save -f "scripts/discovered_repos.json"
  print "Saved repository metadata to scripts/discovered_repos.json"
  print "Ready for Pulumi import stage."
}

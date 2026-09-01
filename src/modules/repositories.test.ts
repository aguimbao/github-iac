import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractAboutFromReadme } from "./repositories";

describe("extractAboutFromReadme", () => {
  it("extracts text and strips markdown links", () => {
    const readme = `# github-iac

Infrastructure as Code for GitHub account management via [Pulumi](https://www.pulumi.com/), driven by [mise](https://mise.jdx.dev) and [fnox](https://github.com/jdx/fnox).

## Prerequisites
`;
    assert.equal(
      extractAboutFromReadme(readme),
      "Infrastructure as Code for GitHub account management via Pulumi, driven by mise and fnox.",
    );
  });

  it("returns empty string when there is no text between headers", () => {
    const readme = `# my-project

## Dynamic Header
`;
    assert.equal(extractAboutFromReadme(readme), "");
  });

  it("handles multi-line descriptions", () => {
    const readme = `# omniroute

OmniRoute service, uses [mise](https://mise.jdx.dev) for dependencies,
[fnox](https://github.com/jdx/fnox) for secret handling and podman + pitchfork container / daemon management.

## Installation
`;
    assert.equal(
      extractAboutFromReadme(readme),
      "OmniRoute service, uses mise for dependencies, fnox for secret handling and podman + pitchfork container / daemon management.",
    );
  });

  it("returns empty string for empty content or missing top-level header", () => {
    assert.equal(extractAboutFromReadme(""), "");
    assert.equal(extractAboutFromReadme("## Subheader only\n\nSome text"), "");
  });

  it("handles content without subheaders", () => {
    const readme = `# standalone-project

Standalone tool with [link](https://example.com).`;
    assert.equal(extractAboutFromReadme(readme), "Standalone tool with link.");
  });

  it("handles CRLF line endings and multiple links", () => {
    const readme =
      "# win-project\r\n\r\nUses [toolA](http://a.com) and [toolB](http://b.com).\r\n\r\n## Next";
    assert.equal(extractAboutFromReadme(readme), "Uses toolA and toolB.");
  });
});

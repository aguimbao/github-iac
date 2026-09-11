import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as data from "../../../../src/data.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../../");
const reposModulePath = path.join(repoRoot, "src/modules/repositories.ts");

interface FieldInfo {
  name: string;
  type: string;
  optional: boolean;
  templateDefault?: unknown;
  providerDefault?: string;
}

function extractInterfaceFields(filePath: string, interfaceName: string): FieldInfo[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(
    new RegExp(`export\\s+interface\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\}`, "m"),
  );
  if (!match) return [];
  const fields: FieldInfo[] = [];
  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("/*") || line.startsWith("*"))
      continue;
    const m = line.match(/^([a-zA-Z0-9_]+)(\?)?:\s*(.+?);?$/);
    if (m)
      fields.push({
        name: m[1],
        optional: m[2] === "?",
        type: m[3].replace(/;$/, "").trim(),
      });
  }
  return fields;
}

function extractProviderDefaults(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, "utf-8");
  const out: Record<string, string> = {};
  for (const m of content.matchAll(/cfg\.([a-zA-Z0-9_]+)\s*\?\?\s*([^,\n}]+)/g)) {
    if (!(m[1] in out)) out[m[1]] = m[2].trim();
  }
  return out;
}

function groupBy<T>(
  items: T[],
  key: (t: T) => string,
): { usedBy: string[]; template: unknown }[] {
  const map = new Map<string, { usedBy: string[]; template: unknown }>();
  for (const item of items) {
    const k = key(item);
    const entry = map.get(k);
    if (entry)
      entry.usedBy.push(
        (item as Record<string, string>).repository ??
          (item as Record<string, string>).name,
      );
    else
      map.set(k, {
        usedBy: [
          (item as Record<string, string>).repository ??
            (item as Record<string, string>).name,
        ],
        template: item,
      });
  }
  return [...map.values()];
}

const repos = data.repositories as Record<string, unknown>[];
const templateRepo = (repos.find((r) => r.name === "repository-template") ??
  repos[0]) as Record<string, unknown>;
const providerDefaults = extractProviderDefaults(reposModulePath);

const repositoryFields: FieldInfo[] = extractInterfaceFields(
  reposModulePath,
  "RepositoryConfig",
).map((f) => ({
  ...f,
  templateDefault: templateRepo ? (templateRepo[f.name] ?? null) : null,
  providerDefault: providerDefaults[f.name],
}));

const rulesets = (data as Record<string, unknown>).rulesets as Record<string, unknown>[];
const stripRepo = ({ repository, ...rest }: Record<string, unknown>) => rest;
const rulesetVariants = groupBy(rulesets, (r) =>
  JSON.stringify(stripRepo(r as Record<string, unknown>)),
).map((v) => ({
  usedBy: v.usedBy,
  template: { ...(v.template as Record<string, unknown>), repository: "<NEW_REPO_NAME>" },
}));

const stripName = ({ name, ...rest }: Record<string, unknown>) => rest;
const repositoryVariants = groupBy(repos, (r) =>
  JSON.stringify(stripName(r as Record<string, unknown>)),
).map((v) => ({
  usedBy: v.usedBy,
  template: v.template,
}));

function discoverAssociatedModules(): {
  name: string;
  file: string;
  interface: string;
}[] {
  const configPath = path.join(repoRoot, "src/config.ts");
  const configSrc = fs.readFileSync(configPath, "utf-8");
  const typeToFile = new Map<string, string>();
  for (const m of configSrc.matchAll(
    /import\s+type\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
  )) {
    const rel = m[2].replace(/^\.\//, "src/").replace(/\.ts$/, ".ts");
    for (const t of m[1].split(",")) {
      const typeName = t.trim();
      if (typeName) typeToFile.set(typeName, rel.endsWith(".ts") ? rel : `${rel}.ts`);
    }
  }
  const ifaceMatch = configSrc.match(/interface\s+GithubIacConfig\s*\{([\s\S]*?)\}/m);
  const out: { name: string; file: string; interface: string }[] = [];
  if (!ifaceMatch) return out;
  for (const rawLine of ifaceMatch[1].split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;
    const fm = line.match(/^([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)(\[\])?/);
    if (!fm) continue;
    const [, key, typeName] = fm;
    if (key === "repositories") continue;
    const file = typeToFile.get(typeName);
    if (file) out.push({ name: key, file, interface: typeName });
  }
  return out;
}

const associatedModules = discoverAssociatedModules();

const associatedResources: Record<string, FieldInfo[]> = {};
for (const m of associatedModules) {
  const p = path.join(repoRoot, m.file);
  if (fs.existsSync(p)) {
    const fields = extractInterfaceFields(p, m.interface);
    if (fields.some((f) => f.name === "repository")) associatedResources[m.name] = fields;
  }
}

const associatedResourceExamples: Record<string, unknown> = {};
for (const m of Object.keys(associatedResources)) {
  const arr = (data as Record<string, unknown>)[m];
  if (Array.isArray(arr)) associatedResourceExamples[m] = arr;
}

console.log(
  JSON.stringify(
    {
      existingRepositories: repos.map((r) => r.name),
      repositoryFields,
      descriptionNote:
        "description in RepositoryConfig is IGNORED at apply time: createRepositories() re-extracts it from each repo README (extractAboutFromReadme). Do not prompt for it as a stored setting.",
      repositoryVariants,
      rulesetVariants,
      associatedResources,
      associatedResourceExamples,
    },
    null,
    2,
  ),
);

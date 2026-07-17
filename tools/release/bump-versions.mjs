import fs from "node:fs";

const targets = (process.argv[2] ?? "").trim();
const releaseType = (process.argv[3] ?? "").trim().toLowerCase();
const skipRoot = process.argv.slice(4).includes("--skip-root");

const has = (t) => ("," + targets + ",").includes("," + t + ",");

// Validate releaseType
if (!["minor", "major"].includes(releaseType)) {
  console.error(`ERROR: Invalid release_type '${releaseType}'. Use minor|major`);
  process.exit(1);
}

console.log(`Bumping versions with release_type: ${releaseType}`);

const bumpSemver = (v) => {
  const [majS, minS, patS] = v.split(".");
  let major = Number(majS);
  let minor = Number(minS);
  let patch = Number((patS ?? "0").replace(/[^0-9].*$/, ""));

  if (releaseType === "minor") {
    minor += 1;
    patch = 0;
  } else if (releaseType === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else {
    throw new Error(`Invalid releaseType: ${releaseType}`);
  }
  return `${major}.${minor}.${patch}`;
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writeJson = (p, j) => fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");

// 1) bump root package.json version unless this is an independent package release
if (!skipRoot) {
  const p = "package.json";
  const j = readJson(p);
  const next = bumpSemver(j.version);
  j.version = next;
  writeJson(p, j);
  console.log(`[root] ${next}`);
} else {
  console.log("[root] skipped");
}

// 2) bump selected libs versions
const libs = [
  ["cdk", "libs/tailng-ui/cdk/package.json", "@tailng-ui/cdk"],
  ["primitives", "libs/tailng-ui/primitives/package.json", "@tailng-ui/primitives"],
  ["components", "libs/tailng-ui/components/package.json", "@tailng-ui/components"],
  ["theme", "libs/tailng-ui/theme/package.json", "@tailng-ui/theme"],
  ["icons", "libs/tailng-ui/icons/package.json", "@tailng-ui/icons"],
  ["registry", "libs/tailng-ui/registry/package.json", "@tailng-ui/registry"],
  ["charts", "libs/tailng-ui/charts/package.json", "@tailng-ui/charts"],
  ["flow", "libs/tailng-ui/flow/package.json", "@tailng-ui/flow"],
  ["cli", "libs/tailng/cli/package.json", "tailng"],
];

for (const [key, path, label] of libs) {
  if (!has(key)) continue;
  const j = readJson(path);
  const next = bumpSemver(j.version);
  j.version = next;
  writeJson(path, j);
  console.log(`[pkg] ${label} -> ${next}`);
}

// workspace:^ peer deps (e.g. primitives → cdk, components → cdk + primitives)
// are resolved to concrete semver ranges at publish time by rewriteWorkspaceProtocols
// in publish-selected.mjs. No rewriting needed here — keeping workspace:^ in the
// source preserves pnpm lockfile consistency.

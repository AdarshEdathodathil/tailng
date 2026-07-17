import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  assertNoWorkspaceProtocols,
  collectPackageVersions as collectPackageVersionsFromFiles,
  fail,
  readJson,
  rewriteWorkspaceProtocols,
} from "./package-manifest-utils.mjs";

const targets = (
  process.env.TARGETS?.replace(/^,|,$/g, "") ??
  (process.argv[2] ?? "")
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .join(",");

const npmTag = (process.argv[3] ?? "latest").trim();

if (!targets) {
  console.error("publish-selected: targets is empty");
  process.exit(1);
}

if (/(\s)/.test(targets)) {
  console.error(
    `publish-selected: targets must be comma-separated without spaces. Received: "${targets}"`,
  );
  process.exit(1);
}

// NOTE: targets are expected to be comma-separated with no spaces.
const has = (t) => ("," + targets + ",").includes("," + t + ",");

const run = (cmd, cwd) =>
  execSync(cmd, {
    stdio: "inherit",
    cwd,
    env: { ...process.env },
  });

function resolvePackageVersions() {
  return collectPackageVersionsFromFiles(DIST_DIR, [
    "libs/tailng-ui/cdk/package.json",
    "libs/tailng-ui/primitives/package.json",
    "libs/tailng-ui/components/package.json",
    "libs/tailng-ui/icons/package.json",
    "libs/tailng-ui/theme/package.json",
    "libs/tailng-ui/registry/package.json",
    "libs/tailng-ui/charts/package.json",
    "libs/tailng-ui/flow/package.json",
    "libs/tailng/cli/package.json",
  ]);
}

function isAlreadyPublished(name, version) {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
    stdio: "pipe",
    encoding: "utf8",
    timeout: 30_000,
  });
  return result.status === 0 && result.stdout.trim() === version;
}

const publish = (dir) => {
  if (!fs.existsSync(dir)) {
    fail(`Publish directory not found: ${dir}`);
  }

  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) {
    fail(`Missing package.json in publish directory: ${dir}`);
  }

  const pkg = readJson(pkgPath);
  rewriteWorkspaceProtocols(pkg, pkgPath, packageVersions);
  const publishPkg = readJson(pkgPath);
  const name = publishPkg.name ?? dir;
  const version = publishPkg.version ?? "";

  assertNoWorkspaceProtocols(publishPkg, dir);

  if (isAlreadyPublished(name, version)) {
    console.log(`⏭  ${name}@${version} already published — skipping`);
    return;
  }

  console.log(`Publishing ${name}@${version} with tag ${npmTag}`);

  const cmdParts = ["npm publish", "--access public", `--tag ${npmTag}`];

  // If CI=true, request npm provenance (Trusted Publishing / OIDC compatible).
  if (process.env.CI === "true") {
    cmdParts.push("--provenance");
  }

  const cmd = cmdParts.join(" ");

  if (process.env.DRY_RUN === "true") {
    console.log(`DRY_RUN=true, skipping: ${cmd} (cwd: ${dir})`);
    return;
  }

  run(cmd, dir);
};

// Target -> dist directory mapping (publish from dist output)
// Nx outputs in this repo are under dist/libs/tailng-ui/* (and dist/libs/tailng/* for cli).
const DIST_DIR = {
  cdk: "dist/libs/tailng-ui/cdk",
  primitives: "dist/libs/tailng-ui/primitives",
  components: "dist/libs/tailng-ui/components",
  icons: "dist/libs/tailng-ui/icons",
  theme: "dist/libs/tailng-ui/theme",
  registry: "dist/libs/tailng-ui/registry",
  charts: "dist/libs/tailng-ui/charts",
  flow: "dist/libs/tailng-ui/flow",
  cli: "dist/libs/tailng/cli",
};

// Publish in dependency order:
// - primitives depends on cdk
// - components depends on primitives
// - others are effectively independent (icons/theme are often peer deps)
const ORDER = [
  // dependency order
  "cdk",
  "primitives",
  "components",

  // mostly independent
  "icons",
  "theme",
  "registry",
  "charts",
  "flow",
  "cli",
];

const packageVersions = resolvePackageVersions();

for (const t of ORDER) {
  if (!has(t)) continue;

  const dir = DIST_DIR[t];
  if (!dir) {
    fail(`No dist mapping for target '${t}'. Update DIST_DIR.`);
  }

  publish(dir);
}

console.log("publish-selected: done");

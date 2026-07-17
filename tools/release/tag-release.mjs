import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function runSilent(cmd) {
  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function fail(msg) {
  console.error(`tag-release: ${msg}`);
  process.exit(1);
}

const envFile = process.env.GITHUB_ENV;
if (!envFile) {
  fail("GITHUB_ENV is not set (this script is intended to run inside GitHub Actions)");
}

const manifestPath = process.argv[2] ?? "package.json";
const tagPrefix = process.argv[3] ?? "v";
const outputPrefix = process.argv[4] ?? "ROOT";

if (!/^[A-Z][A-Z0-9_]*$/.test(outputPrefix)) {
  fail(`Invalid output prefix '${outputPrefix}'`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const version = String(manifest.version ?? "").trim();
if (!version) {
  fail(`${manifestPath} has no version`);
}

const tag = `${tagPrefix}${version}`;

// Ensure we have an up-to-date view of tags (local CI clones can be shallow).
run("git fetch --tags --force");

const hasLocalTag = runSilent(`git rev-parse -q --verify "refs/tags/${tag}"`);

if (!hasLocalTag) {
  // Create an annotated tag.
  run(`git tag -a "${tag}" -m "Release ${tag}"`);
  console.log(`[tag] created ${tag}`);
} else {
  console.log(`[tag] ${tag} already exists locally`);
}

// Push the tag. If it already exists on origin, this will be a no-op / fail.
// Treat "already exists" as success.
try {
  run(`git push origin "${tag}"`);
  console.log(`[tag] pushed ${tag} to origin`);
} catch (err) {
  // If the tag already exists remotely, pushing can fail with non-zero.
  // Re-check by fetching and verifying; if it exists, proceed.
  run("git fetch --tags --force");
  const existsAfter = runSilent(`git rev-parse -q --verify "refs/tags/${tag}"`);
  if (!existsAfter) {
    throw err;
  }
  console.log(`[tag] ${tag} already exists on origin; continuing`);
}

// Export for later steps
fs.appendFileSync(envFile, `${outputPrefix}_VERSION=${version}\n`);
fs.appendFileSync(envFile, `${outputPrefix}_TAG=${tag}\n`);

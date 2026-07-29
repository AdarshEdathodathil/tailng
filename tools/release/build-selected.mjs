import { execSync } from "node:child_process";

const targets = (process.argv[2] ?? "").trim();
const selected = new Set(
  targets
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);
// Avoid Node's ESM loading race when Nx scans Vitest configs concurrently.
const nodeOptions = [process.env.NODE_OPTIONS, "--import=vite-tsconfig-paths"]
  .filter(Boolean)
  .join(" ");

const run = (cmd) =>
  execSync(cmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
      NX_DAEMON: "false",
      NX_ISOLATE_PLUGINS: "false",
    },
  });
const wants = (t) => selected.has(t);

run("pnpm nx reset");

if (wants("cdk")) run("pnpm nx build cdk --skip-nx-cache");
if (wants("primitives")) run("pnpm nx build primitives --skip-nx-cache");
if (wants("components")) run("pnpm nx build components --skip-nx-cache");
if (wants("theme")) run("pnpm nx build theme --skip-nx-cache");
if (wants("icons")) run("pnpm nx build icons --skip-nx-cache");
if (wants("registry") || wants("cli")) run("pnpm nx build registry --skip-nx-cache");
if (wants("charts")) run("pnpm nx build charts --skip-nx-cache");
if (wants("flow")) run("pnpm nx build flow --skip-nx-cache");

// CLI (keeps your historical target name)
if (wants("cli")) run("pnpm nx run tailng-cli:build --skip-nx-cache");

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const targets = process.argv[2] ?? "";
const selected = targets
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const dist = path.resolve("dist", "libs");

const TAILNG_UI = "tailng-ui";
const TAILNG = "tailng";

const resolveDistDir = (target) => {
  // Nx outputs TailNG UI libs under dist/libs/tailng-ui/<name>
  if (["cdk", "primitives", "components", "icons", "theme", "registry", "charts", "flow"].includes(target)) {
    return path.join(dist, TAILNG_UI, target);
  }

  // TailNG org packages (if selected)
  if (["cli"].includes(target)) {
    return path.join(dist, TAILNG, target);
  }

  return null;
};

const isPackTarget = (t) =>
  ["cdk", "primitives", "components", "icons", "theme", "registry", "charts", "flow", "cli"].includes(t);

for (const t of selected) {
  if (!isPackTarget(t)) continue;

  const dir = resolveDistDir(t);
  if (dir === null) continue;

  if (!fs.existsSync(dir)) {
    console.error(`npm-pack-dry-run: missing dist folder ${dir}`);
    process.exit(1);
  }

  console.log(`\n--- npm pack --dry-run: ${t} ---`);
  execSync("npm pack --dry-run", { cwd: dir, stdio: "inherit" });
}

console.log("npm-pack-dry-run: completed for selected packages.");

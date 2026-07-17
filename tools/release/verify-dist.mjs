import fs from "node:fs";

const targets = process.argv[2] ?? "";
const has = (t) => ("," + targets + ",").includes("," + t + ",");

const required = [
  ["cdk", "dist/libs/tailng-ui/cdk"],
  ["primitives", "dist/libs/tailng-ui/primitives"],
  ["components", "dist/libs/tailng-ui/components"],
  ["theme", "dist/libs/tailng-ui/theme"],
  ["icons", "dist/libs/tailng-ui/icons"],
  ["registry", "dist/libs/tailng-ui/registry"],
  ["charts", "dist/libs/tailng-ui/charts"],
  ["flow", "dist/libs/tailng-ui/flow"],
  ["cli", "dist/libs/tailng/cli"],
];

for (const [k, dir] of required) {
  if (!has(k)) continue;
  if (!fs.existsSync(dir)) {
    console.error(`ERROR: ${dir} does not exist`);
    process.exit(1);
  }
}

console.log("OK: dist directories exist");

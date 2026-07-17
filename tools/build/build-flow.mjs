import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distRoot = resolve(workspaceRoot, 'dist/libs/tailng-ui/flow');
const componentsTypesEntry = resolve(
  workspaceRoot,
  'dist/libs/tailng-ui/components/src/index.d.ts',
);
const iconsTypesEntry = resolve(workspaceRoot, 'dist/libs/tailng-ui/icons/src/index.d.ts');

const ngcCandidates = [
  resolve(workspaceRoot, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'),
  ...resolvePnpmCompilerCliCandidates(workspaceRoot),
];

const ngcPath = ngcCandidates.find((candidate) => existsSync(candidate));
if (!ngcPath) {
  console.error('build-flow: could not locate Angular compiler-cli ngc binary.');
  process.exit(1);
}

if (!existsSync(componentsTypesEntry)) {
  console.error(
    'build-flow: missing dist/libs/tailng-ui/components/src/index.d.ts. Build components first.',
  );
  process.exit(1);
}

if (!existsSync(iconsTypesEntry)) {
  console.error('build-flow: missing dist/libs/tailng-ui/icons/src/index.d.ts. Build icons first.');
  process.exit(1);
}

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });

const tsConfigPath = resolve(workspaceRoot, 'libs/tailng-ui/flow/tsconfig.lib.ngc.json');
const ngcResult = spawnSync(process.execPath, [ngcPath, '-p', tsConfigPath], {
  cwd: workspaceRoot,
  stdio: 'inherit',
});

if (ngcResult.status !== 0) {
  process.exit(ngcResult.status ?? 1);
}

for (const asset of ['package.json', 'README.md', 'styles.css', 'styles.scss']) {
  cpSync(resolve(workspaceRoot, 'libs/tailng-ui/flow', asset), resolve(distRoot, asset));
}

function resolvePnpmCompilerCliCandidates(root) {
  const pnpmRoot = resolve(root, 'node_modules/.pnpm');
  if (!existsSync(pnpmRoot)) return [];

  const compilerCliPackages = readdirSync(pnpmRoot).filter((entry) =>
    entry.startsWith('@angular+compiler-cli@'),
  );

  return compilerCliPackages.map((entry) =>
    resolve(pnpmRoot, entry, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'),
  );
}

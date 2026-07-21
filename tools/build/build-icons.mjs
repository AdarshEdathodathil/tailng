import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = process.cwd();
const distRoot = resolve(workspaceRoot, 'dist/libs/tailng-ui/icons');

const ngcCandidates = [
  resolve(workspaceRoot, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'),
  ...resolvePnpmCompilerCliCandidates(workspaceRoot),
];

const ngcPath = ngcCandidates.find((candidate) => existsSync(candidate));
if (!ngcPath) {
  console.error('build-icons: could not locate Angular compiler-cli ngc binary.');
  process.exit(1);
}

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });

const tsConfigPath = resolve(workspaceRoot, 'libs/tailng-ui/icons/tsconfig.lib.ngc.json');
const ngcResult = spawnSync(process.execPath, [ngcPath, '-p', tsConfigPath], {
  cwd: workspaceRoot,
  stdio: 'inherit',
});

if (ngcResult.status !== 0) {
  process.exit(ngcResult.status ?? 1);
}

const sourcePackagePath = resolve(workspaceRoot, 'libs/tailng-ui/icons/package.json');
const publishedPackage = JSON.parse(readFileSync(sourcePackagePath, 'utf8'));
publishedPackage.sideEffects = ['./src/lib/icons.js'];
writeFileSync(
  resolve(distRoot, 'package.json'),
  `${JSON.stringify(publishedPackage, null, 2)}\n`,
  'utf8',
);
cpSync(resolve(workspaceRoot, 'libs/tailng-ui/icons/README.md'), resolve(distRoot, 'README.md'));

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

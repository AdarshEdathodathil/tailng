import fs from 'node:fs';
import path from 'node:path';

const targets = process.argv[2] ?? '';
const selected = new Set(
  targets
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const DIST = path.resolve('dist');

// Nx outputs libraries under dist/libs/<scope>/<project>
// e.g. dist/libs/tailng-ui/cdk, dist/libs/tailng/cli
const TAILNG_UI_LIBS = new Set([
  'cdk',
  'primitives',
  'components',
  'theme',
  'icons',
  'registry',
  'charts',
  'flow',
]);

const libDist = (name) => {
  if (TAILNG_UI_LIBS.has(name)) {
    return path.join(DIST, 'libs', 'tailng-ui', name);
  }

  // fallback for other scopes (e.g. dist/libs/tailng/cli)
  return path.join(DIST, 'libs', 'tailng', name);
};

const exists = (p) => fs.existsSync(p);
const stat = (p) => fs.statSync(p);

const fail = (msg) => {
  console.error(`assert-bundles: ${msg}`);
  process.exit(1);
};

const warn = (msg) => console.warn(`⚠️  assert-bundles: ${msg}`);

function readFileSafe(file) {
  return exists(file) ? fs.readFileSync(file, 'utf8') : null;
}

function listFiles(dir, predicate) {
  if (!exists(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (!predicate || predicate(full)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

function resolveTypesFiles(root) {
  const candidates = [path.join(root, 'types'), path.join(root, 'src'), root];

  for (const dir of candidates) {
    if (!exists(dir)) continue;

    const dts = listFiles(dir, (f) => f.endsWith('.d.ts'));
    if (dts.length > 0) {
      return { baseDir: dir, files: dts };
    }
  }

  return { baseDir: root, files: [] };
}

function resolveFesmFiles(root) {
  const candidates = [
    path.join(root, 'fesm2022'),
    path.join(root, 'esm2022'),
    path.join(root, 'fesm2015'),
    path.join(root, 'esm2015'),
    path.join(root, 'bundles'),
    path.join(root, 'src'),
    root,
  ];

  for (const dir of candidates) {
    if (!exists(dir)) continue;

    const mjs = listFiles(dir, (f) => f.endsWith('.mjs') || f.endsWith('.js'));
    if (mjs.length > 0) {
      return { baseDir: dir, files: mjs };
    }
  }

  return { baseDir: root, files: [] };
}

function readJsonSafe(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function collectManifestTargets(value) {
  if (typeof value === 'string') {
    return [value];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.values(value).flatMap((entry) => collectManifestTargets(entry));
}

function assertManifestTargetExists(root, target, label) {
  const relativeTarget = target.replace(/^\.\//, '');
  const wildcardIndex = relativeTarget.indexOf('*');

  if (wildcardIndex === -1) {
    const candidate = path.join(root, relativeTarget);
    if (!exists(candidate)) {
      fail(`theme: ${label} points to missing path '${target}'`);
    }
    return;
  }

  const prefix = relativeTarget.slice(0, wildcardIndex);
  const candidate = path.join(root, prefix);
  const directory = candidate.endsWith(path.sep) ? candidate.slice(0, -1) : path.dirname(candidate);

  if (!exists(candidate) && !exists(directory)) {
    fail(`theme: ${label} points to missing wildcard base '${target}'`);
  }
}

/**
 * Per-package sanity thresholds
 * - cdk entrypoints can be tiny but valid (e.g., 1–2 directives/utilities)
 * - components bundles should never be tiny if they contain real implementations
 */
const THRESHOLDS = {
  cdk: { minMjs: 700, minDts: 150 },
  icons: { minMjs: 900, minDts: 150 },
  primitives: { minMjs: 1200, minDts: 150 },
  components: { minMjs: 1800, minDts: 200, componentsFormControlsMin: 20_000 },
  flow: { minMjs: 5000, minDts: 150 },
  // theme is asset-only checks
};

function assertAngularPackage(name, opts) {
  const root = libDist(name);
  if (!exists(root)) fail(`Missing dist folder: ${root}`);

  const pkgJson = path.join(root, 'package.json');
  if (!exists(pkgJson)) fail(`Missing ${name} package.json in dist: ${pkgJson}`);

  // Types (ng-packagr may emit `types/`, or put d.ts under `src/`, or at root)
  const types = resolveTypesFiles(root);
  if (types.files.length === 0) {
    fail(`${name}: no .d.ts files found (expected under types/, src/, or package root)`);
  }

  for (const f of types.files) {
    const size = stat(f).size;
    if (size < opts.minDts) {
      warn(`${name}: small d.ts: ${path.relative(root, f)} (${size} bytes)`);
    }
  }

  // JS bundles (ng-packagr usually emits fesm2022/, but some builds may place JS under esm*/bundles/src)
  const fesm = resolveFesmFiles(root);
  if (fesm.files.length === 0) {
    fail(
      `${name}: no .mjs/.js files found (expected under fesm2022/, esm2022/, bundles/, src/, or package root)`,
    );
  }

  const bundleSizes = fesm.files.map((f) => ({ file: f, size: stat(f).size }));

  // Many packages have tiny entrypoints (e.g. src/index.js) that just re-export.
  // Treat those as warnings, but ensure there is at least one non-trivial JS bundle.
  const hasRealBundle = bundleSizes.some(({ size }) => size >= opts.minMjs);

  if (!hasRealBundle) {
    fail(
      `${name}: all JS bundles are tiny (min ${opts.minMjs} bytes). Sizes: ${bundleSizes
        .map(({ file, size }) => `${path.relative(root, file)}=${size}`)
        .join(', ')}`,
    );
  }

  for (const { file, size } of bundleSizes) {
    if (size < opts.minMjs) {
      warn(`${name}: small bundle entry: ${path.relative(root, file)} (${size} bytes)`);
    }
  }

  if (name === 'icons') {
    const iconEntry = path.join(root, 'src', 'lib', 'tng-icon.js');
    const iconSource = readFileSafe(iconEntry);
    if (iconSource === null) {
      fail(`icons: missing Angular component entry: ${path.relative(root, iconEntry)}`);
    }

    if (
      !iconSource.includes('ɵɵngDeclareComponent') ||
      !iconSource.includes('isStandalone: true')
    ) {
      fail(
        `icons: expected Angular partial-compiled standalone metadata in ${path.relative(root, iconEntry)}`,
      );
    }
  }

  if (name === 'components') {
    const componentEntries = [
      path.join(root, 'src', 'lib', 'form', 'input', 'tng-input.component.js'),
      path.join(root, 'src', 'lib', 'form', 'form-field', 'tng-form-field.component.js'),
    ];

    for (const componentEntry of componentEntries) {
      const componentSource = readFileSafe(componentEntry);
      if (componentSource === null) {
        fail(`components: missing Angular component entry: ${path.relative(root, componentEntry)}`);
      }

      if (
        !componentSource.includes('ɵɵngDeclareComponent') ||
        !componentSource.includes('isStandalone: true')
      ) {
        fail(
          `components: expected Angular partial-compiled standalone metadata in ${path.relative(root, componentEntry)}`,
        );
      }
    }
  }
}

function assertThemePackage() {
  const root = libDist('theme');
  if (!exists(root)) fail(`Missing dist folder: ${root}`);

  const pkgJson = path.join(root, 'package.json');
  if (!exists(pkgJson)) fail(`theme: missing package.json in dist: ${pkgJson}`);
  const pkg = readJsonSafe(pkgJson);

  const cssRoots = [
    path.join(root, 'tokens'),
    path.join(root, 'component-contracts'),
    path.join(root, 'src', 'lib', 'component-contracts'),
  ].filter(exists);

  if (cssRoots.length === 0) {
    fail(
      `theme: missing css asset roots in dist (expected tokens/, component-contracts/, or src/lib/component-contracts/)`,
    );
  }

  const indexCandidates = [
    path.join(root, 'tokens', 'index.css'),
    path.join(root, 'component-contracts', 'index.css'),
    path.join(root, 'src', 'lib', 'component-contracts', 'index.css'),
  ];

  if (!indexCandidates.some(exists)) {
    fail(
      `theme: missing index.css (expected one of: ${indexCandidates
        .map((candidate) => path.relative(root, candidate))
        .join(', ')})`,
    );
  }

  const cssFiles = cssRoots.flatMap((dir) => listFiles(dir, (f) => f.endsWith('.css')));
  if (cssFiles.length === 0) fail(`theme: css asset roots contain no css files`);

  if (typeof pkg.style !== 'string' || pkg.style.length === 0) {
    fail(`theme: package.json is missing a root 'style' entry`);
  }

  assertManifestTargetExists(root, pkg.style, 'package.json#style');

  if (!pkg.exports || typeof pkg.exports !== 'object') {
    fail(`theme: package.json is missing exports`);
  }

  const exportTargets = collectManifestTargets(pkg.exports);
  if (exportTargets.length === 0) {
    fail(`theme: package.json exports do not declare any target files`);
  }

  for (const target of exportTargets) {
    assertManifestTargetExists(root, target, 'package.json#exports');
  }

  const tailwindPresetCandidates = [
    path.join(root, 'tailwind', 'tailng.preset.cjs'),
    path.join(root, 'src', 'lib', 'adapters', 'tailwind', 'to-tailwind-preset.js'),
  ];
  if (!tailwindPresetCandidates.some(exists)) {
    warn(
      `theme: no explicit tailwind preset artifact found (checked ${tailwindPresetCandidates
        .map((candidate) => path.relative(root, candidate))
        .join(', ')})`,
    );
  }
}

function assertFlowPackage() {
  assertAngularPackage('flow', THRESHOLDS.flow);

  const root = libDist('flow');
  const pkg = readJsonSafe(path.join(root, 'package.json'));
  const editorEntry = path.join(root, 'src', 'lib', 'editor', 'tng-flow-editor.component.js');
  const editorSource = readFileSafe(editorEntry);

  if (editorSource === null) {
    fail(`flow: missing Angular component entry: ${path.relative(root, editorEntry)}`);
  }

  if (
    !editorSource.includes('ɵɵngDeclareComponent') ||
    !editorSource.includes('isStandalone: true')
  ) {
    fail(
      `flow: expected Angular partial-compiled standalone metadata in ${path.relative(root, editorEntry)}`,
    );
  }

  const publicDeclarations = listFiles(root, (file) => file.endsWith('.d.ts'));
  for (const declaration of publicDeclarations) {
    const declarationSource = readFileSafe(declaration);
    if (declarationSource?.includes('@foblex/')) {
      fail(`flow: Foblex type leaked into public declaration ${path.relative(root, declaration)}`);
    }
  }

  const publicTypesEntry = readFileSafe(path.join(root, 'src', 'index.d.ts'));
  const milestoneTwoSymbols = [
    'TngFlowConnectionCreateRequest',
    'TngFlowConnectionReconnectRequest',
    'TngFlowConnectionValidator',
    'TngFlowEditorMode',
    'TngFlowSelection',
  ];
  for (const symbol of milestoneTwoSymbols) {
    if (!publicTypesEntry?.includes(symbol)) {
      fail(`flow: public types entry does not export Milestone 2 symbol '${symbol}'`);
    }
  }

  const styleExports = ['./styles.css', './styles.scss'];
  for (const styleExport of styleExports) {
    const stylePath = path.join(root, styleExport.slice(2));
    if (!exists(stylePath) || stat(stylePath).size === 0) {
      fail(`flow: missing or empty published style asset '${styleExport}'`);
    }

    if (pkg.exports?.[styleExport] !== styleExport) {
      fail(`flow: package.json must export '${styleExport}'`);
    }

    if (!Array.isArray(pkg.sideEffects) || !pkg.sideEffects.includes(styleExport)) {
      fail(`flow: package.json sideEffects must retain '${styleExport}'`);
    }
  }
}

function assertComponentsSpecific() {
  const root = libDist('components');

  // strongest check for the historically problematic bundle
  const candidates = [path.join(root, 'fesm2022', 'tailng-ui-components-form-controls.mjs')].filter(
    exists,
  );

  // If naming differs in future, fall back to pattern search
  const fallback =
    candidates.length === 0
      ? listFiles(path.join(root, 'fesm2022'), (f) => f.endsWith('components-form-controls.mjs'))
      : [];

  const files = candidates.length ? candidates : fallback;

  const min = THRESHOLDS.components.componentsFormControlsMin;
  if (files.length > 0) {
    for (const f of files) {
      const size = stat(f).size;
      if (size < min) {
        fail(
          `components: form-controls bundle too small (${size} bytes). Likely stub output: ${path.relative(root, f)}`,
        );
      }
    }
    return;
  }

  // Newer builds may emit form controls as split source modules under src/lib/form.
  const modularFormFiles = listFiles(path.join(root, 'src', 'lib', 'form'), (f) => {
    if (!f.endsWith('.js')) return false;
    if (f.endsWith('.spec.js')) return false;
    return true;
  });

  if (modularFormFiles.length === 0) {
    warn(
      `components: could not find form-controls output bundle or modular form files; skipping strict check`,
    );
    return;
  }

  const totalBytes = modularFormFiles.reduce((sum, file) => sum + stat(file).size, 0);
  if (totalBytes < min) {
    fail(
      `components: modular form output too small (${totalBytes} bytes across ${modularFormFiles.length} files). Likely stub output.`,
    );
  }
}

function assertCdkPackage() {
  const root = libDist('cdk');
  if (!exists(root)) fail(`Missing dist folder: ${root}`);

  const pkgJson = path.join(root, 'package.json');
  if (!exists(pkgJson)) fail(`cdk: missing package.json in dist`);

  const types = resolveTypesFiles(root);
  if (types.files.length === 0)
    fail(`cdk: no .d.ts files found (expected under types/, src/, or package root)`);

  const fesm = resolveFesmFiles(root);
  if (fesm.files.length === 0)
    fail(
      `cdk: no .mjs/.js files found (expected under fesm2022/, esm2022/, bundles/, src/, or package root)`,
    );

  const bundleSizes = fesm.files.map((f) => ({ file: f, size: stat(f).size }));

  // Require at least one non-trivial bundle (guards against total stub publish)
  const min = THRESHOLDS.cdk.minMjs;
  const hasRealBundle = bundleSizes.some(({ size }) => size >= min);

  if (!hasRealBundle) {
    fail(
      `cdk: all JS bundles are tiny (min ${min} bytes). Sizes: ${bundleSizes
        .map(({ file, size }) => `${path.relative(root, file)}=${size}`)
        .join(', ')}`,
    );
  }

  for (const { file, size } of bundleSizes) {
    if (size < min) {
      warn(`cdk: small bundle entry: ${path.relative(root, file)} (${size} bytes)`);
    }
  }
}

const wants = (t) => selected.has(t);

if (wants('cdk')) assertCdkPackage();
if (wants('icons')) assertAngularPackage('icons', THRESHOLDS.icons);
if (wants('primitives')) assertAngularPackage('primitives', THRESHOLDS.primitives);
if (wants('components')) {
  assertAngularPackage('components', THRESHOLDS.components);
  assertComponentsSpecific();
}
if (wants('theme')) assertThemePackage();
if (wants('flow')) assertFlowPackage();

// docs is not an npm package check here

console.log('assert-bundles: all selected dist outputs look sane.');

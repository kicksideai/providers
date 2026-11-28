// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const [wippy = process.env.WIPPY_BIN || 'wippy', ...args] = process.argv.slice(2);
const source = readFileSync(join(root, '_index.yaml'), 'utf8').replace(/\r\n/g, '\n');
const dependencies = [...source.matchAll(
  /^  - name: dep\.kickside\.google\n[\s\S]*?^    parameters:\n([\s\S]*?)(?=^  - name:)/gm,
)];
assert.equal(dependencies.length, 1, 'Expected one Google dependency parameter list');
const parameters = dependencies[0][1].trimEnd();
assert(!parameters.includes('kickside.google:sheets_importer_public'),
  'The default harness must omit sheets_importer_public');

const scratch = join(root, '.local', 'tmp');
mkdirSync(scratch, { recursive: true });
const overlayDir = mkdtempSync(join(scratch, 'tmp-import-visibility-'));
let exitCode = 0;
try {
  // Reuse the host's bindings; config overlays inject real YAML booleans before linking.
  for (const value of [undefined, true, false]) {
    const configArgs = ['--config', join(root, '.wippy.yaml')];
    if (value !== undefined) {
      const overlay = join(overlayDir, 'visibility.yaml');
      writeFileSync(overlay, `version: '1.0'
override:
  'app:dep.kickside.google:parameters':
${parameters}
    - name: kickside.google:sheets_importer_public
      value: ${value}
  'app.suites:sheets_import_visibility_test:meta.expected_public': ${value}
  'app.suites:sheets_import_visibility_test:meta.expected_parameter_present': true
`, 'utf8');
      configArgs.push('--config', overlay);
    }
    console.log(`Importer visibility parameter: ${value === undefined ? 'omitted' : value}`);
    const result = spawnSync(wippy, ['test', ...configArgs, ...args], {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      exitCode = result.status ?? 1;
      break;
    }
  }
} finally {
  rmSync(overlayDir, { recursive: true, force: true });
}
process.exitCode = exitCode;

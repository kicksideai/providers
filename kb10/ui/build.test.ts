// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'

it('builds all published KB10 entry points without source maps', () => {
  const output = mkdtempSync(join(tmpdir(), 'kb10-release-'))
  try {
    writeFileSync(join(output, 'previous.js.map'), '{}')
    execFileSync('npm', ['run', 'build', '--', '--outDir', output], {
      cwd: new URL('.', import.meta.url),
      env: { ...process.env, NODE_ENV: 'production' },
      timeout: 30_000,
    })
    const files = readdirSync(output, { recursive: true })
    expect(files).toEqual(expect.arrayContaining(['document.js', 'wiki.js', 'create.js', 'wippy-meta.json']))
    expect(files.filter(name => name.endsWith('.map'))).toEqual([])
    for (const file of files.filter(name => name.endsWith('.js'))) {
      expect(readFileSync(join(output, file), 'utf8')).not.toMatch(/^\s*\/\/[#@]\s*sourceMappingURL=/m)
    }
  } finally {
    rmSync(output, { recursive: true, force: true })
  }
}, 30_000)

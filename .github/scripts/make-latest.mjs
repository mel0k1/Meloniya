// Сборка latest.json для автообновления Мелонии из собранных бандлов.
// Usage: bun make-latest.mjs <version> <tag> <artifacts-dir> <out-file>
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const [version, tag, dir, outArg] = process.argv.slice(2)
if (!version || !tag || !dir) {
  console.error('usage: make-latest.mjs <version> <tag> <artifacts-dir> [out]')
  process.exit(1)
}
const out = outArg || 'latest.json'

const REPO = 'mel0k1/Meloniya'
const files = readdirSync(dir)
const PLATFORMS = {
  windows: { match: (f) => f.endsWith('-setup.exe'), key: 'windows-x86_64' },
  linux: { match: (f) => f.endsWith('.AppImage'), key: 'linux-x86_64' },
}

const platforms = {}
for (const { match, key } of Object.values(PLATFORMS)) {
  const bin = files.find(match)
  if (!bin) continue
  const sig = files.find((f) => f === bin + '.sig')
  if (!sig) throw new Error('no .sig next to ' + bin)
  platforms[key] = {
    signature: readFileSync(join(dir, sig), 'utf8').trim(),
    url: `https://github.com/${REPO}/releases/download/${tag}/${encodeURIComponent(bin)}`,
  }
}
if (!Object.keys(platforms).length) throw new Error('no updater artifacts found')

const manifest = {
  version,
  notes: `Мелония ${version}: обновления теперь идут релизами этого репозитория. Полный список изменений — на странице релиза.`,
  pub_date: new Date().toISOString(),
  platforms,
}
writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n')
console.log(out, '→', Object.keys(platforms).join(', '))

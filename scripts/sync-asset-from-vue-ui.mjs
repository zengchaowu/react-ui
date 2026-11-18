/**
 * 从 vue-ui 复制 asset 图标产物，保证 react-ui 与 vue-ui 图标库一致。
 * vue-ui 由 vite-plugin-asset 拉取发布产物，react-ui 不再单独配置 ASSET_*。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const reactRoot = path.resolve(__dirname, '..')
const srcDir = path.resolve(reactRoot, '../vue-ui/src/assets/asset')
const destDir = path.join(reactRoot, 'src/assets/asset')

/** 仅同步生成的图标产物，不动手写的 asset.source.css / asset-host.css */
const files = [
  'asset.css',
  'asset.woff2',
  'asset.woff',
  'asset.ttf',
  'asset.js',
  'asset.symbol.svg',
  'asset.json',
]

if (!fs.existsSync(srcDir)) {
  console.error('[sync-asset] vue-ui asset not found:', srcDir)
  process.exit(1)
}

fs.mkdirSync(destDir, { recursive: true })
let changed = 0
for (const name of files) {
  const from = path.join(srcDir, name)
  const to = path.join(destDir, name)
  if (!fs.existsSync(from)) {
    console.warn('[sync-asset] skip missing', name)
    continue
  }
  const next = fs.readFileSync(from)
  const prev = fs.existsSync(to) ? fs.readFileSync(to) : null
  if (prev && Buffer.compare(prev, next) === 0) continue
  fs.writeFileSync(to, next)
  changed += 1
  console.log('[sync-asset]', name)
}
console.log(`[sync-asset] done -> ${destDir} (${changed} updated)`)

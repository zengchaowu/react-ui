import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const reactUiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIR = resolve(reactUiRoot, 'src/assets/file-icons')
const MAPS_FILE = resolve(reactUiRoot, 'src/assets/fileIconMaps.json')
const PUBLIC_SEGMENT = 'file-icons'

function readCopyStamp() {
  let mapsHash = 'no-maps'
  try {
    const mapsRaw = readFileSync(MAPS_FILE, 'utf8')
    mapsHash = createHash('sha256').update(mapsRaw).digest('hex').slice(0, 16)
  } catch {
    // ignore
  }

  let srcCount = 0
  if (existsSync(SOURCE_DIR)) {
    srcCount = readdirSync(SOURCE_DIR).filter((name) => name.endsWith('.svg')).length
  }
  return `${mapsHash}:${srcCount}`
}

function copyFileIconsToPublic(projectRoot) {
  if (!existsSync(SOURCE_DIR)) {
    console.warn(
      '[file-icon-static-assets] source dir not found:',
      SOURCE_DIR,
      '(run pnpm run sync:file-icon-svgs in @zengchaowu/react-ui)',
    )
    return
  }

  const destDir = resolve(projectRoot, `public/${PUBLIC_SEGMENT}`)
  const stampFile = resolve(destDir, '.file-icons-copy-stamp')
  const stamp = readCopyStamp()

  if (existsSync(stampFile)) {
    const current = readFileSync(stampFile, 'utf8').trim()
    if (current === stamp && existsSync(destDir)) {
      return
    }
  }

  // 清掉旧目录残留（含历史 material-icons 迁移后的多余文件）
  rmSync(destDir, { recursive: true, force: true })
  mkdirSync(destDir, { recursive: true })
  cpSync(SOURCE_DIR, destDir, { recursive: true, force: true })
  writeFileSync(stampFile, stamp, 'utf8')
}

/** 构建/开发前将文件图标 SVG 复制到应用 public/file-icons，供静态 URL 引用 */
export function fileIconStaticAssetsPlugin() {
  let projectRoot = process.cwd()

  return {
    name: 'file-icon-static-assets',
    configResolved(config) {
      projectRoot = config.root
    },
    buildStart() {
      copyFileIconsToPublic(projectRoot)
    },
  }
}
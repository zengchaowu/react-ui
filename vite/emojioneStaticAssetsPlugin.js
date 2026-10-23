import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const reactUiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const requireFromReactUi = createRequire(resolve(reactUiRoot, 'package.json'))

function resolveEmojionePngSourceDir() {
  const pkgJson = requireFromReactUi.resolve('emoji-datasource-emojione/package.json')
  return resolve(dirname(pkgJson), 'img/emojione/64')
}

function readEmojionePackageVersion() {
  const pkgJson = requireFromReactUi.resolve('emoji-datasource-emojione/package.json')
  try {
    const raw = readFileSync(pkgJson, 'utf8')
    const version = JSON.parse(raw).version
    return typeof version === 'string' ? version : 'unknown'
  } catch {
    return 'unknown'
  }
}

function copyEmojionePngsToPublic(projectRoot) {
  const srcDir = resolveEmojionePngSourceDir()
  if (!existsSync(srcDir)) {
    console.warn('[emojione-static-assets] source dir not found:', srcDir)
    return
  }

  const destDir = resolve(projectRoot, 'public/emojione/64')
  const stampFile = resolve(destDir, '.emojione-copy-stamp')
  const version = readEmojionePackageVersion()
  const srcCount = readdirSync(srcDir).filter((name) => name.endsWith('.png')).length

  if (existsSync(stampFile)) {
    const stamp = readFileSync(stampFile, 'utf8').trim()
    if (stamp === `${version}:${srcCount}` && existsSync(destDir)) {
      return
    }
  }

  mkdirSync(destDir, { recursive: true })
  cpSync(srcDir, destDir, { recursive: true, force: true })
  writeFileSync(stampFile, `${version}:${srcCount}`, 'utf8')
}

/** 构建/开发前将 EmojiOne 64px PNG 复制到应用 public/emojione/64，供静态 URL 引用 */
export function emojioneStaticAssetsPlugin() {
  let projectRoot = process.cwd()

  return {
    name: 'emojione-static-assets',
    configResolved(config) {
      projectRoot = config.root
    },
    buildStart() {
      copyEmojionePngsToPublic(projectRoot)
    },
  }
}
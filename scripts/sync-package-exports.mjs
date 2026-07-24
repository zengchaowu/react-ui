#!/usr/bin/env node
/**
 * 根据 src/components 目录生成 package.json exports（镜像 vue-ui）。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(__dirname, '..')
const componentsRoot = join(pkgRoot, 'src/components')
const distComponentsRoot = join(pkgRoot, 'dist/components')
const pkgPath = join(pkgRoot, 'package.json')

const STATIC_EXPORTS = {
  '.': {
    types: './dist/index.d.ts',
    node: './dist/index.js',
    import: './dist/index.js',
    default: './dist/index.js',
  },
  './style': {
    types: './dist/style.d.ts',
    node: './dist/style.js',
    import: './dist/style.js',
    default: './dist/style.js',
  },
  './dist/tailwind.css': './dist/tailwind.css',
  './dist/hairline.css': './dist/hairline.css',
  './dist/tokens.css': './dist/tokens.css',
  './dist/iconfont.css': './dist/iconfont.css',
  './dist/iconfont.js': './dist/iconfont.js',
}

function listComponentNames() {
  if (!existsSync(componentsRoot)) return []
  return readdirSync(componentsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => /^(Cw|Tp|Page)/.test(name))
    .filter((name) => {
      // 构建前：源码 index 存在即可写入 exports 占位；构建后优先要求 dist
      const distIndex = join(distComponentsRoot, name, 'index.js')
      const srcIndex = join(componentsRoot, name, 'index.ts')
      if (existsSync(distIndex)) {
        return readFileSync(distIndex, 'utf8').trim().length > 0
      }
      return existsSync(srcIndex)
    })
    .sort()
}

function componentExport(name) {
  const distIndex = `./dist/components/${name}/index.js`
  const distTypes = `./dist/components/${name}/index.d.ts`
  return {
    types: distTypes,
    node: distIndex,
    import: distIndex,
    default: distIndex,
  }
}

function buildExports() {
  const exportsMap = { ...STATIC_EXPORTS }
  for (const name of listComponentNames()) {
    const spec = componentExport(name)
    exportsMap[`./${name}`] = spec
    exportsMap[`./components/${name}`] = spec
  }
  return exportsMap
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.exports = buildExports()
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
console.log(
  `[sync:package-exports] ${listComponentNames().length} components → exports updated`,
)

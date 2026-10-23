#!/usr/bin/env node
/**
 * 校验 react-ui 主入口是否覆盖 vue-ui 的全部公共导出。
 *
 * 规范：Vue ⊆ React（允许超集，禁止缺失）。
 * - 默认模式：vueOnly 必须为 0；reactOnly 仅打印统计，不失败。
 * - --strict：额外要求 reactOnly 为 0（名字集合完全相同）。
 */
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(__dirname, '..')
const repoRoot = resolve(pkgRoot, '..', '..')

const VUE_INDEX = resolve(repoRoot, 'packages/vue-ui/src/index.ts')
const REACT_INDEX = resolve(pkgRoot, 'src/index.ts')

function loadTypeScript() {
  const candidates = [
    resolve(pkgRoot, 'node_modules/typescript'),
    resolve(repoRoot, 'node_modules/typescript'),
  ]
  for (const base of candidates) {
    const requireFrom = createRequire(base + '/package.json')
    try {
      return requireFrom('typescript')
    } catch {
      // try next
    }
  }
  throw new Error('typescript not found (install at repo root or in react-ui)')
}

function collectExports(ts, file) {
  const program = ts.createProgram([file], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
    allowJs: false,
  })
  const checker = program.getTypeChecker()
  const sourceFile = program.getSourceFile(file)
  if (!sourceFile) throw new Error(`cannot read ${file}`)
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!moduleSymbol) return new Map()

  const result = new Map()
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const name = symbol.getName()
    if (name === 'default') continue
    const resolved =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol
    const isValue = (resolved.flags & ts.SymbolFlags.Value) !== 0
    result.set(name, isValue ? 'value' : 'type')
  }
  return result
}

if (!existsSync(VUE_INDEX)) throw new Error(`missing ${VUE_INDEX}`)
if (!existsSync(REACT_INDEX)) throw new Error(`missing ${REACT_INDEX}`)

const ts = loadTypeScript()
const vue = collectExports(ts, VUE_INDEX)
const react = collectExports(ts, REACT_INDEX)

const vueOnly = [...vue.keys()].filter((name) => !react.has(name)).sort()
const reactOnly = [...react.keys()].filter((name) => !vue.has(name)).sort()

const strict = process.argv.includes('--strict')
const reactOnlyValues = reactOnly.filter((name) => react.get(name) === 'value')
const reactOnlyTypes = reactOnly.filter((name) => react.get(name) === 'type')

console.log(
  `[check:export-parity] vue=${vue.size} react=${react.size} ` +
    `vueOnly=${vueOnly.length} reactOnly=${reactOnly.length} ` +
    `(reactOnly values=${reactOnlyValues.length}, types=${reactOnlyTypes.length})`,
)

if (reactOnly.length > 0) {
  console.log('[check:export-parity] react-only (superset, allowed):')
  console.log(`  ${reactOnly.join(', ')}`)
}

if (vueOnly.length > 0) {
  console.error('[check:export-parity] FAIL — vue-ui exports missing in react-ui:')
  console.error(`  ${vueOnly.join(', ')}`)
  process.exit(1)
}

if (strict && reactOnly.length > 0) {
  console.error('[check:export-parity] FAIL (--strict) — react-ui has extra exports:')
  console.error(`  ${reactOnly.join(', ')}`)
  process.exit(1)
}

console.log('[check:export-parity] OK — react-ui covers every vue-ui public export')

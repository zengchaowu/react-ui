import type {
  DisplayRow,
  GlobalScope,
  KeyPathFuncStrMap,
  ScopeDisplayRowMap,
} from '../types'
import getScopeFromKeypath from './getScopeFromKeypath'
import getScopesFromFunctionStr from './getScopesFromFunctionStr'
import { recordFormula } from './editTiming'

interface CompiledFormula {
  funcStr: string
  globalKey: string
  displayRow: DisplayRow
  scopes: string[]
  fn: () => void
}

const compiledFormulaCache = new WeakMap<KeyPathFuncStrMap, Map<string, CompiledFormula>>()

function getCompiledFormulaCache(keyPathFuncStrMap: KeyPathFuncStrMap) {
  let cache = compiledFormulaCache.get(keyPathFuncStrMap)
  if (!cache) {
    cache = new Map()
    compiledFormulaCache.set(keyPathFuncStrMap, cache)
  }
  return cache
}

/**
 * 执行单个公式，把结果写回对应字段的 result。
 */
export default function runFormulaKeyPath(
  keyPath: string,
  keyPathFuncStrMap: KeyPathFuncStrMap,
  scopeDisplayRowMap: ScopeDisplayRowMap,
  globalScope: GlobalScope,
) {
  const funcStr = keyPathFuncStrMap.get(keyPath)
  if (!funcStr) return false
  const displayRow = scopeDisplayRowMap.get(getScopeFromKeypath(keyPath))
  if (!displayRow) return false
  const globalKey = Object.keys(globalScope).join(',')
  const cache = getCompiledFormulaCache(keyPathFuncStrMap)
  let compiled = cache.get(keyPath)
  let compileMs = 0
  if (
    !compiled ||
    compiled.funcStr !== funcStr ||
    compiled.globalKey !== globalKey ||
    compiled.displayRow !== displayRow
  ) {
    const scopes = getScopesFromFunctionStr(funcStr)
    const compileStarted = performance.now()
    const fn = new Function(
      ...Object.keys(globalScope),
      ...scopes,
      funcStr,
    ).bind(displayRow) as () => void
    compileMs = performance.now() - compileStarted
    compiled = { funcStr, globalKey, displayRow, scopes, fn }
    cache.set(keyPath, compiled)
  }
  // 添加 scope 属性让 proxy 能够捕获，否则会直接报 undefined
  for (const scope of compiled.scopes) {
    displayRow[scope] = undefined
  }
  const runStarted = performance.now()
  try {
    compiled.fn()
  } catch (error) {
    console.error(error)
  }
  recordFormula(compileMs, performance.now() - runStarted)
  return true
}

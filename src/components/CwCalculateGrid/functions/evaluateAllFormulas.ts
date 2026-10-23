import type {
  GlobalScope,
  KeyPathDepsMap,
  KeyPathFuncStrMap,
  ScopeDisplayRowMap,
} from '../types'
import runFormulaKeyPath from './runFormulaKeyPath'
import { recordTopo } from './editTiming'

/**
 * 按依赖顺序执行全部公式。初始化时字段还没有 result，需要先算一遍。
 */
export default function evaluateAllFormulas(
  keyPathDepsMap: KeyPathDepsMap,
  keyPathFuncStrMap: KeyPathFuncStrMap,
  scopeDisplayRowMap: ScopeDisplayRowMap,
  globalScope: GlobalScope,
) {
  globalScope.__CHAIN_CALL__ = true
  globalScope.__PATCH__ = []
  const sortStarted = performance.now()
  const sorted = sortFormulaKeyPaths(keyPathFuncStrMap, keyPathDepsMap)
  recordTopo(performance.now() - sortStarted)
  for (const keyPath of sorted) {
    runFormulaKeyPath(
      keyPath,
      keyPathFuncStrMap,
      scopeDisplayRowMap,
      globalScope,
    )
  }
  globalScope.__CHAIN_CALL__ = false
}

export function sortFormulaKeyPaths(
  keyPathFuncStrMap: KeyPathFuncStrMap,
  keyPathDepsMap: KeyPathDepsMap,
): string[] {
  const indegree = new Map<string, number>()
  const outgoing = new Map<string, string[]>()

  const ensure = (key: string) => {
    if (!indegree.has(key)) {
      indegree.set(key, 0)
      outgoing.set(key, [])
    }
  }

  for (const key of keyPathFuncStrMap.keys()) ensure(key)
  for (const [dep, users] of keyPathDepsMap) {
    ensure(dep)
    for (const user of users) {
      ensure(user)
      outgoing.get(dep)!.push(user)
      indegree.set(user, (indegree.get(user) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [key, degree] of indegree) {
    if (degree === 0) queue.push(key)
  }

  const sorted: string[] = []
  const seen = new Set<string>()
  let head = 0
  while (head < queue.length) {
    const key = queue[head++]
    if (seen.has(key)) continue
    seen.add(key)
    sorted.push(key)
    for (const next of outgoing.get(key) ?? []) {
      const nextDegree = (indegree.get(next) ?? 1) - 1
      indegree.set(next, nextDegree)
      if (nextDegree === 0) queue.push(next)
    }
  }

  for (const key of indegree.keys()) {
    if (!seen.has(key)) sorted.push(key)
  }

  return sorted.filter(key => keyPathFuncStrMap.has(key))
}

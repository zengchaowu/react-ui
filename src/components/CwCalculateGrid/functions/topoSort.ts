import type { KeyPathDepsMap } from '../types'

/**
 * 对依赖关系进行拓扑排序，返回从起点开始的依赖链数组。
 * @param startKey 起始 keyPath
 * @param depsMap 依赖关系 Map
 * @returns 排序后的 keyPath 数组
 */
export default function topoSort(
  startKey: string,
  depsMap: KeyPathDepsMap,
): string[] {
  const visited = new Set<string>()
  const result: string[] = []
  const stack: { key: string; depsIter?: Iterator<string> }[] = []
  stack.push({ key: startKey })
  while (stack.length > 0) {
    const top = stack[stack.length - 1]
    if (visited.has(top.key)) {
      stack.pop()
      continue
    }
    if (!top.depsIter) {
      const deps = depsMap.get(top.key)
      top.depsIter = deps ? deps.values() : [][Symbol.iterator]()
    }
    const next = top.depsIter.next()
    if (!next.done) {
      const dep = next.value
      if (!visited.has(dep)) {
        stack.push({ key: dep })
      }
    } else {
      visited.add(top.key)
      result.push(top.key)
      stack.pop()
    }
  }
  return result.reverse()
}

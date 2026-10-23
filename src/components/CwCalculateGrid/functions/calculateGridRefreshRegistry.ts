import type { KeyPathDepsMap } from '../types'

/** null 表示整表重读（首次算出 result）。有集合时只刷新这些 scope 所在的行。 */
export type CalculateGridRefresh = (
  affectedScopes: ReadonlySet<string> | null,
) => void

const refreshers = new WeakMap<KeyPathDepsMap, Set<CalculateGridRefresh>>()

/** 同一份依赖图上的表格按受影响的行刷新，其它表不重绘。 */
export function registerCalculateGridRefresh(
  keyPathDepsMap: KeyPathDepsMap,
  refresh: CalculateGridRefresh,
) {
  let set = refreshers.get(keyPathDepsMap)
  if (!set) {
    set = new Set()
    refreshers.set(keyPathDepsMap, set)
  }
  set.add(refresh)
  return () => {
    set.delete(refresh)
  }
}

export function refreshCalculateGrids(
  keyPathDepsMap: KeyPathDepsMap,
  affectedScopes: ReadonlySet<string> | null,
) {
  const set = refreshers.get(keyPathDepsMap)
  if (!set) return
  for (const refresh of set) refresh(affectedScopes)
}

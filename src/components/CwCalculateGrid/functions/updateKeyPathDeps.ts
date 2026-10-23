import type { KeyPathDepsMap } from '../types'

/**
 * 更新指定 keyPath 的依赖集合。
 * @param keyPathDepsMap 依赖关系 Map
 * @param keyPath 需要更新的 keyPath
 * @param deps 新增的依赖集合
 */
export default function (
  keyPathDepsMap: KeyPathDepsMap,
  keyPath: string,
  deps: Set<string>,
) {
  const values = keyPathDepsMap.get(keyPath)
  if (values) {
    for (const dep of deps) {
      values.add(dep)
    }
  } else {
    keyPathDepsMap.set(keyPath, deps)
  }
}

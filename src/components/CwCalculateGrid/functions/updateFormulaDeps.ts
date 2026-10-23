import getFormulaDependencies from './getFormulaDependencies'
import updateKeyPathDeps from './updateKeyPathDeps'
import type { KeyPathDepsMap, SourceRow } from '../types'
import getKeyPathFromScopeAndKey from './getKeyPathFromScopeAndKey'
import { forgetDependsOn, noteDependsOn } from './formulaScheduler'

/**
 * 更新公式依赖关系
 * @param scope 作用域id
 * @param key 字段名
 * @param oldFormula 旧公式字符串
 * @param newFormula 新公式字符串
 * @param sourceRow 当前作用域对象
 * @param keyPathDepsMap 依赖关系Map
 */
export default function updateFormulaDeps(
  scope: string,
  key: string,
  oldFormula: string,
  newFormula: string,
  sourceRow: SourceRow,
  keyPathDepsMap: KeyPathDepsMap,
) {
  const oldDeps = getFormulaDependencies(oldFormula)
  const newDeps = getFormulaDependencies(newFormula)
  const addedDeps = newDeps.filter(dep => !oldDeps.includes(dep))
  const removedDeps = oldDeps.filter(dep => !newDeps.includes(dep))

  const keyPath = getKeyPathFromScopeAndKey(scope, key)
  const scopeVariables = Object.keys(sourceRow)
  // 遍历新增的依赖，更新依赖关系
  for (const dep of addedDeps) {
    const depKeyPath = scopeVariables.includes(dep)
      ? getKeyPathFromScopeAndKey(scope, dep)
      : dep
    updateKeyPathDeps(keyPathDepsMap, depKeyPath, new Set([keyPath]))
    noteDependsOn(keyPathDepsMap, keyPath, depKeyPath)
  }
  // 遍历删除的依赖，更新依赖关系
  for (const dep of removedDeps) {
    const depKeyPath = scopeVariables.includes(dep)
      ? getKeyPathFromScopeAndKey(scope, dep)
      : dep
    const values = keyPathDepsMap.get(depKeyPath)
    if (values && values.has(keyPath)) values.delete(keyPath)
    forgetDependsOn(keyPathDepsMap, keyPath, depKeyPath)
  }
}

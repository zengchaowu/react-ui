import type {
  GlobalScope,
  KeyPathDepsMap,
  KeyPathFuncStrMap,
  ScopeDisplayRowMap,
} from '../types'
import topoSort from './topoSort'
import getKeyPathFromScopeAndKey from './getKeyPathFromScopeAndKey'
import runFormulaKeyPath from './runFormulaKeyPath'
import updateFormulaDeps from './updateFormulaDeps'
import updateFormulaFunctionStr from './updateFormulaFunctionStr'
import { recordTopo } from './editTiming'
/**
 * 处理依赖链调用，按依赖顺序执行相关公式。
 * @param scope 作用域
 * @param key 键
 * @param value 目标值
 * @param keyPathDepsMap 依赖关系 Map
 * @param keyPathFuncStrMap 公式函数字符串 Map
 * @param scopeDisplayRowMap 作用域行 Map
 * @param globalScope 全局作用域对象
 * @param dryRun 是否为dryRun模式
 */
export default function (
  scope: string,
  key: string,
  value: string,
  keyPathDepsMap: KeyPathDepsMap,
  keyPathFuncStrMap: KeyPathFuncStrMap,
  scopeDisplayRowMap: ScopeDisplayRowMap,
  globalScope: GlobalScope,
  dryRun: boolean,
  executeFormulas = true,
) {
  const displayRow = scopeDisplayRowMap.get(scope)
  if (!displayRow) {
    throw new Error('displayRow not found')
  }

  globalScope['__CHAIN_CALL__'] = true
  globalScope['__PATCH__'] = new Array()
  if (dryRun) {
    globalScope['__DRY_RUN__'] = true
    globalScope['__DRY_RUN_SCOPE__'] = new Map()
  }

  {
    // 如果要修改的是公式，则需要重构建依赖
    const field = displayRow._data[key]

    // TODO 暂时不支持在DryRun模式下修改公式
    if (dryRun && field?.type === 'formula') {
      throw new Error('不支持在DryRun模式下修改公式')
    }

    if (field?.type === 'formula') {
      const oldFormula = field.value
      const newFormula = value
      updateFormulaDeps(
        scope,
        key,
        oldFormula,
        newFormula,
        displayRow._data,
        keyPathDepsMap,
      )
      updateFormulaFunctionStr(scope, key, newFormula, keyPathFuncStrMap)
    }
  }

  {
    // 先修改目标值并写入patch
    globalScope['__PATCH__'].push({
      keyPath: getKeyPathFromScopeAndKey(scope, key),
      patch: {
        type: 'value',
        from: displayRow._data[key]?.value,
        to: value,
      },
    })
    const targetField = displayRow._data[key]
    if (targetField) Object.assign(targetField, { value })
  }

  // 再进行依赖链调用
  const topoStarted = performance.now()
  const sorted = topoSort(getKeyPathFromScopeAndKey(scope, key), keyPathDepsMap)
  recordTopo(performance.now() - topoStarted)
  if (executeFormulas) {
    for (const value of sorted) {
      runFormulaKeyPath(
        value,
        keyPathFuncStrMap,
        scopeDisplayRowMap,
        globalScope,
      )
    }
  }
  globalScope['__CHAIN_CALL__'] = false
  if (dryRun) {
    globalScope['__DRY_RUN__'] = false
  }
  return sorted
}

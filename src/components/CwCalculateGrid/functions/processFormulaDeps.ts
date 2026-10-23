import getFormulaDependencies from './getFormulaDependencies'
import type {
  FormulaField,
  KeyPathDepsMap,
  KeyPathFuncStrMap,
  SourceRow,
} from '../types'
import updateKeyPathDeps from './updateKeyPathDeps'
import getScopeFromSourceRow from './getScopeFromSourceRow'
import getKeyPathFromScopeAndKey from './getKeyPathFromScopeAndKey'
import updateFormulaFunctionStr from './updateFormulaFunctionStr'
import { noteDependsOn } from './formulaScheduler'

/**
 * 解析公式依赖关系，并更新依赖映射和函数字符串映射。
 * @param key 字段名
 * @param formulaField 公式字段对象
 * @param keyPathDepsMap 依赖关系 Map
 * @param keyPathFuncStrMap 公式函数字符串 Map
 * @param sourceRow 当前作用域对象
 * @returns 无返回值
 */
export default function processFormulaDeps(
  key: string,
  formulaField: FormulaField,
  keyPathDepsMap: KeyPathDepsMap,
  keyPathFuncStrMap: KeyPathFuncStrMap,
  sourceRow: SourceRow,
): void {
  const scope = getScopeFromSourceRow(sourceRow)
  const formula =
    formulaField.value.length > 0
      ? formulaField.value
      : formulaField.defaultValue
  if (formula) {
    const deps = getFormulaDependencies(formula)
    if (deps.length > 0) {
      updateFormulaFunctionStr(scope, key, formula, keyPathFuncStrMap)

      const keyPath = getKeyPathFromScopeAndKey(scope, key)
      const scopeVariables = Object.keys(sourceRow)
      for (const dep of deps) {
        const depKeyPath = scopeVariables.includes(dep)
          ? getKeyPathFromScopeAndKey(scope, dep)
          : dep
        updateKeyPathDeps(keyPathDepsMap, depKeyPath, new Set([keyPath]))
        noteDependsOn(keyPathDepsMap, keyPath, depKeyPath)
      }
    }
  }
}
